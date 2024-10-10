"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  BITCOIN_NETWORK,
  ADDRESS_ZERO,
  call,
  useAtom,
  fetchJson,
  parseUnits,
  formatNumber,
  bitcoinFees,
  bitcoinUtxos,
  bitcoinSendTx,
  atomWallet,
} from "@/app/utils";
import * as btc from "@scure/btc-signer";
import Grid from "@/app/grid";
import Card from "@/app/card";
import Title from "@/app/title";
import Modal from "@/app/modal";
import ErrorCard from "@/app/errorCard";
import Input from "@/app/input";
import Button from "@/app/button";

interface TcPool {
  asset: string;
  assetPriceUSD: string;
  saversDepth: string;
  savers_fill_bps: string;
  savers_capacity_remaining: string;
  saversAPR: string;
}

export default function Home() {
  const [wallet] = useAtom(atomWallet);
  const [modal, setModal] = useState<
    undefined | { type: string; farm?: any }
  >();
  const [balance, setBalance] = useState(0);
  const [saver, setSaver] = useState({
    asset_redeem_value: "0",
    growth_pct: "0",
  });
  const [pools, setPools] = useState<[TcPool]>([]);

  useEffect(() => {
    (async () => {
      if (!wallet) return;
      if (!wallet.address) return setBalance(0);
      setBalance(await wallet.getBalance());
      setSaver(
        await fetchJson(
          `https://thornode.ninerealms.com/thorchain/pool/${wallet.chain == "bitcoin" ? "BTC.BTC" : "ETH.ETH"}/liquidity_provider/${wallet.address}`,
        ),
      );
    })();
  }, [wallet, wallet?.address]);

  useEffect(() => {
    (async () => {
      setPools(await fetchJson("https://midgard.ninerealms.com/v2/pools"));
    })();
  }, []);

  const bitcoinPool = pools.find(
    (p: { asset: string }) => p.asset === "BTC.BTC",
  );
  const ethereumPool = pools.find(
    (p: { asset: string }) => p.asset === "ETH.ETH",
  );

  const farms = [];
  if (bitcoinPool) {
    farms.push({
      logo: "/logo-btc.svg",
      name: "Bitcoin",
      symbol: "BTC",
      venue: "Thorchain Savers",
      pool: bitcoinPool,
      apy: bitcoinPool.saversAPR,
      assetPrice: parseFloat(bitcoinPool.assetPriceUSD),
      tvl: parseFloat(bitcoinPool.saversDepth),
      balanceWallet: wallet?.chain == "bitcoin" ? balance : 0,
      balanceStaked:
        wallet?.chain == "bitcoin"
          ? parseFloat(saver.asset_redeem_value) * 2
          : 0,
    });
  }
  if (ethereumPool) {
    farms.push({
      logo: "/logo-eth.svg",
      name: "Ethereum",
      symbol: "ETH",
      venue: "Thorchain Savers",
      pool: ethereumPool,
      apy: ethereumPool.saversAPR,
      assetPrice: parseFloat(ethereumPool.assetPriceUSD),
      tvl: parseFloat(ethereumPool.saversDepth),
      balanceWallet: wallet?.chain == "ethereum" ? balance : 0,
      balanceStaked:
        wallet?.chain == "ethereum"
          ? (parseFloat(saver.asset_redeem_value) / 1e8) * 2
          : 0,
    });
  }

  return (
    <div>
      <Title>Stake</Title>
      <Grid
        headers={[
          <div key="1">Asset</div>,
          <div key="2">APY</div>,
          <div key="3">TVL</div>,
          <div key="4">Wallet Balance</div>,
          <div key="5">Staked Balance</div>,
          <div key="6" className="text-right">
            Actions
          </div>,
        ]}
        rows={farms.map((f) => [
          <div className="flex items-center" key={f.name + f.venue}>
            <Image
              src={f.logo}
              className="h-8 mr-2"
              alt={f.name + " logo"}
              width={24}
              height={24}
            />
            <div className="leading-none">
              {f.name}
              <div className="opacity-50 text-xs">{f.venue}</div>
            </div>
          </div>,
          <div key="2">{formatNumber(parseFloat(f.apy) * 100, 0, 1)}%</div>,
          <div key="3" className="leading-none">
            {formatNumber(f.tvl / 1e8, 0, 0)} {f.symbol}
            <div className="opacity-50 text-sm">
              $ {formatNumber(((f.tvl / 1e8) * f.assetPrice) / 1e6, 0, 1)}M
            </div>
          </div>,
          <div key="4" className="leading-none">
            {formatNumber(f.balanceWallet)} {f.symbol}
            <div className="opacity-50 text-sm">
              $ {formatNumber(f.balanceWallet * f.assetPrice, 0, 2)}
            </div>
          </div>,
          <div key="5" className="leading-none">
            {formatNumber(f.balanceStaked)} {f.symbol}
            <div className="opacity-50 text-sm">
              $ {formatNumber(f.balanceStaked * f.assetPrice, 0, 2)}
            </div>
          </div>,
          <div key="6" className="text-right">
            <Button
              onClick={() => setModal({ type: "deposit", farm: f })}
              className=""
              title="Deposit"
            >
              <svg viewBox="0 0 24 24" className="icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </Button>
            <Button
              onClick={() => setModal({ type: "withdraw" })}
              className="text-white bg-foreground2 ml-2"
              title="Withdraw"
            >
              <svg viewBox="0 0 24 24" className="icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </Button>
          </div>,
        ])}
      />
      {modal && modal.type == "deposit" ? (
        <ModalDeposit modal={modal} setModal={setModal} wallet={wallet} />
      ) : null}
    </div>
  );
}

function ModalDeposit({
  wallet,
  modal,
  setModal,
}: {
  wallet: Wallet;
  modal: any;
  setModal: (v: undefined | any) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [pool, setPool] = useState<
    | undefined
    | {
        savers_fill_bps: string;
        savers_capacity_remaining: string;
      }
  >();

  useEffect(() => {
    (async () => {
      setPool(
        await fetchJson(
          `https://thornode.ninerealms.com/thorchain/pool/${modal.farm.pool.asset}`,
        ),
      );
    })();
  }, [modal.farm.pool.asset]);

  async function onSubmitDeposit() {
    try {
      setLoading(true);
      setError("");
      if (!wallet) {
        throw new Error("Connect a wallet first");
      }
      if (modal.farm.symbol == "BTC" && wallet.chain != "bitcoin") {
        throw new Error("Connect a Bitcoin wallet first");
      }
      if (modal.farm.symbol == "ETH" && wallet.chain != "ethereum") {
        throw new Error("Connect an Ethereum wallet first");
      }

      const inbound = (
        await fetchJson(
          "https://thornode.ninerealms.com/thorchain/inbound_addresses",
        )
      ).find((i: { chain: string }) => i.chain === wallet.symbol);

      if (inbound.halted) {
        throw new Error("Thorchain temporarily offline");
      }

      if (wallet.chain == "bitcoin") {
        const fees = await bitcoinFees();
        const parsedAmount = (parseFloat(amount) * 1e8) | 0;
        if (Number.isNaN(amount)) {
          throw new Error("Invalid amount");
        }
        const outputs = [
          { address: inbound.address, amount: BigInt(parsedAmount) },
        ];
        const utxos = await bitcoinUtxos(wallet?.address);
        const { tx } = btc.selectUTXO(utxos, outputs, "default", {
          changeAddress: wallet.address,
          feePerByte: BigInt(fees.fastestFee + 1),
          network: BITCOIN_NETWORK,
          bip69: false,
          allowUnknownOutputs: true,
          createTx: true,
        });
        if (!tx) throw new Error("Missing UTXOs to pay for transaction");
        tx.addOutput({
          amount: BigInt(0),
          script: btc.Script.encode([
            "RETURN",
            new TextEncoder().encode("+:b"),
          ]),
        });

        const hash = await bitcoinSendTx(tx);
        console.log(hash);
        // TODO toast with success & mempool link
      } else if (wallet.chain == "ethereum") {
        const parsedAmount = parseUnits(amount, 18);
        const hash = await call(
          inbound.router,
          "+$depositWithExpiry-address,address,uint256,string,uint256-",
          parsedAmount,
          inbound.address,
          ADDRESS_ZERO,
          parsedAmount,
          "+:e",
          ((Date.now() / 1000) | 0) + 300,
        );
        console.log(hash);
      }

      setAmount("");
      setError("");
      setModal(undefined);
    } catch (e: Error | any) {
      console.error(e);
      setError(e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Deposit" onClose={() => setModal(undefined)}>
      {error ? <ErrorCard className="mb-4">{error}</ErrorCard> : null}
      <Input
        className="mb-4"
        label={`Amount (${modal.farm.symbol})`}
        placeholder="0.0"
        value={amount}
        onChange={(v: string) => setAmount(v)}
        right={
          <div className="text-xs">
            Balance: {formatNumber(modal.farm.balanceWallet)}{" "}
            <a onClick={() => setAmount(modal.farm.balanceWallet.toFixed(8))}>
              Max
            </a>
          </div>
        }
      />
      <Button className="w-full" onClick={onSubmitDeposit} disabled={loading}>
        {loading ? "Depositing..." : "Deposit"}
      </Button>
      {modal.farm.pool.asset_tor_price !== "0" ? (
        <Card className="mt-4">
          <div className="flex">
            <div className="flex-1">Asset Price</div>
            <div className="font-semibold">
              $ {formatNumber(modal.farm.pool.assetPriceUSD, 0, 2)}
            </div>
          </div>
          <div className="flex">
            <div className="flex-1">TVL</div>
            <div className="font-semibold">
              ${" "}
              {formatNumber(
                (parseFloat(modal.farm.pool.assetPriceUSD) *
                  parseFloat(modal.farm.pool.saversDepth)) /
                  1e8,
                8,
                0,
              )}
            </div>
          </div>
          <div className="flex">
            <div className="flex-1">Capacity Used</div>
            <div className="font-semibold">
              {formatNumber(pool?.savers_fill_bps, 2, 2)}%
            </div>
          </div>
          <div className="flex">
            <div className="flex-1">Capacity Left</div>
            <div className="font-semibold">
              {formatNumber(pool?.savers_capacity_remaining, 8, 1)}{" "}
              {modal.farm.symbol}
            </div>
          </div>
        </Card>
      ) : null}
    </Modal>
  );
}

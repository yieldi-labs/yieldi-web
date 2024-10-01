"use client";

import { useState, useEffect } from "react";
import {
  BITCOIN_NETWORK,
  useAtom,
  fetchJson,
  formatNumber,
  bitcoinFees,
  bitcoinUtxos,
  bitcoinSendTx,
  atomBitcoinWallet,
  bitcoinBalance,
} from "@/app/utils";
import * as btc from "@scure/btc-signer";
import Grid from "@/app/grid";
import Card from "@/app/card";
import Title from "@/app/title";
import Modal from "@/app/modal";
import Error from "@/app/error";
import Input from "@/app/input";
import Button from "@/app/button";

export default function Home() {
  const [bitcoinWallet] = useAtom<null | { address: string }>(
    atomBitcoinWallet,
  );
  const [modal, setModal] = useState<undefined | { type: string }>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [saver, setSaver] = useState({
    asset_redeem_value: "0",
    growth_pct: "0",
  });
  const [pool, setPool] = useState({
    asset_tor_price: "0",
    savers_depth: "",
    savers_fill_bps: "",
    savers_capacity_remaining: "",
  });

  useEffect(() => {
    (async () => {
      if (!bitcoinWallet?.address) return setBalance(0);
      setBalance(await bitcoinBalance(bitcoinWallet.address));
      setSaver(
        await fetchJson(
          "https://thornode.ninerealms.com/thorchain/pool/BTC.BTC/saver/" +
            bitcoinWallet.address,
        ),
      );
    })();
  }, [bitcoinWallet?.address]);

  useEffect(() => {
    (async () => {
      setPool(
        (
          await fetchJson("https://thornode.ninerealms.com/thorchain/pools")
        ).find((p: { asset: string }) => p.asset === "BTC.BTC"),
      );
    })();
  }, []);

  async function onSubmitDeposit() {
    try {
      setLoading(true);
      setError("");
      const inbound = (
        await fetchJson(
          "https://thornode.ninerealms.com/thorchain/inbound_addresses",
        )
      ).find((i: { chain: string }) => i.chain === "BTC");
      const fees = await bitcoinFees();
      const parsedAmount = (parseFloat(amount) * 1e8) | 0;
      if (Number.isNaN(amount)) throw new Error("Invalid amount");
      const outputs = [
        { address: inbound.address, amount: BigInt(parsedAmount) },
      ];
      const utxos = await bitcoinUtxos(bitcoinWallet?.address);
      const { tx } = btc.selectUTXO(utxos, outputs, "default", {
        changeAddress: bitcoinWallet.address,
        feePerByte: BigInt(fees.fastestFee + 1),
        network: BITCOIN_NETWORK,
        bip69: false,
        allowUnknownOutputs: true,
        createTx: true,
      });
      if (!tx) throw new Error("Missing UTXOs to pay for transaction");
      tx.addOutput({
        amount: BigInt(0),
        script: btc.Script.encode(["RETURN", new TextEncoder().encode("+:b")]),
      });

      const hash = await bitcoinSendTx(tx);
      console.log(hash);
      // TODO toast with success & mempool link
      setAmount("");
      setError("");
      setModal(undefined);
    } catch (e) {
      console.error(e);
      setError(e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Title>Stake</Title>
      <Grid
        headers={[
          <div key="1">Asset</div>,
          <div key="2">TVL</div>,
          <div key="3">Wallet Balance</div>,
          <div key="4">Staked Balance</div>,
          <div key="5">Actions</div>,
        ]}
        rows={[
          [
            <div className="flex items-center" key="1">
              <img src="/logo-btc.svg" alt="Logo" className="h-8 mr-2" />
              <div className="leading-none">
                Bitcoin
                <div className="text-xs opacity-50">Thorchain Savers</div>
              </div>
            </div>,
            <div key="2">
              ${" "}
              {formatNumber(
                ((parseFloat(pool.asset_tor_price) / 1e8) *
                  parseFloat(pool.savers_depth)) /
                  1e8 /
                  1e6,
                8,
                1,
              )}
              M
            </div>,
            <div key="3">{formatNumber(balance)} BTC</div>,
            <div key="4">{formatNumber(saver.asset_redeem_value)} BTC</div>,
            <div key="5">
              <Button
                onClick={() => setModal({ type: "deposit" })}
                className="mr-2"
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
                className="text-white bg-foreground2"
                title="Withdraw"
              >
                <svg viewBox="0 0 24 24" className="icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </Button>
            </div>,
          ],
        ]}
      />
      {modal && modal.type == "deposit" ? (
        <Modal title="Deposit" onClose={() => setModal(undefined)}>
          {error ? <Error className="mb-4">{error}</Error> : null}
          <Input
            className="mb-4"
            label="Amount (BTC)"
            placeholder="0.0"
            value={amount}
            onChange={(v: string) => setAmount(v)}
            right={
              <div className="text-xs">
                Balance: {formatNumber(balance)}{" "}
                <a onClick={() => setAmount(balance.toFixed(8))}>Max</a>
              </div>
            }
          />
          <Button
            className="w-full"
            onClick={onSubmitDeposit}
            disabled={loading}
          >
            {loading ? "Depositing..." : "Deposit"}
          </Button>
          {pool.asset_tor_price !== "0" ? (
            <Card className="mt-4">
              <div className="flex">
                <div className="flex-1">Asset Price</div>
                <div className="font-semibold">
                  $ {formatNumber(pool.asset_tor_price, 8, 2)}
                </div>
              </div>
              <div className="flex">
                <div className="flex-1">TVL</div>
                <div className="font-semibold">
                  ${" "}
                  {formatNumber(
                    ((parseFloat(pool.asset_tor_price) / 1e8) *
                      parseFloat(pool.savers_depth)) /
                      1e8,
                    8,
                    0,
                  )}
                </div>
              </div>
              <div className="flex">
                <div className="flex-1">Capacity Used</div>
                <div className="font-semibold">
                  {formatNumber(pool.savers_fill_bps, 2, 2)}%
                </div>
              </div>
              <div className="flex">
                <div className="flex-1">Capacity Left</div>
                <div className="font-semibold">
                  {formatNumber(pool.savers_capacity_remaining, 8, 1)} BTC
                </div>
              </div>
            </Card>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

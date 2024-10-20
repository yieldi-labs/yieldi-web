"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Wallet,
  useAtom,
  atomWallet,
  formatAddress,
  formatNumber,
  bitcoinConnectInjected,
  AtomWallet,
} from "@/app/utils";
import Card from "@/app/card";
import Modal from "@/app/modal";
import Button from "@/app/button";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function WalletButton() {
  const [modal, setModal] = useState<undefined | { type: string }>();
  const [wallets] = useAtom<AtomWallet>(atomWallet);

  function onClick() {
    setModal({ type: "wallet" });
  }

  const connectedWallets = Object.values(wallets).filter(Boolean).length;

  return (
    <>
      <a
        className="flex w-48 px-7 py-3 justify-center items-center gap-2.5 flex-shrink-0 rounded-full bg-highlight
        text-gray-900 text-center font-sans text-sm font-bold leading-5"
        onClick={onClick}
      >
        {connectedWallets > 0 ? "Wallets" : "Connect Wallet"}
      </a>
      {modal && modal.type == "wallet" ? (
        <ModalWallet onClose={() => setModal(undefined)} />
      ) : null}
    </>
  );
}

function ModalWallet({ onClose }: { onClose: () => void }) {
  const [wallets, setWallets] = useAtom(atomWallet);
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ethBalance } = useBalance({ address: ethAddress });
  const { openConnectModal } = useConnectModal();

  const [btcBalance, setBtcBalance] = useState(0);

  useEffect(() => {
    async function fetchBitcoinBalance() {
      if (!wallets.bitcoin) return;
      const balance = await wallets.bitcoin.getBalance();
      setBtcBalance(balance);
    }
    fetchBitcoinBalance();
  }, [wallets.bitcoin]);

  const updateEthereumWallet = useCallback(() => {
    if (isEthConnected && ethAddress) {
      setWallets((prev: AtomWallet) => ({
        ...prev,
        ethereum: {
          chain: "ethereum",
          symbol: "ETH",
          address: ethAddress,
          getBalance: async () => Number(ethBalance?.formatted || 0),
        },
      }));
      return;
    }
    setWallets((prev: AtomWallet) => {
      const newWallets = { ...prev };
      delete newWallets.ethereum;
      return newWallets;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEthConnected, ethAddress, ethBalance]);

  useEffect(() => {
    updateEthereumWallet();
  }, [updateEthereumWallet]);

  async function onConnectBitcoin() {
    try {
      const bitcoinWallet = await bitcoinConnectInjected();
      setWallets((prev: AtomWallet) => ({ ...prev, bitcoin: bitcoinWallet }));
    } catch (error) {
      console.error("Failed to connect Bitcoin wallet:", error);
    }
  }

  function onConnectEthereum() {
    if (!openConnectModal) return;
    openConnectModal();
  }

  function onDisconnectBitcoin() {
    setWallets((prev: AtomWallet) => {
      const newWallets = { ...prev };
      delete newWallets.bitcoin;
      return newWallets;
    });
  }

  return (
    <Modal onClose={onClose} title="Wallets" style={{ maxWidth: "400px" }}>
      <WalletCard
        chain="Bitcoin"
        logo="/logo-btc.svg"
        wallet={wallets.bitcoin}
        balance={btcBalance}
        onConnect={onConnectBitcoin}
        onDisconnect={onDisconnectBitcoin}
      />
      <WalletCard
        chain="Ethereum"
        logo="/logo-eth.svg"
        wallet={wallets.ethereum}
        balance={Number(ethBalance?.formatted || 0)}
        onConnect={onConnectEthereum}
        onDisconnect={disconnect}
      />
    </Modal>
  );
}

function WalletCard({
  chain,
  logo,
  wallet,
  balance,
  onConnect,
  onDisconnect,
}: {
  chain: string;
  logo: string;
  wallet?: Wallet;
  balance: number;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <Card className="mb-4">
      <h2 className="text-center font-semibold mb-4">{chain}</h2>
      {wallet ? (
        <>
          <div className="text-center mb-2">
            {formatAddress(wallet.address)}
          </div>
          <div className="text-center mb-4">
            {formatNumber(balance, 0, 5)} {wallet.symbol}
          </div>
          <Button className="w-full" onClick={onDisconnect}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          className="w-full flex items-center justify-center"
          onClick={onConnect}
        >
          <Image
            src={logo}
            alt={`${chain} logo`}
            width={24}
            height={24}
            className="mr-2"
          />
          Connect {chain}
        </Button>
      )}
    </Card>
  );
}

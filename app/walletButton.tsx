"use client";

import { useState, useEffect } from "react";
import {
  useAtom,
  atomBitcoinWallet,
  bitcoinBalance,
  formatAddress,
  formatNumber,
  bitcoinConnectInjected,
} from "@/app/utils";
import Card from "@/app/card";
import Modal from "@/app/modal";
import Button from "@/app/button";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { disconnect } from "wagmi/actions";
import wagmiConfig from "./wagmiConfig";

export default function WalletButton() {
  const [modal, setModal] = useState<undefined | { type: string }>();
  const [bitcoinWallet, setBitcoinWallet] = useAtom(atomBitcoinWallet);
  const { openConnectModal } = useConnectModal();
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();

  function onClick() {
    setModal({ type: "walletInfo" });
  }

  async function onConnectBitcoin() {
    try {
      const wallet = await bitcoinConnectInjected();
      setBitcoinWallet(wallet);
    } catch (error) {
      console.error("Failed to connect Bitcoin wallet:", error);
    }
  }

  function onConnectEthereum() {
    if (openConnectModal) {
      openConnectModal();
    }
  }

  function onDisconnectEthereum() {
    disconnect(wagmiConfig);
  }

  const displayAddress = bitcoinWallet && isEthConnected
    ? "Wallet"
    : bitcoinWallet
    ? formatAddress(bitcoinWallet.address)
    : isEthConnected
    ? formatAddress(ethAddress)
    : "Connect Wallet";

  return (
    <>
      <a
        className="font-mono uppercase tracking-widest p-4 border-r text-sm leading-6 bg-primary cursor-pointer"
        onClick={onClick}
      >
        {displayAddress}
      </a>
      {modal && modal.type === "walletInfo" && (
        <ModalWalletInfo
          bitcoinWallet={bitcoinWallet}
          ethAddress={ethAddress}
          onClose={() => setModal(undefined)}
          setBitcoinWallet={setBitcoinWallet}
          onConnectBitcoin={onConnectBitcoin}
          onConnectEthereum={onConnectEthereum}
          onDisconnectEthereum={onDisconnectEthereum}
        />
      )}
    </>
  );
}

function ModalWalletInfo({
  bitcoinWallet,
  ethAddress,
  onClose,
  setBitcoinWallet,
  onConnectBitcoin,
  onConnectEthereum,
  onDisconnectEthereum,
}: {
  bitcoinWallet: { address: string } | null;
  ethAddress: string | undefined;
  onClose: () => void;
  setBitcoinWallet: (_: undefined | object) => void;
  onConnectBitcoin: () => void;
  onConnectEthereum: () => void;
  onDisconnectEthereum: () => void;
}) {
  const [btcBalance, setBtcBalance] = useState(0);
  const { data: ethBalance } = useBalance({
    address: ethAddress,
  });

  useEffect(() => {
    if (bitcoinWallet) {
      (async () => {
        setBtcBalance(await bitcoinBalance(bitcoinWallet.address));
      })();
    }
  }, [bitcoinWallet]);

  function onDisconnectBitcoin() {
    setBitcoinWallet(undefined);
  }

  return (
    <Modal
      onClose={onClose}
      title="Wallet"
      style={{ maxWidth: "360px" }}
    >
      {bitcoinWallet ? (
        <Card className="mb-4">
          <h2 className="text-center font-semibold mb-2">Bitcoin Wallet</h2>
          <div className="text-center mb-2">{formatAddress(bitcoinWallet.address)}</div>
          <div className="text-center">{formatNumber(btcBalance, 0, 5)} BTC</div>
          <Button className="w-full mt-4" onClick={onDisconnectBitcoin}>
            Disconnect Bitcoin Wallet
          </Button>
        </Card>
      ) : (
        <Button className="w-full mb-4" onClick={onConnectBitcoin}>
          Connect Bitcoin Wallet
        </Button>
      )}
      {ethAddress ? (
        <Card className="mb-4">
          <h2 className="text-center font-semibold mb-2">Ethereum Wallet</h2>
          <div className="text-center mb-2">{formatAddress(ethAddress)}</div>
          <div className="text-center">{ethBalance ? formatNumber(parseFloat(ethBalance.formatted), 18, 4) : '0'} ETH</div>
          <Button className="w-full mt-4" onClick={onDisconnectEthereum}>
            Disconnect Ethereum Wallet
          </Button>
        </Card>
      ) : (
        <Button className="w-full mb-4" onClick={onConnectEthereum}>
          Connect Ethereum Wallet
        </Button>
      )}
      <Button className="w-full" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
}
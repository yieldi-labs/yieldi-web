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

export default function WalletButton() {
  const [modal, setModal] = useState<undefined | { type: string }>();
  const [bitcoinWallet, setBitcoinWallet] = useAtom(atomBitcoinWallet);

  function onClick() {
    if (bitcoinWallet) {
      setModal({ type: "bitcoinWallet" });
    } else {
      setModal({ type: "selectWallet" });
    }
  }

  async function onConnectBitcoin() {
    try {
      setModal(undefined);
      const wallet = await bitcoinConnectInjected();
      setBitcoinWallet(wallet);
    } catch (error) {
      console.error("Failed to connect Bitcoin wallet:", error);
    }
  }

  function onConnectEthereum() {
    alert('Metamask');
    setModal(undefined);
  }

  return (
    <>
      <a
        className="font-mono uppercase tracking-widest p-4 border-r text-sm leading-6 bg-primary cursor-pointer"
        onClick={onClick}
      >
        {bitcoinWallet
          ? formatAddress(bitcoinWallet.address)
          : "Connect Wallet"}
      </a>
      {modal && modal.type === "bitcoinWallet" && (
        <ModalBitcoinWallet
          address={bitcoinWallet.address}
          onClose={() => setModal(undefined)}
          setBitcoinWallet={setBitcoinWallet}
        />
      )}
      {modal && modal.type === "selectWallet" && (
        <ModalSelectWallet
          onClose={() => setModal(undefined)}
          onConnectBitcoin={onConnectBitcoin}
          onConnectEthereum={onConnectEthereum}
        />
      )}
    </>
  );
}

function ModalBitcoinWallet({
  address,
  onClose,
  setBitcoinWallet,
}: {
  address: string;
  onClose: () => void;
  setBitcoinWallet: (_: undefined | object) => void;
}) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      setBalance(await bitcoinBalance(address));
    })();
  }, [address]);

  function onDisconnect() {
    onClose();
    setBitcoinWallet(undefined);
  }

  return (
    <Modal
      onClose={onClose}
      title="Bitcoin Wallet"
      style={{ maxWidth: "360px" }}
    >
      <Card className="mb-4">
        <h2 className="text-center font-semibold mb-4">
          {formatAddress(address)}
        </h2>
        <div className="text-center">{formatNumber(balance, 0, 5)} BTC</div>
      </Card>
      <Button className="w-full" onClick={onDisconnect}>
        Disconnect
      </Button>
    </Modal>
  );
}

function ModalSelectWallet({
  onClose,
  onConnectBitcoin,
  onConnectEthereum,
}: {
  onClose: () => void;
  onConnectBitcoin: () => void;
  onConnectEthereum: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title="Select Wallet"
      style={{ maxWidth: "360px" }}
    >
      <Button className="w-full mb-4" onClick={onConnectBitcoin}>
        Connect Bitcoin Wallet
      </Button>
      <Button className="w-full" onClick={onConnectEthereum}>
        Connect Ethereum Wallet
      </Button>
    </Modal>
  );
}
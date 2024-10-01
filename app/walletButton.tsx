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
      return;
    }
    onConnectBitcoin();
  }

  async function onConnectBitcoin() {
    const wallet = await bitcoinConnectInjected();
    setBitcoinWallet(wallet);
  }

  return (
    <>
      <a
        className="uppercase tracking-widest p-4 border-r text-sm leading-6 bg-primary cursor-pointer"
        onClick={onClick}
      >
        {bitcoinWallet
          ? formatAddress(bitcoinWallet.address)
          : "Connect Wallet"}
      </a>
      {modal && modal.type == "bitcoinWallet" ? (
        <ModalBitcoinWallet
          address={bitcoinWallet.address}
          onClose={() => setModal(undefined)}
          setBitcoinWallet={setBitcoinWallet}
        />
      ) : null}
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

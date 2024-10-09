"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  useAtom,
  atomWallet,
  formatAddress,
  formatNumber,
  bitcoinConnectInjected,
  ethereumConnectInjected,
} from "@/app/utils";
import Card from "@/app/card";
import Modal from "@/app/modal";
import Button from "@/app/button";

export default function WalletButton() {
  const [modal, setModal] = useState<undefined | { type: string }>();
  const [wallet, setWallet] = useAtom(atomWallet);

  function onClick() {
    if (wallet) {
      setModal({ type: "wallet" });
      return;
    }
    setModal({ type: "pickChain" });
  }

  async function onConnectBitcoin() {
    setModal(undefined);
    const wallet = await bitcoinConnectInjected();
    setWallet(wallet);
  }

  async function onConnectEthereum() {
    setModal(undefined);
    const wallet = await ethereumConnectInjected();
    setWallet(wallet);
  }

  return (
    <>
      <a
        className="flex w-[182px] px-7 py-[13px] justify-center items-center gap-2.5 flex-shrink-0 rounded-[50px] bg-[#007D98]
        text-white text-center font-sans text-sm font-bold leading-5"
        onClick={onClick}
      >
        {wallet ? formatAddress(wallet.address) : "Connect Wallet"}
      </a>
      {modal && modal.type == "pickChain" ? (
        <Modal
          title="Connect Wallet"
          onClose={() => setModal(undefined)}
          style={{ maxWidth: 360 }}
        >
          <Button
            className="w-full flex items-center text-left mt-2"
            onClick={onConnectBitcoin}
          >
            <Image
              src="/logo-btc.svg"
              className="icon mr-2"
              alt="Bitcoin Logo"
              height={24}
              width={24}
            />{" "}
            Bitcoin
          </Button>
          <Button
            className="w-full flex items-center text-left mt-2"
            onClick={onConnectEthereum}
          >
            <Image
              src="/logo-eth.svg"
              className="icon mr-2"
              alt="Bitcoin Logo"
              height={24}
              width={24}
            />{" "}
            Ethereum
          </Button>
        </Modal>
      ) : null}
      {modal && modal.type == "wallet" ? (
        <ModalWallet
          wallet={wallet!}
          onClose={() => setModal(undefined)}
          setWallet={setWallet}
        />
      ) : null}
    </>
  );
}

function ModalWallet({
  wallet,
  onClose,
  setWallet,
}: {
  wallet: Wallet;
  onClose: () => void;
  setWallet: (_: undefined | object) => void;
}) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      setBalance(await wallet.getBalance());
    })();
  }, [wallet]);

  function onDisconnect() {
    onClose();
    setWallet(undefined);
  }

  return (
    <Modal
      onClose={onClose}
      title="Bitcoin Wallet"
      style={{ maxWidth: "360px" }}
    >
      <Card className="mb-4">
        <h2 className="text-center font-semibold mb-4">
          {formatAddress(wallet?.address)}
        </h2>
        <div className="text-center">
          {formatNumber(balance, 0, 5)} {wallet.symbol}
        </div>
      </Card>
      <Button className="w-full" onClick={onDisconnect}>
        Disconnect
      </Button>
    </Modal>
  );
}

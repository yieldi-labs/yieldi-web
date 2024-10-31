"use client";
import { useEffect, useState } from "react";
import Modal from "@/app/modal";
import WalletList from "./WalletList";
import { useAppState } from "@/utils/context";
import { chainConfig } from "@/utils/wallet/chainConfig";
import { ChainSelector } from "./ChainSelector";
import HardwareWallets from "./HardwareWallets";
import { useWalletList, useWalletConnection } from "@/hooks";
import { IconSvg } from "@/svg";

export default function WalletModal() {
  const [isHWDisabled, setIsHWDisabled] = useState(false);
  const [showHardwareWallets, setShowHardwareWallets] = useState(false);
  const { toggleWalletModal, isWalletModalOpen, setWalletState } =
    useAppState();
  const { selectedChain, setSelectedChain, handleConnect, detectedWallets } =
    useWalletConnection(setWalletState, toggleWalletModal);
  const { detected, undetected, isWalletValidForChain } = useWalletList(
    selectedChain,
    detectedWallets,
  );

  useEffect(() => {
    console.log("WalletModal");
    switch (selectedChain) {
      case "solana":
      case "kujira":
      case "mayachain":
      case "binance-smart-chain":
        setIsHWDisabled(true);
        break;
      default:
        setIsHWDisabled(false);
    }
  }, [selectedChain]);

  const handleHardwareWalletSelect = async (wallet: any) => {
    setWalletState(wallet);
  };

  if (!isWalletModalOpen) return null;

  return (
    <Modal onClose={toggleWalletModal} title="Connect Wallet">
      <div className="flex flex-col gap-4">
        <ChainSelector
          chains={chainConfig}
          selectedChain={selectedChain}
          onChainSelect={setSelectedChain}
        />

        {!showHardwareWallets ? (
          <>
            <WalletList
              detected={detected}
              undetected={undetected}
              isWalletValidForChain={isWalletValidForChain}
              onWalletSelect={handleConnect}
            />
            <div
              onClick={() => setShowHardwareWallets(true)}
              className="flex items-center justify-between bg-white rounded-2xl p-4 border-transparent hover:border-primary cursor-pointer border-[2px] transition-all duration-75"
            >
              <h3 className="text-[14px] text-neutral-900 font-medium font-gt-america">
                Hardware Wallets
              </h3>
              <IconSvg.Wallet />
            </div>
          </>
        ) : (
          <HardwareWallets
            onBack={() => setShowHardwareWallets(false)}
            onWalletSelect={handleHardwareWalletSelect}
            selectedChain={selectedChain}
            isDisabled={isHWDisabled}
          />
        )}

        <p className="text-neutral-600 text-sm mt-2 max-w-[390px]">
          By connecting a wallet, you agree to Yieldi&apos;s Terms of Use and
          Privacy Policy
        </p>
      </div>
    </Modal>
  );
}

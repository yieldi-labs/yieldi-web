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
import { twMerge } from "tailwind-merge";

export default function WalletModal() {
  const [isHWDisabled, setIsHWDisabled] = useState(false);
  const [showHardwareWallets, setShowHardwareWallets] = useState(false);
  const { toggleWalletModal, isWalletModalOpen, setWalletState } =
    useAppState();
  const {
    selectedChain,
    detectedWallets,
    handleSelectChain,
    handleConnect,
    setSelectedChain,
  } = useWalletConnection(setWalletState, toggleWalletModal);
  const { detected, undetected, isWalletValidForChain } = useWalletList(
    selectedChain,
    detectedWallets
  );

  useEffect(() => {
    const restrictedChains = ["solana", "kujira", "binance-smart-chain"];
    if (selectedChain.some((chain) => restrictedChains.includes(chain))) {
      setIsHWDisabled(true);
    } else {
      setIsHWDisabled(false);
    }
  }, [selectedChain]);

  const handleHardwareWalletSelect = async (wallet: any) =>
    setWalletState(wallet);

  if (!isWalletModalOpen) return null;

  const handleSelectDeSelect =
    selectedChain.length !== 9
      ? () =>
          setSelectedChain([
            "bitcoin",
            "ethereum",
            "binance-smart-chain",
            "avalanche",
            "dogecoin",
            "bitcoincash",
            "litecoin",
            "thorchain",
            "solana",
          ])
      : () => setSelectedChain([]);

  return (
    <Modal onClose={toggleWalletModal} title="Connect Wallet">
      <div className="flex flex-col gap-4">
        <ChainSelector
          chains={chainConfig}
          selectedChain={selectedChain}
          onChainSelect={handleSelectChain}
          handleDeselect={handleSelectDeSelect}
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
              className={twMerge(
                "flex items-center justify-between",
                "bg-white rounded-2xl p-4",
                "border-2 border-transparent",
                "hover:border-primary cursor-pointer",
                "transition-all duration-75"
              )}
            >
              <h3 className="text-sm text-neutral-900 font-medium font-gt-america">
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

        <p className="text-sm text-neutral-600 mt-2 max-w-[390px]">
          By connecting a wallet, you agree to Yieldi&apos;s Terms of Use and
          Privacy Policy
        </p>
      </div>
    </Modal>
  );
}

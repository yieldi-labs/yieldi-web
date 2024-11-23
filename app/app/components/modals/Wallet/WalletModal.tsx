"use client";
import { useState } from "react";
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
  const [showHardwareWallets, setShowHardwareWallets] = useState(false);
  const { toggleWalletModal, isWalletModalOpen, setWalletState } =
    useAppState();
  const { selectedChains, detectedWallets, setSelectedChains, handleConnect } =
    useWalletConnection(setWalletState, toggleWalletModal);
  const { detected, undetected, isWalletValidForChain } = useWalletList(
    selectedChains,
    detectedWallets
  );
  const [selectedWallet, setSelectedWallet] = useState<WalletOption>();

  const isHWDisabled = selectedChains.some((chain) =>
    ["solana", "kujira", "binance-smart-chain"].includes(chain)
  );

  const handleWalletSelect = (wallet: WalletOption): void => {
    const [walletId] = wallet.id.split("-");
    setSelectedWallet(wallet);
    const validChains = chainConfig
      .filter(
        ({ wallets }) =>
          wallets.findIndex(({ id }) => {
            const [itemId] = id.split("-");
            return walletId === itemId;
          }) >= 0
      )
      .map(({ id }) => id);

    setSelectedChains(validChains);
  };

  const handleConnectWallet = () => {
    if (selectedWallet) handleConnect(selectedWallet);
  };

  const handleHardwareWalletSelect = async (wallet: any) =>
    setWalletState(wallet);

  if (!isWalletModalOpen) return null;

  return (
    <Modal onClose={toggleWalletModal} title="Connect Wallet">
      <div className="flex flex-col gap-4">
        <ChainSelector
          chains={chainConfig}
          selectedChains={selectedChains}
          onChainSelect={setSelectedChains}
        />
        {!showHardwareWallets ? (
          <>
            <WalletList
              detected={detected}
              undetected={undetected}
              isWalletValidForChain={isWalletValidForChain}
              onWalletSelect={handleWalletSelect}
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
            selectedChains={selectedChains}
            isDisabled={isHWDisabled}
          />
        )}
        <button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8 
                   disabled:opacity-50 transition-opacity"
          disabled={!selectedWallet}
          onClick={handleConnectWallet}
        >
          Connect
        </button>
        <p className="text-sm text-neutral-600 mt-2 max-w-[390px]">
          By connecting a wallet, you agree to Yieldi&apos;s Terms of Use and
          Privacy Policy
        </p>
      </div>
    </Modal>
  );
}

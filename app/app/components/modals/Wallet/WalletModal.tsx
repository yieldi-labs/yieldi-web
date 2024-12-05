"use client";
import { useState } from "react";
import Modal from "@/app/modal";
import WalletList from "./WalletList";
import { useAppState } from "@/utils/context";
import { ChainSelector } from "./ChainSelector";
import { useWalletList, useWalletConnection } from "@/hooks";
import { IconSvg } from "@/svg";
import { twMerge } from "tailwind-merge";
import HardwareWallets from "./HardwareWallets";
import {
  ConnectedWalletsState,
  WalletState,
  WalletType,
} from "@/utils/interfaces";
import { ChainKey, CHAINS } from "@/utils/wallet/constants";

export default function WalletModal() {
  const [showHardwareWallets, setShowHardwareWallets] = useState(false);
  const {
    toggleWalletModal,
    isWalletModalOpen,
    setWalletsState,
    selectedWallet,
    setSelectedWallet,
    setSelectedChains,
  } = useAppState();
  const { selectedChains, handleConnect } = useWalletConnection();
  const { detected, undetected, isWalletValidForChain } = useWalletList();

  const isHWDisabled = selectedChains.some((chain) =>
    [ChainKey.SOLANA, ChainKey.KUJIRA, ChainKey.BSCCHAIN].includes(chain.name)
  );
  const handleWalletSelect = (wallet: WalletType): void => {
    const validChains = wallet.chains;
    if (!selectedChains.length || selectedWallet) {
      if (selectedWallet === wallet) {
        setSelectedChains([]);
        setSelectedWallet(undefined);
      } else {
        setSelectedChains(
          CHAINS.filter(({ name }) => validChains.includes(name))
        );
        setSelectedWallet(wallet);
      }
    } else {
      setSelectedWallet(wallet);
    }
  };

  const handleConnectWallet = () => {
    if (selectedWallet) handleConnect(selectedWallet);
  };

  const handleHardwareWalletSelect = async (wallet: any) => {
    setWalletsState(((prevState: ConnectedWalletsState) => ({
      ...prevState,
      [wallet.chain]: {
        ...(wallet as WalletState),
      },
    })) as unknown as ConnectedWalletsState);
  };

  if (!isWalletModalOpen) return null;

  return (
    <Modal onClose={toggleWalletModal} title="Connect Wallet">
      <div className="flex flex-col gap-4">
        <ChainSelector
          chains={CHAINS}
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

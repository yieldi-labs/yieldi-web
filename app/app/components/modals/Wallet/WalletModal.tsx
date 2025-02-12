"use client";
import { useState } from "react";
import Modal from "@/app/modal";
import WalletList from "./WalletList";
import { useAppState } from "@/utils/contexts/context";
import { ChainSelector } from "./ChainSelector";
import { useWalletConnection } from "@/hooks";
import { IconSvg } from "@/svg";
import { twMerge } from "tailwind-merge";
import HardwareWallets from "./HardwareWallets";
import { WalletType } from "@/utils/interfaces";
import {
  ChainKey,
  CHAINS,
  SUPPORTED_WALLETS,
  WalletKey,
} from "@/utils/wallet/constants";
import { isWalletValidForAllChains } from "@/utils/wallet/utils";
import { showToast, ToastType } from "@/app/errorToast";

export default function WalletModal() {
  const [showHardwareWallets, setShowHardwareWallets] = useState(false);
  const {
    toggleWalletModal,
    isWalletModalOpen,
    setSelectedWallet,
    setSelectedChains,
    detected,
    undetected,
    selectedWallet,
    selectedChains,
  } = useAppState();
  const { handleConnect } = useWalletConnection();

  const isHWDisabled = selectedChains.some((chain) =>
    [ChainKey.BSCCHAIN].includes(chain.name),
  );
  const handleWalletSelect = (wallet: WalletType): void => {
    const validChains = wallet.chains;
    if (selectedWallet === wallet && selectedChains.length > 0) {
      setSelectedWallet(undefined);
      setSelectedChains([]);
    } else if (selectedChains.length <= 0 && wallet.hasSupportMultichain) {
      setSelectedChains(
        CHAINS.filter(({ name }) => validChains.includes(name)),
      );
      setSelectedWallet(wallet);
    } else {
      setSelectedWallet(wallet);
    }
  };

  const handleConnectWallet = async () => {
    if (!selectedWallet) return; // Evita ejecutar si no hay wallet seleccionada

    try {
      await handleConnect(selectedWallet);
    } catch (error) {
      console.error(error);
      showToast({
        type: ToastType.ERROR,
        text: "Failed to connect the wallet. Please try again.",
      });
    }
  };

  if (!isWalletModalOpen) return null;

  return (
    <Modal onClose={toggleWalletModal} title="Connect Wallet">
      <div className="flex flex-col gap-4">
        <ChainSelector
          blockUnselect={
            selectedWallet
              ? !SUPPORTED_WALLETS[selectedWallet?.id].hasSupportToSelectChains
              : false
          }
          chains={CHAINS}
          selectedChains={selectedChains}
          onChainSelect={setSelectedChains}
          enableMultiselect={
            selectedWallet
              ? SUPPORTED_WALLETS[selectedWallet?.id].hasSupportMultichain
              : true
          }
        />
        {!showHardwareWallets ? (
          <>
            <WalletList
              detected={detected}
              undetected={undetected}
              selectedWallet={selectedWallet}
              selectedChains={selectedChains}
              isWalletValidForChain={isWalletValidForAllChains}
              onWalletSelect={handleWalletSelect}
            />
            { !process.env.NEXT_PUBLIC_IS_STAGENET && 
              <div
                onClick={() => {
                  handleWalletSelect(SUPPORTED_WALLETS[WalletKey.LEDGER]);
                  setShowHardwareWallets(true);
                }}
                className={twMerge(
                  "flex items-center justify-between",
                  "bg-white rounded-2xl p-4",
                  "border-2 border-transparent",
                  "hover:border-primary cursor-pointer",
                  "transition-all duration-75",
                )}
              >
                <h3 className="text-sm text-neutral-900 font-medium font-gt-america">
                  Hardware Wallets
                </h3>
                <IconSvg.Wallet />
              </div>
            }
          </>
        ) : (
          <HardwareWallets
            onBack={() => {
              setSelectedWallet(undefined);
              setShowHardwareWallets(false);
            }}
            selectedChains={selectedChains}
            isDisabled={isHWDisabled}
          />
        )}
        <button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-4 
                   disabled:opacity-50 transition-opacity"
          disabled={!selectedWallet}
          onClick={handleConnectWallet}
        >
          Connect
        </button>
        <p className="text-sm text-neutral-600 mt-2 text-center w-full">
          By connecting a wallet, you agree to Yieldi&apos;s Terms of Use and
          Privacy Policy
        </p>
      </div>
    </Modal>
  );
}

import { ChainType, WalletType } from "@/utils/interfaces";
import React from "react";
import Wallet from "./Wallet";

interface WalletSectionProps {
  title: string;
  wallets: WalletType[];
  selectedChains: ChainType[];
  selectedWallet?: WalletType;
  isWalletValidForChain: (
    wallet: WalletType,
    selectedChains: ChainType[],
  ) => boolean;
  onWalletSelect: (wallet: WalletType) => void;
}

export function WalletSection({
  title,
  wallets,
  selectedChains = [],
  selectedWallet,
  isWalletValidForChain,
  onWalletSelect,
}: WalletSectionProps) {
  const handleWalletSelect = (wallet: WalletType) => {
    if (wallet.isAvailable) {
      onWalletSelect(wallet);
    } else {
      window.open(wallet.downloadUrl, "_blank");
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm text-neutral-600 font-gt-america">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        {wallets.filter(wallet => !wallet.isHardware).map((wallet) => (
          <Wallet
            key={wallet.id}
            wallet={wallet}
            disabled={selectedWallet && selectedWallet.id !== wallet.id}
            isSupported={isWalletValidForChain(wallet, selectedChains)}
            onSelect={() => handleWalletSelect(wallet)}
            isSelected={wallet.id === selectedWallet?.id}
          />
        ))}
      </div>
    </div>
  );
}

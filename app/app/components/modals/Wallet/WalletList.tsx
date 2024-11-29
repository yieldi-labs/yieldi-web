import { useState } from "react";
import Wallet from "./Wallet";
import { WalletType } from "@/utils/interfaces";
import { SUPPORTED_WALLETS } from "@/utils/wallet/constants";

interface WalletListProps {
  detected: WalletType[];
  undetected: WalletType[];
  isWalletValidForChain: (wallet: WalletType) => boolean;
  onWalletSelect: (wallet: WalletType) => void;
}

interface WalletSectionProps {
  title: string;
  wallets: WalletType[];
  isWalletValidForChain: (wallet: WalletType) => boolean;
  onWalletSelect: (wallet: WalletType) => void;
}

const WalletList = ({
  isWalletValidForChain,
  onWalletSelect,
}: WalletListProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-base text-neutral-900 font-medium font-gt-america">
      Select Wallet
    </h3>
    <WalletSection
      title="Detected"
      wallets={
        Object.values(SUPPORTED_WALLETS)
          .filter((wallet) => wallet.isAvailable)
          .sort((a, b) => a.id.localeCompare(b.id)) as WalletType[]
      }
      isWalletValidForChain={isWalletValidForChain}
      onWalletSelect={onWalletSelect}
    />

    <WalletSection
      title="Other"
      wallets={
        Object.values(SUPPORTED_WALLETS)
          .filter((wallet) => !wallet.isAvailable)
          .sort((a, b) => a.id.localeCompare(b.id)) as WalletType[]
      }
      isWalletValidForChain={isWalletValidForChain}
      onWalletSelect={onWalletSelect}
    />
  </div>
);

function WalletSection({
  title,
  wallets,
  isWalletValidForChain,
  onWalletSelect,
}: WalletSectionProps) {
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const handleWalletSelect = (wallet: WalletType) => {
    if (wallet.isAvailable) {
      setSelectedWalletId(wallet.id);
      onWalletSelect(wallet);
    } else {
      window.open(wallet.downloadUrl, "_blank");
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm text-neutral-600 font-gt-america">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <Wallet
            key={wallet.id}
            wallet={wallet}
            isSupported={isWalletValidForChain(wallet)}
            onSelect={() => handleWalletSelect(wallet)}
            className={`${
              wallet.id === selectedWalletId
                ? "border-primary"
                : "border-transparent"
            } `}
          />
        ))}
      </div>
    </div>
  );
}

export default WalletList;

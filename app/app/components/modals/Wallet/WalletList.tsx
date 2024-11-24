import { useState } from "react";
import Wallet from "./Wallet";

interface WalletListProps {
  detected: WalletOption[];
  undetected: WalletOption[];
  isWalletValidForChain: (name: string) => boolean;
  onWalletSelect: (wallet: WalletOption) => void;
}

interface WalletSectionProps {
  title: string;
  wallets: WalletOption[];
  isWalletValidForChain: (name: string) => boolean;
  onWalletSelect: (wallet: WalletOption) => void;
}

const WalletList = ({
  detected,
  undetected,
  isWalletValidForChain,
  onWalletSelect,
}: WalletListProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-base text-neutral-900 font-medium font-gt-america">
      Select Wallet
    </h3>

    {detected.length > 0 && (
      <WalletSection
        title="Detected"
        wallets={detected.sort((a, b) => a.name.localeCompare(b.name))}
        isWalletValidForChain={isWalletValidForChain}
        onWalletSelect={onWalletSelect}
      />
    )}

    {undetected.length > 0 && (
      <WalletSection
        title="Other"
        wallets={undetected.sort((a, b) => a.name.localeCompare(b.name))}
        isWalletValidForChain={isWalletValidForChain}
        onWalletSelect={onWalletSelect}
      />
    )}
  </div>
);

function WalletSection({
  title,
  wallets,
  isWalletValidForChain,
  onWalletSelect,
}: WalletSectionProps) {
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const handleWalletSelect = (wallet: WalletOption) => {
    if (title != "Other") {
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
            isSupported={isWalletValidForChain(wallet.name)}
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

import Wallet from "./Wallet";

import { SUPPORTED_WALLETS } from "@/utils/wallet/constants";
import { WalletType } from "@/utils/interfaces";
import { useAppState } from "@/utils/context";

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
}: WalletListProps) => {
  const sortedWallets = Object.values(SUPPORTED_WALLETS).sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const { detectedWallets, otherWallets } = sortedWallets.reduce(
    (groups, wallet) => {
      if (wallet.isAvailable) {
        groups.detectedWallets.push(wallet as WalletType);
      } else {
        groups.otherWallets.push(wallet as WalletType);
      }
      return groups;
    },
    { detectedWallets: [] as WalletType[], otherWallets: [] as WalletType[] }
  );

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base text-neutral-900 font-medium font-gt-america">
        Select Wallet
      </h3>
      <WalletSection
        title="Detected"
        wallets={detectedWallets}
        isWalletValidForChain={isWalletValidForChain}
        onWalletSelect={onWalletSelect}
      />
      <WalletSection
        title="Other"
        wallets={otherWallets}
        isWalletValidForChain={isWalletValidForChain}
        onWalletSelect={onWalletSelect}
      />
    </div>
  );
};

function WalletSection({
  title,
  wallets,
  isWalletValidForChain,
  onWalletSelect,
}: WalletSectionProps) {
  const { selectedWallet } = useAppState();
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
        {wallets.map((wallet) => (
          <Wallet
            key={wallet.id}
            wallet={wallet}
            isSupported={isWalletValidForChain(wallet)}
            onSelect={() => handleWalletSelect(wallet)}
            className={`${
              wallet.id === selectedWallet?.id
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

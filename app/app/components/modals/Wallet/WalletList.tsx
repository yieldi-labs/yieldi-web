import { ChainType, WalletType } from "@/utils/interfaces";
import { WalletSection } from "./WalletSection";

interface WalletListProps {
  detected: WalletType[];
  undetected: WalletType[];
  isWalletValidForChain: (
    wallet: WalletType,
    selectedChains: ChainType[],
  ) => boolean;
  selectedWallet?: WalletType;
  selectedChains: ChainType[];
  onWalletSelect: (wallet: WalletType) => void;
}

const WalletList = ({
  isWalletValidForChain,
  onWalletSelect,
  selectedChains,
  selectedWallet,
  detected,
  undetected,
}: WalletListProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-base text-neutral-900 font-medium font-gt-america">
      Select Wallet
    </h3>
    {detected.length > 0 && (
      <WalletSection
        title="Detected"
        selectedWallet={selectedWallet}
        selectedChains={selectedChains}
        wallets={
          detected.sort((a, b) => a.id.localeCompare(b.id)) as WalletType[]
        }
        isWalletValidForChain={isWalletValidForChain}
        onWalletSelect={onWalletSelect}
      />
    )}

    <WalletSection
      title="Other"
      selectedWallet={selectedWallet}
      selectedChains={selectedChains}
      wallets={
        undetected.sort((a, b) => a.id.localeCompare(b.id)) as WalletType[]
      }
      isWalletValidForChain={isWalletValidForChain}
      onWalletSelect={onWalletSelect}
    />
  </div>
);

export default WalletList;

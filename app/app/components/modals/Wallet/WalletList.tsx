import Wallet from "./Wallet";

interface WalletListProps {
  wallets: WalletOption[];
  onWalletSelect: (wallet: WalletOption) => void;
}

interface WalletSectionProps {
  title: string;
  wallets: WalletOption[];
  onWalletSelect: (wallet: WalletOption) => void;
}

const WalletList = ({
  wallets,
  onWalletSelect,
}: WalletListProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-base text-neutral-900 font-medium font-gt-america">
      Select Wallet
    </h3>

    <WalletSection
      title="Wallets"
      wallets={wallets}
      onWalletSelect={onWalletSelect}
    />
  </div>
);

function WalletSection({
  title,
  wallets,
  onWalletSelect,
}: WalletSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm text-neutral-600 font-gt-america">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <Wallet
            key={wallet.id}
            wallet={wallet}
            onSelect={() => onWalletSelect(wallet)}
          />
        ))}
      </div>
    </div>
  );
}

export default WalletList;

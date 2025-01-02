import { IconSvg } from "@/svg";
import { ChainType } from "@/utils/interfaces";
import { SUPPORTED_WALLETS, WalletKey } from "@/utils/wallet/constants";
import Wallet from "./Wallet";

interface HardwareWalletsProps {
  onBack: () => void;
  selectedChains: ChainType[];
  isDisabled: boolean;
}

export default function HardwareWallets({
  onBack,
}: HardwareWalletsProps) {

  const wallet = SUPPORTED_WALLETS[WalletKey.LEDGER]

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-900 font-medium"
      >
        <IconSvg.ChevronLeft />
        Hardware Wallets
      </button>

      <div className="grid grid-cols-2 gap-4">
        <Wallet
          key={wallet.id}
          wallet={wallet}
          isSupported
          isSelected
        />
      </div>
    </div>
  );
}

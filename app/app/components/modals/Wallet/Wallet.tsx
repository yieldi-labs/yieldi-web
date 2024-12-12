import { WalletType } from "@/utils/interfaces";
import { cloneElement } from "react";

interface WalletProps {
  wallet: WalletType;
  isSupported: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  isSelected: boolean;
}

const Wallet = ({
  wallet,
  disabled = false,
  isSupported,
  isSelected,
  onSelect,
}: WalletProps) => {
  return (
    <button
      className={`
        bg-white p-[12px] flex gap-4 items-center border-[2px] rounded-2xl 
        transition-all duration-75 min-h-[58px]
          
        ${
          isSupported && !disabled
            ? "opacity-100 cursor-pointer hover:border-primary"
            : "opacity-50 cursor-not-allowed hover:border-transparent"
        }
        ${
          isSelected
            ? "border-primary"
            : "border-transparent"
        } 
      `}
      onClick={() => isSupported && !disabled && onSelect && onSelect()}
    >
      {cloneElement(wallet.icon, {
        className: "w-[30px]",
      })}
      <div className="flex flex-col items-start">
        <span className="text-neutral-900 font-gt-america font-medium text-[14px]">
          {wallet.name}
        </span>
      </div>
    </button>
  );
};

export default Wallet;

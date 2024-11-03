import { cloneElement } from "react";

interface WalletProps {
  wallet: WalletOption;
  isSupported: boolean;
  onSelect: () => void;
}

const Wallet = ({ wallet, isSupported, onSelect }: WalletProps) => (
  <button
    className={`
        bg-white p-[12px] flex gap-4 items-center border-[2px] rounded-2xl 
        transition-all duration-75 min-h-[58px]
        border-transparent hover:border-primary
        ${!wallet.disabled ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed hover:border-transparent"}
      `}
    onClick={onSelect}
    disabled={!isSupported || wallet.disabled}
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

export default Wallet;

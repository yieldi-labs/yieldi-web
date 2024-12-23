import { Exit, Eye, Plus, Synchronize } from "@/svg/icons";
import React from "react";

interface WalletDrawerHeaderProps {
  onHiddeBalance: () => void;
  onRefresh: () => void;
  onAddWallet: () => void;
  onDiconnect: () => void;
  enableAddConnection: boolean;
}

export default function WalletDrawerHeader({
  onHiddeBalance,
  onRefresh,
  onAddWallet,
  onDiconnect,
  enableAddConnection,
}: WalletDrawerHeaderProps) {
  return (
    <div className="flex justify-between w-full md:mb-2">
      <div className="flex">
        <span className="inline-flex items-center w-full font-medium leading-6 pr-2 md:px-4 text-2xl">
          Wallet
        </span>
        <span
          onClick={onHiddeBalance}
          className="cursor-pointer my-auto p- rounded-full transition-all transform hover:scale-110 active:scale-95"
        >
          <Eye strokeColor="#627eea" strokeWidth={1.5} />
        </span>
        <span
          className="cursor-pointer my-auto p-2 rounded-full transition-all transform hover:scale-110 active:scale-95"
          onClick={onRefresh}
        >
          <Synchronize strokeColor="#627eea" strokeWidth={1.5} />
        </span>
      </div>
      <div className="flex">
        {enableAddConnection && (
          <span
            className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95"
            onClick={onAddWallet}
          >
            <Plus strokeColor="#627eea" strokeWidth={1.5} />
          </span>
        )}
        <span
          className="cursor-pointer my-auto pl-2 md:pl-1 md:pr-4 rounded-full transition-all transform hover:scale-110 active:scale-95"
          onClick={onDiconnect}
        >
          <Exit strokeColor="#ff6656" strokeWidth={1.5} />
        </span>
      </div>
    </div>
  );
}

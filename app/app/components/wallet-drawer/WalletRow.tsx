import { WalletState } from "@/utils/interfaces";
import { CHAINS, SUPPORTED_WALLETS, WalletKey } from "@/utils/wallet/constants";
import React, { cloneElement } from "react";
import MiddleTruncate from "../middle-truncate";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { Copy, Exit, LinkExternal } from "@/svg/icons";
interface WalletHeaderProps {
  wallet: WalletState;
  name: string;
  onDisconnect: (wallet: WalletState) => void;
}

export default function WalletRow({
  wallet,
  name,
  onDisconnect,
}: WalletHeaderProps) {
  const { copy } = useCopyToClipboard();
  return (
    <div className="bg-white flex gap-1 rounded-lg p-4 text-sm">
      <span className="leading-6">
        {cloneElement(SUPPORTED_WALLETS[wallet.walletId].icon, {
          className: "icon",
        })}
      </span>
      <span className="flex-3 font-bold leading-6">{name}</span>
      <span className="flex-1 leading-6 px-2 justify-items-end">
        <div className="w-20">
          <MiddleTruncate text={wallet.address} />
        </div>
      </span>
      <span
        className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95"
        onClick={() => copy(wallet.address)}
      >
        <Copy strokeColor="#627eea" size={20} />
      </span>
      {/* <span 
      className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95"
      onClick={() => setQrOpen(true)}
    >
      <QRCodeIcon strokeColor="#627eea" size={20} />
    </span> */}
      <span
        className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95"
        onClick={() => {
          const url = CHAINS.find((chain) => chain.name === name)?.addressUrl;
          if (url) {
            window.open(url.replace("{wallet}", wallet.address), "_blank");
          }
        }}
      >
        <LinkExternal strokeColor="#627eea" size={20} />
      </span>
      {
        wallet.walletId !== WalletKey.WALLETCONNECT && // WalletConnect close session for all chains at once
        <span
          className="cursor-pointer my-auto rounded-full transition-all transform 
              hover:scale-110 active:scale-95"
          onClick={() => onDisconnect(wallet)}
        >
          <Exit strokeColor="#ff6656" size={20} />
        </span>
      }
    </div>
  );
}

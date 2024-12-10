"use client";
import { cloneElement, FC } from "react";
import { formatNumber } from "@/app/utils";
import Image from "next/image";
import {
  Copy,
  Exit,
  Eye,
  LinkExternal,
  Plus,
  QRCode,
  Synchronize,
} from "@/svg/icons";
import MiddleTruncate from "@/app/components/middle-truncate";
import { useAppState } from "@/utils/context";
import { ChainKey, SUPPORTED_WALLETS } from "@/utils/wallet/constants";
import { getAssetSymbol, getLogoPath } from "@/app/utils";
import { TokenData } from "@/utils/interfaces";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

const Component: FC = () => {
  const {
    walletsState,
    isWalletDrawerOpen,
    toggleWalletDrawer,
    toggleWalletModal,
  } = useAppState();
  const { refreshBalances, balanceList } = useAppState();
  const handleAddWallet = () => {
    toggleWalletModal();
    toggleWalletDrawer();
  };

  const handleWalletRefresh = () => {
    refreshBalances();
  };

  const { copy } = useCopyToClipboard();

  return (
    isWalletDrawerOpen && (
      <>
        <div
          className="bg-[rgba(0,0,0,0.5)] fixed h-full inset-0 z-20"
          onClick={toggleWalletDrawer}
        />
        <div className="bg-secondary border-b-4 border-l-4 border-t-4 border-white fixed h-full right-0 rounded-l-large top-0 w-[360px] z-20">
          <div className="border-b flex py-4">
            <span className="flex-1 font-bold leading-6 px-4 text-2xl">
              Wallet
            </span>
            <span className="border-r cursor-pointer px-2">
              <Eye strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span
              className="border-r cursor-pointer px-2"
              onClick={handleWalletRefresh}
            >
              <Synchronize strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span
              className="border-r cursor-pointer px-2"
              onClick={handleAddWallet}
            >
              <Plus strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="cursor-pointer px-2">
              <Exit strokeColor="#ff6656" strokeWidth={1.5} />
            </span>
          </div>
          <div className="overflow-auto max-h-[calc(100vh-6rem)] custom-scroll ">
            {Object.keys(walletsState!).map((key) => {
              const wallet = walletsState![key];
              return (
                <div key={wallet.walletId + key} className="p-4">
                  <div className="bg-white flex gap-2 rounded-lg p-4">
                    <span className="leading-6">
                      {cloneElement(SUPPORTED_WALLETS[wallet.walletId].icon, {
                        className: "icon",
                      })}
                    </span>
                    <span className="flex-3 font-bold leading-6">{key}</span>
                    <span className="flex-1 leading-6 px-2">
                      <MiddleTruncate text={wallet.address} />
                    </span>
                    <span
                      className="cursor-pointer my-auto p-2 rounded-full transition-all transform 
              hover:bg-blue-100 hover:scale-110 active:scale-95"
                      onClick={() => copy(wallet.address)}
                    >
                      <Copy strokeColor="#627eea" size={14} />
                    </span>
                    <span className="cursor-pointer my-auto ">
                      <QRCode strokeColor="#627eea" size={14} />
                    </span>
                    <span className="cursor-pointer my-auto ">
                      <LinkExternal strokeColor="#627eea" size={14} />
                    </span>
                    <span className="cursor-pointer my-auto -mr-1">
                      <Exit strokeColor="#ff6656" size={14} />
                    </span>
                  </div>
                  {balanceList &&
                    Object.values(balanceList[key as ChainKey]).map(
                      (token: TokenData) => {
                        return (
                          <div
                            key={token.chainName + token.asset}
                            className="px-2 py-4"
                          >
                            <div className="flex gap-2 items-center">
                              <Image
                                src={getLogoPath(token.asset)}
                                alt={`${getAssetSymbol(token.asset)} logo`}
                                width={26}
                                height={26}
                                className="rounded-full"
                              />
                              <div className="flex flex-1 flex-col">
                                <span className="font-bold leading-5">
                                  {token.symbol}
                                </span>
                                <span className="leading-4 text-gray-500">
                                  {token.chainName}
                                </span>
                              </div>
                              <span className="font-bold">
                                {token.balance > 0
                                  ? formatNumber(token.balance, 6)
                                  : formatNumber(token.formattedBalance!, 6)}
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default Component;

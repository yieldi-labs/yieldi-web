"use client";
import { cloneElement, FC, useState } from "react";
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
import Loader from "../Loader";

const WalletDrawer: FC = () => {
  const {
    walletsState,
    isWalletDrawerOpen,
    toggleWalletDrawer,
    toggleWalletModal,
  } = useAppState();
  const {
    refreshBalances,
    balanceList,
    isLoadingBalance,
    isLoadingTokenList,
    setWalletsState,
  } = useAppState();
  const handleAddWallet = () => {
    toggleWalletModal();
    toggleWalletDrawer();
  };

  const handleWalletRefresh = () => {
    refreshBalances();
  };
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const { copy } = useCopyToClipboard();

  return (
    isWalletDrawerOpen && (
      <>
        <div className="fixed h-full right-0 w-[360px] z-10 mx-18">
          <div 
            className="bg-white-radial backdrop-blur-[15px] flex justify-between pt-4 rounded-t-lg"
          >
            <div className="flex">
              <span className="inline-flex items-center w-full font-medium leading-6 px-4 text-2xl">
                Wallet
              </span>
              <span
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="cursor-pointer my-auto p- rounded-full transition-all transform hover:scale-110 active:scale-95"
              >
                <Eye strokeColor="#627eea" strokeWidth={1.5} />
              </span>
              <span
                className="cursor-pointer my-auto p-2 rounded-full transition-all transform hover:scale-110 active:scale-95"
                onClick={handleWalletRefresh}
              >
                <Synchronize strokeColor="#627eea" strokeWidth={1.5} />
              </span>
            </div>
            <div className="flex mr-4">
              <span
                className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95"
                onClick={handleAddWallet}
              >
                <Plus strokeColor="#627eea" strokeWidth={1.5} />
              </span>
              <span
                className="cursor-pointer my-auto p-2 rounded-full transition-all transform hover:scale-110 active:scale-95"
                onClick={() => {
                  {
                    Object.keys(walletsState!).map((key) => {
                      const wallet = walletsState![key];
                      if (wallet.provider.disconnect) {
                        wallet.provider.disconnect()
                      };
                    });
                  }
                  setWalletsState({});
                  toggleWalletDrawer();
                }}
              >
                <Exit strokeColor="#ff6656" strokeWidth={1.5} />
              </span>
            </div>
          </div>
          <div className="bg-transparent-radial backdrop-blur-[14px] overflow-y-auto overflow-x-hidden custom-scroll rounded-b-lg shadow-2xl max-h-[652px] py-2">
            {isLoadingTokenList ? (
              <div className="flex items-center justify-center my-4 h-32">
                <Loader />
              </div>
            ) : (
              <>
                {Object.keys(walletsState!).map((key) => {
                  const wallet = walletsState![key];
                  return (
                    <div key={wallet.walletId + key} className="px-4 pb-2">
                      <div className="bg-white flex gap-1 rounded-lg p-4 text-sm">
                        <span className="leading-6">
                          {cloneElement(
                            SUPPORTED_WALLETS[wallet.walletId].icon,
                            {
                              className: "icon",
                            },
                          )}
                        </span>
                        <span className="flex-3 font-bold leading-6">
                          {key}
                        </span>
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
                        <span className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95">
                          <QRCode strokeColor="#627eea" size={20} />
                        </span>
                        <span className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95">
                          <LinkExternal strokeColor="#627eea" size={20} />
                        </span>
                        <span
                          className="cursor-pointer my-auto rounded-full transition-all transform 
                                hover:scale-110 active:scale-95"
                          onClick={() => {
                            if (wallet.provider.disconnect) {
                              wallet.provider.disconnect()
                            };
                            if (Object.keys(walletsState).length === 1) {
                              toggleWalletDrawer();
                            }
                            setWalletsState((prev) => {
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { [key]: _, ...newState } = prev;
                              return newState;
                            });
                          }}
                        >
                          <Exit strokeColor="#ff6656" size={24} />
                        </span>
                      </div>
                      {balanceList ? (
                        <>
                          {Object.values(balanceList[key as ChainKey]).map(
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
                                    {isLoadingBalance ? (
                                      <Loader sizeInPixels={4} />
                                    ) : isBalanceHidden ? (
                                      <span className="font-bold">***</span>
                                    ) : (
                                      <span className="font-bold">
                                        {token.balance > 0
                                          ? formatNumber(token.balance, 6)
                                          : formatNumber(
                                              token.formattedBalance!,
                                              6,
                                            )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center mt-4">
                          <Loader />
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </>
    )
  );
};

export default WalletDrawer;

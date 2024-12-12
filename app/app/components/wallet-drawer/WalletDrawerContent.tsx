import React from "react";
import Loader from "../Loader";
import { TokenData, WalletState, WalletTokensData } from "@/utils/interfaces";
import WalletRow from "./WalletRow";
import BalanceRow from "./BalanceRow";
import { ChainKey } from "@/utils/wallet/constants";
import { useAppState } from "@/utils/context";

interface WalletDrawerProps {
  isLoadingTokenList: boolean;
  isLoadingBalance: boolean;
  isBalanceHidden: boolean;
  onDisconnectWallet: (wallet: WalletState, id: string) => void;
  balanceList?: WalletTokensData;
}

export default function WalletDrawerContent({
  isLoadingTokenList,
  isLoadingBalance,
  isBalanceHidden,
  onDisconnectWallet,
  balanceList,
}: WalletDrawerProps) {
  const { walletsState } = useAppState();
  if (isLoadingTokenList) {
    return (
      <div className="flex items-center justify-center my-4 h-32">
        <Loader />
      </div>
    );
  }
  return (
    <>
      {Object.keys(walletsState!).map((key) => {
        const wallet = walletsState![key];
        return (
          <div key={wallet.walletId + key} className="md:px-4 pb-2">
            <WalletRow
              wallet={wallet}
              name={key}
              onDisconnect={(wallet) => onDisconnectWallet(wallet, key)}
            />
            {balanceList ? (
              <>
                {Object.values(balanceList[key as ChainKey]).map(
                  (token: TokenData) => {
                    return (
                      <BalanceRow
                        key={token.chainName + token.asset}
                        token={token}
                        isLoading={isLoadingBalance}
                        isHidden={isBalanceHidden}
                      />
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
  );
}

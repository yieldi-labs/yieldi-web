"use client";
import { FC, useState } from "react";
import { useAppState } from "@/utils/context";
import { WalletState } from "@/utils/interfaces";
import { useMobileDetection } from "@shared/hooks";
import WalletDrawerHeader from "./WalletDrawerHeader";
import Modal from "@/app/modal";
import WalletDrawerContent from "./WalletDrawerContent";
import { SUPPORTED_WALLETS } from "@/utils/wallet/constants";

const WalletDrawerContainer: FC = () => {
  const {
    walletsState,
    isWalletDrawerOpen,
    toggleWalletDrawer,
    toggleWalletModal,
    refreshBalances,
    balanceList,
    isLoadingBalance,
    isLoadingTokenList,
    setWalletsState,
    selectedWallet,
  } = useAppState();

  const handleAddWallet = () => {
    toggleWalletModal();
    toggleWalletDrawer();
  };

  const handleWalletRefresh = () => {
    refreshBalances();
  };

  const handleDisconnectWallet = (wallet: WalletState, id: string) => {
    if (wallet.provider.disconnect) {
      wallet.provider.disconnect();
    }
    if (Object.keys(walletsState).length === 1) {
      toggleWalletDrawer();
    }
    setWalletsState((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...newState } = prev;
      return newState;
    });
  };

  const handleDisconnectAllWallet = () => {
    {
      Object.keys(walletsState!).map((key) => {
        const wallet = walletsState![key];
        if (wallet.provider.disconnect) {
          wallet.provider.disconnect();
        }
      });
    }
    setWalletsState({});
    toggleWalletDrawer();
  };

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const isMobile = useMobileDetection();

  if (isMobile) {
    return (
      isWalletDrawerOpen && (
        <Modal onClose={toggleWalletDrawer}>
          <div className="mb-4">
            <WalletDrawerHeader
              enableAddConnection={
                selectedWallet
                  ? SUPPORTED_WALLETS[selectedWallet.id]
                      .hasSupportToAddConectionToExistingConnection
                  : false
              }
              onRefresh={handleWalletRefresh}
              onAddWallet={handleAddWallet}
              onHiddeBalance={() => setIsBalanceHidden(!isBalanceHidden)}
              onDiconnect={handleDisconnectAllWallet}
            />
          </div>
          <WalletDrawerContent
            isLoadingTokenList={isLoadingTokenList}
            isLoadingBalance={isLoadingBalance}
            isBalanceHidden={isBalanceHidden}
            balanceList={balanceList}
            onDisconnectWallet={handleDisconnectWallet}
          />
        </Modal>
      )
    );
  }

  return (
    isWalletDrawerOpen && (
      <>
        <div
          className="fixed inset-0 h-screen z-10"
          onClick={toggleWalletDrawer}
        />
        <div className="fixed right-0 w-[360px] z-20 mx-18 mt-32">
          <div className="bg-transparent-radial backdrop-blur-[14px] flex justify-between pt-4 rounded-t-lg">
            <WalletDrawerHeader
              enableAddConnection={
                selectedWallet
                  ? SUPPORTED_WALLETS[selectedWallet.id]
                      .hasSupportToAddConectionToExistingConnection
                  : false
              }
              onRefresh={handleWalletRefresh}
              onAddWallet={handleAddWallet}
              onHiddeBalance={() => setIsBalanceHidden(!isBalanceHidden)}
              onDiconnect={handleDisconnectAllWallet}
            />
          </div>
          <div className="bg-transparent-radial backdrop-blur-[14px] overflow-y-auto overflow-x-hidden custom-scroll rounded-b-lg shadow-2xl max-h-[652px] py-2">
            <WalletDrawerContent
              isLoadingTokenList={isLoadingTokenList}
              isLoadingBalance={isLoadingBalance}
              isBalanceHidden={isBalanceHidden}
              balanceList={balanceList}
              onDisconnectWallet={handleDisconnectWallet}
            />
          </div>
        </div>
      </>
    )
  );
};

export default WalletDrawerContainer;

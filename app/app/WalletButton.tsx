"use client";
import { useAppState } from "@/utils/context";
import { Button } from "@shared/components/ui";

export default function WalletButton() {
  const { walletsState, toggleWalletModal } = useAppState();

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
  };
  const connectedWallets = Object.keys(walletsState || {}).length;
  return (
    <Button
      className="w-48"
      onClick={toggleWalletModal}
      label={
        connectedWallets === 0
          ? "Connect Wallet"
          : connectedWallets === 1
          ? formatAddress(Object.values(walletsState!)[0].address)
          : `${connectedWallets} Wallets Connected`
      }
    />
  );
}

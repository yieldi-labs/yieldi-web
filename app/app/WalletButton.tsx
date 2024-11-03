"use client";
import { useAppState } from "@/utils/context";
import { Button } from "@shared/components/ui";

export default function WalletButton() {
  const { wallet, toggleWalletModal } = useAppState();

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
  };

  return (
    <Button
      className="w-48"
      onClick={toggleWalletModal}
      label={
        wallet?.address ? formatAddress(wallet.address!) : "Connect Wallet"
      }
    />
  );
}

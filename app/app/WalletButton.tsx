"use client";
import { useAppState } from "@/utils/context";
import { Button } from "@shared/components/ui";
import { formatAddress } from "./utils";

export default function WalletButton() {
  const { walletsState, toggleWalletModal, toggleWalletDrawer } = useAppState();

  const connectedWallets = Object.keys(walletsState || {}).length;
  return (
    <Button
      className="w-48"
      onClick={() =>
        connectedWallets === 0 ? toggleWalletModal() : toggleWalletDrawer()
      }
      label={
        connectedWallets === 0
          ? "Connect Wallet"
          : formatAddress(Object.values(walletsState!)[0].address)
      }
    />
  );
}

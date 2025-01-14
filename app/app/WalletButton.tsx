"use client";
import { useAppState } from "@/utils/contexts/context";
import { Button } from "@shared/components/ui";
import { formatAddress } from "./utils";
import { useMobileDetection } from "@shared/hooks/useMobileDetection";
import Image from "next/image";

export default function WalletButton() {
  const { walletsState, toggleWalletModal, toggleWalletDrawer } = useAppState();
  const isMobile = useMobileDetection();
  const connectedWallets = Object.keys(walletsState || {}).length;

  if (isMobile && connectedWallets !== 0) {
    return (
      <Image
        src="/settings.svg"
        alt="settings"
        className="rounded-full mr-1"
        width={24}
        height={24}
        onClick={() => toggleWalletDrawer()}
      />
    );
  }

  return (
    <Button
      className="text-sm md:text-base md:w-48"
      onClick={() =>
        connectedWallets === 0 ? toggleWalletModal() : toggleWalletDrawer()
      }
      label={
        connectedWallets === 0
          ? isMobile
            ? "Connect"
            : "Connect Wallet"
          : formatAddress(Object.values(walletsState!)[0].address)
      }
    />
  );
}

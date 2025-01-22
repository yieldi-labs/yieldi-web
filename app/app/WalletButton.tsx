"use client";
import { useAppState } from "@/utils/contexts/context";
import { Button } from "@shared/components/ui";
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
    <div className="flex justify-end md:w-48">
      <Button
        className="text-sm md:text-base md:w-auto"
        onClick={() =>
          connectedWallets === 0 ? toggleWalletModal() : toggleWalletDrawer()
        }
        label={
          connectedWallets === 0
            ? isMobile
              ? "Connect"
              : "Connect Wallet"
            : "Wallet"
        }
      />
    </div>
  );
}

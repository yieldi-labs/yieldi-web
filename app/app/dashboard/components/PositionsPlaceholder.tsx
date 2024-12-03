import TranslucentCard from "@/app/TranslucentCard";
import { useAppState } from "@/utils/context";
import React from "react";

export default function PositionsPlaceholder() {
  const { walletsState } = useAppState();
  return (
    <TranslucentCard>
      <div className="w-full h-24 p-2.5 border-4 border-white justify-center items-center flex">
        <p className="text-neutral-800 font-medium text-base">
          {walletsState
            ? "Your liquidity positions will appear here."
            : "Connect your wallet to view your liquidity positions"}
        </p>
      </div>
    </TranslucentCard>
  );
}

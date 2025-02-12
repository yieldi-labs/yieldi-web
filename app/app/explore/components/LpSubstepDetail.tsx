import { LpSubstepsAddLiquidity } from "@/hooks/useLiquidityPosition";
import React from "react";
import { LpSubstepsStatus } from "./StatusModal";
import Image from "next/image";

const getStepText = (
  step: LpSubstepsAddLiquidity,
  status: LpSubstepsStatus,
  symbol: string,
) => {
  if (
    step === LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET &&
    (status === LpSubstepsStatus.PENDING ||
      status === LpSubstepsStatus.INACTIVE)
  ) {
    return `Please approve ${symbol.toUpperCase()}`;
  }
  if (
    step === LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET &&
    (status === LpSubstepsStatus.PENDING ||
      status === LpSubstepsStatus.INACTIVE)
  ) {
    return `Please sign ${symbol.toUpperCase()} transaction`;
  }
  if (
    step === LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_RUNE &&
    (status === LpSubstepsStatus.PENDING ||
      status === LpSubstepsStatus.INACTIVE)
  ) {
    return `Please sign RUNE transaction`;
  }
  if (step === LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET) {
    return `Approved ${symbol.toUpperCase()}`;
  }
  if (step === LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET) {
    return `Signed ${symbol.toUpperCase()}`;
  }
  if (step === LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_RUNE) {
    return `Signed ${symbol.toUpperCase()}`;
  }
};

const getStatusView = (status: LpSubstepsStatus) => {
  if (status === LpSubstepsStatus.PENDING) {
    return (
      <div className="animate-spin rounded-full h-[40px] w-[40px] border-b-2 border-primary"></div>
    );
  }
  if (status === LpSubstepsStatus.SUCCESS) {
    return (
      <Image
        src={"/check.svg"}
        alt="Green check"
        className="rounded-full"
        width={40}
        height={40}
      />
    );
  }
  if (status === LpSubstepsStatus.FAILED) {
    return (
      <Image
        src={"/fail-status-modal.svg"}
        alt="Fail icon"
        className="rounded-full"
        width={40}
        height={40}
      />
    );
  }
  return <div className="w-[40px] h-[40px] bg-gray-200 rounded-full"></div>;
};

export default function LpSubstepDetail({
  step,
  status,
  symbol,
}: {
  step: LpSubstepsAddLiquidity;
  status: LpSubstepsStatus;
  symbol: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {getStatusView(status)}
      <span className="text-gray-700 text-sm">
        {getStepText(step, status, symbol)}
      </span>
    </div>
  );
}

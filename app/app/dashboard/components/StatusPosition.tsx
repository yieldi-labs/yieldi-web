import Loader from "@/app/components/Loader";
import {
  PositionStats,
  PositionStatus,
} from "@/hooks/dataTransformers/positionsTransformer";
import { assetFromString } from "@xchainjs/xchain-util";
import React from "react";

interface StatusPositionProps {
  position: PositionStats;
}

export default function StatusPosition({ position }: StatusPositionProps) {
  const asset = assetFromString(position.assetId);
  
  return (
    <span className="font-medium text-sm flex items-center space-x-2">
      {position.status === PositionStatus.LP_POSITION_INCOMPLETE && (
        <span className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md shadow-sm animate-pulse">
          {Number(position.memberDetails.runePending) > 0
            ? `Awaiting ${asset?.symbol} deposit`
            : "Awaiting RUNE deposit"}
        </span>
      )}

      {position.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING && (
        <span className="flex items-center bg-blue-100 text-blue px-2 py-1 rounded-md shadow-sm">
          <span className="mr-2">Withdrawal pending</span>
          <Loader sizeInPixels={4} color='blue' />
        </span>
      )}

      {position.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING && (
        <span className="flex items-center bg-blue-100 text-blue px-2 py-1 rounded-md shadow-sm">
          <span className="mr-2">Deposit pending</span>
          <Loader sizeInPixels={4} color='blue' />
        </span>
      )}

      {position.status === PositionStatus.LP_POSITION_COMPLETE && (
        <span className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md shadow-sm">
          <span className="mr-2">Active</span>
          <svg
            className="w-4 h-4 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}
    </span>
  );
}

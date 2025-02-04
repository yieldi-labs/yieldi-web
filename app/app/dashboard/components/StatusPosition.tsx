import React, { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import {
  PositionStats,
  PositionStatus,
} from "@/utils/lp-monitor/parsePositions";
import { assetFromString } from "@xchainjs/xchain-util";
import { UIComponents } from "@shared/components";

interface StatusPositionProps {
  position: PositionStats;
  onClick: () => void;
}

export default function StatusPosition({
  position,
  onClick,
}: StatusPositionProps) {
  const asset = assetFromString(position.assetId);
  const [initialTimers, setInitialTimers] = useState<number[]>([]);

  useEffect(() => {
    if (position.pendingActions?.length) {
      const timers = position.pendingActions.map(
        (action) => action.pendingDelayInSeconds || 0,
      );
      setInitialTimers(timers);
    }
  }, [position.pendingActions]);

  return (
    <span className="font-medium text-sm flex flex-col space-y-2 hover:underline cursor-pointer hover:decoration-yellow-700">
      {position.status === PositionStatus.LP_POSITION_INCOMPLETE && (
        <span
          onClick={onClick}
          className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md shadow-sm animate-pulse"
        >
          {Number(position.memberDetails?.runePending) > 0
            ? `Awaiting ${asset?.ticker} deposit`
            : "Awaiting RUNE deposit"}
        </span>
      )}

      {(position.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING ||
        position.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING) && (
        <div onClick={onClick} className="flex flex-col space-y-2">
          <span className="flex items-center bg-blue-100 text-blue px-2 py-1 rounded-md shadow-sm">
            <span className="mr-2">
              <Loader sizeInPixels={4} color="blue" />
            </span>
            <UIComponents.Tooltip
              content={
                initialTimers.length > 0 ? (
                  <UIComponents.Timer initialTimes={initialTimers} />
                ) : (
                  <span className="text-gray-900">Processing...</span>
                )
              }
            >
              <span className="mr-2">
                {position.status ===
                PositionStatus.LP_POSITION_WITHDRAWAL_PENDING
                  ? "Withdrawal pending"
                  : "Deposit pending"}
              </span>
            </UIComponents.Tooltip>
          </span>
        </div>
      )}

      {position.status === PositionStatus.LP_POSITION_COMPLETE && (
        <span
          onClick={onClick}
          className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md shadow-sm"
        >
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

import React, { useState, useEffect } from "react";
import Loader from "@/app/components/Loader";
import {
  PositionStats,
  PositionStatus,
} from "@/utils/lp-monitor/parsePositions";
import { assetFromString } from "@xchainjs/xchain-util";
import { UIComponents } from "@shared/components";
import { formatTime } from "@/app/utils";

interface StatusPositionProps {
  position: PositionStats;
}

export default function StatusPosition({ position }: StatusPositionProps) {
  const asset = assetFromString(position.assetId);
  const [timers, setTimers] = useState<number[]>([]);

  useEffect(() => {
    if (position.pendingActions?.length) {
      const initialTimers = position.pendingActions.map(
        (action) => action.pendingDelayInSeconds || 0
      );
      setTimers(initialTimers);
    }
  }, [position.pendingActions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((time) => (time > 0 ? time - 1 : 0))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-medium text-sm flex flex-col space-y-2">
      {position.status === PositionStatus.LP_POSITION_INCOMPLETE && (
        <span className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md shadow-sm animate-pulse">
          {Number(position.memberDetails?.runePending) > 0
            ? `Awaiting ${asset?.symbol} deposit`
            : "Awaiting RUNE deposit"}
        </span>
      )}

      {(position.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING ||
        position.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING) && (
          <div className="flex flex-col space-y-2">
            <span
              className="flex items-center bg-blue-100 text-blue px-2 py-1 rounded-md shadow-sm"
            >
              <span className="mr-2">
                <Loader sizeInPixels={4} color="blue" />
              </span>
              <UIComponents.Tooltip text={
                timers[0] > 0
                  ? `${formatTime(timers[0])}`
                  : "Processing..."
              }>
                <span className="mr-2">
                  {position.status ===
                  PositionStatus.LP_POSITION_WITHDRAWAL_PENDING
                    ? "Withdrawal pending"
                    : "Deposit pending"}
                </span>
              </UIComponents.Tooltip>
              {/* {
                timers?.length > 0 && 
                <span>
                  {timers[0] > 0
                    ? `${formatTime(timers[0])}`
                    : "Processing..."}
                </span>
              } */}
            </span>
          </div>
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

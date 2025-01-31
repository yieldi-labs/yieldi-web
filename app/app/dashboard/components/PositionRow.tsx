import React from "react";
import TranslucentCard from "@/app/TranslucentCard";
import { addDollarSignAndSuffix, getAssetSymbol } from "@/app/utils";
import TokenLogo from "./TokenLogo";
import StatusPosition from "./StatusPosition";
import { UIComponents } from "@shared/components";
import {
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";

interface PositionsRow {
  position: PositionStats;
  onAdd: (assetId: string, type: PositionType) => void;
  onRemove: (poolId: string, type: PositionType) => void;
  onCompletePosition: (poolId: string, type: PositionType) => void;
  hideAddButton?: boolean;
  hideStatus?: boolean;
  reasonToDisableAdd: string | React.ReactNode;
  reasonToDisableRemove: string | React.ReactNode;
}

export default function PositionRow({
  position,
  onAdd,
  onRemove,
  onCompletePosition,
  hideAddButton = false,
  hideStatus = false,
  reasonToDisableAdd = null,
  reasonToDisableRemove = null,
}: PositionsRow) {
  return (
    <TranslucentCard className="rounded-xl mb-1.5">
      <div className="flex items-center w-full">
        <div className="px-3 whitespace-nowrap md:w-1/5 w-1/2">
          <div className="flex items-center">
            <TokenLogo assetId={position.assetId} />
            <div className="flex flex-col">
              <span className="ml-3 font-medium">
                {getAssetSymbol(position.assetId)}
              </span>
              <span className="hidden md:block ml-3 font-medium text-sm text-neutral-700">
                {position.type === PositionType.SYM ? "SYM" : "ASYM"}
              </span>
            </div>
          </div>
          <div></div>
        </div>
        <div className="flex items-center md:w-4/5 w-1/2">
          <div className="md:px-3 py-3 md:py-0 whitespace-nowrap w-1/2 md:w-1/5">
            {Number(position.gain.percentage).toFixed(2)}%
          </div>
          <div className="md:px-3 py-3 md:py-0 whitespace-nowrap w-1/2 md:w-1/5">
            {addDollarSignAndSuffix(position.deposit.usd)}
          </div>
          <div className="hidden md:flex md:px-3 py-3 md:py-0 whitespace-nowrap w-1/5">
            {addDollarSignAndSuffix(position.gain.usd)}
          </div>
          {!hideStatus && (
            <div className="hidden md:flex md:px-3 py-3 md:py-0 whitespace-nowrap w-1/5">
              <StatusPosition
                position={position}
                onClick={() => {
                  if (
                    position.status === PositionStatus.LP_POSITION_INCOMPLETE
                  ) {
                    onCompletePosition(position.assetId, position.type);
                  }
                }}
              />
            </div>
          )}
          <div className="hidden md:flex px-3 py-3 md:py-0 whitespace-nowrap w-1/5">
            {!hideAddButton &&
              (reasonToDisableAdd ? (
                <UIComponents.Tooltip content={<>{reasonToDisableAdd}</>}>
                  <button
                    disabled={Boolean(reasonToDisableAdd)}
                    onClick={() => onAdd(position.assetId, position.type)}
                    className="h-full px-6 py-1 text-sm rounded-full font-bold bg-secondaryBtn text-white disabled:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed "
                  >
                    Add
                  </button>
                </UIComponents.Tooltip>
              ) : (
                <button
                  disabled={Boolean(reasonToDisableAdd)}
                  onClick={() => onAdd(position.assetId, position.type)}
                  className="px-6 py-1 text-sm rounded-full font-bold bg-secondaryBtn hover:bg-secondaryBtn/50 text-white disabled:opacity-50 disabled:cursor-not-allowed "
                >
                  Add
                </button>
              ))}
            {reasonToDisableRemove ? (
              <UIComponents.Tooltip content={<>{reasonToDisableRemove}</>}>
                <button
                  disabled={Boolean(reasonToDisableRemove)}
                  className="border-red border-2 text-red font-bold px-6 py-1 rounded-full
                              transition-all disabled:border-neutral-900 disabled:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                  onClick={() => onRemove(position.assetId, position.type)}
                >
                  Remove
                </button>
              </UIComponents.Tooltip>
            ) : (
              <button
                className="border-red border-2 text-red font-bold px-6 py-1 rounded-full
                            hover:text-opacity-50 hover:border-opacity-50 transition-all 
                            disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                onClick={() => onRemove(position.assetId, position.type)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </TranslucentCard>
  );
}

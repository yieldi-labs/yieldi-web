import React from "react";
import TranslucentCard from "@/app/TranslucentCard";
import { addDollarSignAndSuffix, getAssetSymbol } from "@/app/utils";
import TokenLogo from "./TokenLogo";
import {
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/hooks/dataTransformers/positionsTransformer";
import Loader from "@/app/components/Loader";

interface PositionsRow {
  position: PositionStats;
  onAdd: (assetId: string) => void;
  onRemove: (assetId: string) => void;
  hideAddButton?: boolean;
}

export default function PositionRow({
  position,
  onAdd,
  onRemove,
  hideAddButton = false,
}: PositionsRow) {
  return (
    <TranslucentCard className="rounded-xl mb-1.5 overflow-scroll overflow-y-hidden overflow-x-hidden">
      <div className="flex items-center w-full">
        <div className="px-3 whitespace-nowrap md:w-1/5 w-1/2">
          <div className="flex items-center">
            <TokenLogo assetId={position.assetId} />
            <div className="flex flex-col">
              <span className="ml-3 font-medium">
                {getAssetSymbol(position.assetId)}
              </span>
              <span className="hidden md:block ml-3 font-medium text-sm text-neutral-700">
                {position.type === PositionType.DLP ? "DLP" : "SLP"}
              </span>
            </div>
          </div>
          <div></div>
        </div>
        <div className="flex items-center md:w-4/5 w-1/2">
          <div className="md:px-3 py-3 md:py-0 whitespace-nowrap flex-1 w-1/2 md:w-1/5">
            {Number(position.gain.percentage).toFixed(2)}%
          </div>
          <div className="md:px-3 py-3 md:py-0 whitespace-nowrap flex-1 w-1/2 md:w-1/5">
            {addDollarSignAndSuffix(position.deposit.usd)}
          </div>
          <div className="hidden md:flex md:px-3 py-3 md:py-0 whitespace-nowrap flex-1 w-1/5">
            {addDollarSignAndSuffix(position.gain.usd)}
          </div>
          <div className="hidden md:flex px-3 py-3 md:py-0 whitespace-nowrap w-2/5">
            {!hideAddButton && (
              <button
                onClick={() => onAdd(position.assetId)}
                className="px-6 py-1 text-sm rounded-full font-bold bg-secondaryBtn hover:bg-secondaryBtn/50 text-white disabled:opacity-50 disabled:cursor-not-allowed "
              >
                Add
              </button>
            )}
            <button
              className="border-red border-2 text-red font-bold px-6 py-1 rounded-full
                        hover:text-opacity-50 hover:border-opacity-50 transition-all 
                        disabled:opacity-50 disabled:cursor-not-allowed ml-2"
              onClick={() => onRemove(position.assetId)}
              disabled={position.type !== PositionType.SLP}
            >
              Remove
            </button>
            <span className="ml-3 font-medium text-sm text-neutral-700 flex items-center">
              {position.status === PositionStatus.LP_POSITION_INCOMPLETE &&
                "INCOMPLETE"}
              {position.status === PositionStatus.LP_POSITION_PENDING && (
                <Loader sizeInPixels={4} />
              )}
            </span>{" "}
          </div>
        </div>
      </div>
    </TranslucentCard>
  );
}

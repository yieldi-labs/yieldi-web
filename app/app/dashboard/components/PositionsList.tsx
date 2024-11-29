import React, { useMemo, useState } from "react";
import TranslucentCard from "@/app/TranslucentCard";
import {
  addDollarSignAndSuffix,
  getAssetSymbol,
  getLogoPath,
} from "@/app/utils";
import Image from "next/image";
import { PositionsPerAsset } from "../types";
import { SortableHeader } from "@shared/components/ui";
import { SortDirection } from "@shared/components/ui/types";

interface PositionsList {
  positions: PositionsPerAsset;
}

enum PoolSortKey {
  PRINCIPAL = "principal",
  TOTAL_EARNING = "totalEarning",
  APY = "apy",
}

interface SortConfig {
  key: PoolSortKey;
  direction: SortDirection;
}

export default function PositionsList({ positions }: PositionsList) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: PoolSortKey.APY,
    direction: SortDirection.DESC,
  });
  const sortedPositions = useMemo(() => {
    const sortableItems = [...positions];
    sortableItems.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortConfig.key) {
        case PoolSortKey.APY:
          aValue = a.apy;
          bValue = b.apy;
          break;
        case PoolSortKey.PRINCIPAL:
          aValue = a.deposit.usd - a.gain.usd;
          bValue = b.deposit.usd - b.gain.usd;
          break;
        case PoolSortKey.TOTAL_EARNING:
          aValue = a.gain.usd;
          bValue = b.gain.usd;
          break;
        default:
          return 0;
      }

      return sortConfig.direction === SortDirection.ASC
        ? aValue - bValue
        : bValue - aValue;
    });
    return sortableItems;
  }, [positions, sortConfig]);

  const sortData = (key: PoolSortKey, direction?: SortDirection) => {
    if (direction) {
      setSortConfig({ key, direction });
    } else {
      setSortConfig((prevConfig) => ({
        key,
        direction:
          prevConfig.key === key && prevConfig.direction === SortDirection.DESC
            ? SortDirection.ASC
            : SortDirection.DESC,
      }));
    }
  };

  return (
    <>
      <div className="flex text-left text-base text-gray-700 mb-2 px-4">
        <div className="py-3 w-1/3 md:w-1/2">Asset</div>
        <div className="flex flex-1 w-2/3 md:w-1/2 justify-between">
          <div className="w-1/3">
            <SortableHeader<PoolSortKey>
              label="APY"
              sortKey={PoolSortKey.APY}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
          <div className="w-1/3">
            <SortableHeader<PoolSortKey>
              label="Principal"
              sortKey={PoolSortKey.PRINCIPAL}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
          <div className="w-1/3">
            <SortableHeader<PoolSortKey>
              label="Total earning"
              sortKey={PoolSortKey.TOTAL_EARNING}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        {sortedPositions.map((position) => (
          <TranslucentCard key={`${position.assetId}-${position.type}`} className="rounded-xl mb-1.5">
            <div className="flex items-center w-full">
              <div className="px-3 whitespace-nowrap w-1/3 md:w-1/2">
                <div className="flex items-center">
                  <Image
                    src={getLogoPath(position.assetId)}
                    alt={`${getAssetSymbol(position.assetId)} logo`}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="ml-3 font-medium">
                      {getAssetSymbol(position.assetId)}
                    </span>
                    <span className="hidden md:block ml-3 font-medium font-normal text-sm text-neutral-700">
                      {position.type === "SAVER" ? "Savers" : "LP"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start w-2/3 md:w-1/2">
                <div className="px-3 py-3 md:py-0 whitespace-nowrap flex-1 w-1/3">
                  {position.apy * 100}%
                </div>
                <div className="px-3 py-3 md:py-0 whitespace-nowrap flex-1 w-1/3">
                  {addDollarSignAndSuffix(
                    position.deposit.usd + position.gain.usd
                  )}
                </div>
                <div className="px-3 py-3 md:py-0 whitespace-nowrap flex-1 w-1/3">
                  {addDollarSignAndSuffix(position.gain.usd)}
                </div>
              </div>
            </div>
          </TranslucentCard>
        ))}
      </div>
    </>
  );
}

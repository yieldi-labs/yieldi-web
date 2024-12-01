import React, { useMemo, useState } from "react";
import { PositionsPerAsset } from "../types";
import { SortableHeader } from "@shared/components/ui";
import { SortDirection } from "@shared/components/ui/types";
import PositionRow from "./PositionRow";

interface PositionsList {
  positions: PositionsPerAsset;
  onAdd: (assetId: string) => void;
  onRemove: (assetId: string) => void;
}

enum PoolSortKey {
  PRINCIPAL = "principal",
  TOTAL_EARNING = "totalEarning",
  GAIN = "gain",
}

interface SortConfig {
  key: PoolSortKey;
  direction: SortDirection;
}

export default function PositionsList({ positions, onAdd, onRemove }: PositionsList) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: PoolSortKey.PRINCIPAL,
    direction: SortDirection.DESC,
  });
  const sortedPositions = useMemo(() => {
    const sortableItems = [...positions];
    sortableItems.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortConfig.key) {
        case PoolSortKey.GAIN:
          aValue = Number(a.gain.percentage);
          bValue = Number(b.gain.percentage);
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
        <div className="py-3 md:w-1/5 w-1/2">Asset</div>
        <div className="flex flex-1 md:w-4/5 w-1/2 justify-between">
          <div className="w-1/2 md:w-1/5">
            <SortableHeader<PoolSortKey>
              label="Gain"
              sortKey={PoolSortKey.GAIN}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
          <div className="w-1/2 md:w-1/5">
            <SortableHeader<PoolSortKey>
              label="Principal"
              sortKey={PoolSortKey.PRINCIPAL}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
          <div className="hidden md:flex w-1/3 md:w-1/5">
            <SortableHeader<PoolSortKey>
              label="Total earning"
              sortKey={PoolSortKey.TOTAL_EARNING}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
          <div className="hidden md:flex px-3 py-3 w-2/5">Actions</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {sortedPositions.map((position) => (
          <PositionRow 
            key={`${position.assetId}-${position.type}`} 
            position={position} 
            onAdd={onAdd} 
            onRemove={onRemove} 
          />
        ))}
      </div>
    </>
  );
}

import React, { useMemo, useState } from "react";
import { SortableHeader, Timer } from "@shared/components/ui";
import { SortDirection } from "@shared/components/ui/types";
import PositionRow from "./PositionRow";
import {
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import PositionsPlaceholder from "./PositionsPlaceholder";
import { useAppState } from "@/utils/contexts/context";
import { ChainKey } from "@/utils/wallet/constants";
import { assetFromString } from "@xchainjs/xchain-util";
import { getChainKeyFromChain } from "@/utils/chain";

interface PositionsList {
  positions: PositionStats[];
  onAdd: (assetId: string, type: PositionType) => void;
  onRemove: (poolId: string, type: PositionType) => void;
  onCompletePosition: (poolId: string, type: PositionType) => void;
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

export default function PositionsList({
  positions,
  onAdd,
  onRemove,
  onCompletePosition
}: PositionsList) {
  const { walletsState } = useAppState();
  const numberConnectedWallets = Object.keys(walletsState || {}).length;

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: PoolSortKey.PRINCIPAL,
    direction: SortDirection.DESC,
  });

  const isActionDisabled = (
    position: PositionStats,
    chainKey: ChainKey,
    actionn: "add" | "remove",
  ): string | React.ReactNode | null => {
    if (
      position.liquidityLockUpRemainingInSeconds > 0 &&
      actionn === "remove"
    ) {
      return (
        <div className="w-[300px] flex">
          <div className="whitespace-normal break-words">
            <span>
              Liquidity is currently in the lockup period and cannot be
              withdrawn. Your liquidity will become withdrawable in:{" "}
              <Timer
                initialTimes={[position.liquidityLockUpRemainingInSeconds]}
              />
            </span>
          </div>
        </div>
      );
    } else if (
      position.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING ||
      position.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING
    ) {
      return "Action in progress";
    } else if (
      position.type === PositionType.SYM &&
      (!walletsState[ChainKey.THORCHAIN] || !walletsState[chainKey])
    ) {
      return "Connect wallet";
    } else {
      return null;
    }
  };

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

  if (
    Object.entries(positions).length <= 0 ||
    !positions ||
    numberConnectedWallets <= 0
  ) {
    return <PositionsPlaceholder />;
  }

  return (
    <>
      <div className="flex text-left text-base text-gray-700 mb-2 px-4">
        <div className="py-3 md:w-1/5 w-1/2">Asset</div>
        <div className="flex flex-1 md:w-4/5 w-1/2 justify-between">
          <div className="w-1/2 md:w-1/5">
            <SortableHeader<PoolSortKey>
              label="LP vs HOLD"
              sortKey={PoolSortKey.GAIN}
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={sortData}
            />
          </div>
          <div className="w-1/2 md:w-1/5">
            <SortableHeader<PoolSortKey>
              label="Deposit"
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
          <div className="hidden md:flex px-3 py-3 w-1/5">Status</div>
          <div className="hidden md:flex px-3 py-3 w-1/5">Actions</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {sortedPositions.map((position) => {
          const asset = assetFromString(position.assetId);
          if (!asset) {
            throw new Error("Invalid asset");
          }
          const chainKey = getChainKeyFromChain(asset?.chain);
          return (
            <PositionRow
              key={`${position.assetId}-${position.type}`}
              position={position}
              onAdd={onAdd}
              onRemove={onRemove}
              onCompletePosition={onCompletePosition}
              reasonToDisableAdd={isActionDisabled(position, chainKey, "add")}
              reasonToDisableRemove={isActionDisabled(
                position,
                chainKey,
                "remove",
              )}
            />
          );
        })}
      </div>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { addDollarSignAndSuffix } from "../utils";
import DashboardHighlightsCard from "./components/DashboardHighlightsCards";
import PositionsList from "./components/PositionsList";
import { PoolDetail } from "@/midgard";
import PositionsPlaceholder from "./components/PositionsPlaceholder";
import AddLiquidityModal from "../explore/components/AddLiquidityModal";
import { emptyPositionStats } from "@/hooks/usePositionStats";
import {
  PositionStats,
} from "@/hooks/dataTransformers/positionsTransformer";
import { useLiquidityPositions } from "@/utils/PositionsContext";
import Loader from "../components/Loader";
import { useAppState } from "@/utils/context";

export default function DashboardView() {
  const [selectedPool, setSelectedPool] = useState<PoolDetail>();

  const { positions, pools, isPending } = useLiquidityPositions()
  const { wallet } = useAppState()

  const allPositionsArray = useMemo(() => { // TODO: Centralized this on provider
    if (!positions) return [emptyPositionStats()];
    return Object.entries(positions).reduce(
      (pools: PositionStats[], [, types]) => {
        const chainPools = Object.entries(types)
          .filter(([, position]) => position)
          .map(([, position]) => (position as PositionStats));
        return pools.concat(chainPools);
      },
      [],
    );
  }, [positions]);

  // Calculate totals
  const totalValue = allPositionsArray?.reduce((total, position) => {
    return total + position.deposit.usd + position.gain.usd;
  }, 0);

  const totalGain = allPositionsArray?.reduce((total, position) => {
    return total + position.gain.usd;
  }, 0);

  const titleStyle =
    "my-2 md:mb-4 md:mt-0 md:text-2xl font-medium md:mb-6 text-neutral-900 md:text-neutral font-gt-america-ext uppercase";

  return (
    <main className="md:mx-16 md:space-y-5">
      <div className="flex flex-col">
        <h2 className={titleStyle}>Dashboard</h2>
        <div className="grid grid-cols-6 gap-4 md:gap-8">
          <div className="col-span-6 md:col-span-2">
            <DashboardHighlightsCard
              iconPath="icon-total-value-dashboard.svg"
              title="Total Value"
              figure={(totalValue && addDollarSignAndSuffix(totalValue)) || "-"}
            />
          </div>
          <div className="col-span-3 md:col-span-2">
            <DashboardHighlightsCard
              iconPath="icon-total-earnings-dashboard.svg"
              title="Total Earnings"
              figure={(totalGain && addDollarSignAndSuffix(totalGain)) || "-"}
            />
          </div>
          <div className="col-span-3 md:col-span-2">
            <DashboardHighlightsCard
              iconPath="icon-points-dashboard.svg"
              title="Points"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className={titleStyle}>Your positions</h2>
        <div className="w-2/3 text-neutral-800 text-sm font-normal leading-tight mb-7">
          Manage your active positions and track your earnings.
        </div>
        {positions && wallet ? (
          isPending && !positions ? (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl md:mx-16">
              <Loader />
            </div>
          ) : (
            <PositionsList
              positions={allPositionsArray}
              onAdd={(assetId) => {
                setSelectedPool(
                  pools?.find((pool) => pool.asset === assetId),
                );
              }}
              onRemove={() => {}}
            />
          )
        ) : (
          <PositionsPlaceholder />
        )}
      </div>
      {selectedPool && (
        <AddLiquidityModal
          pool={selectedPool}
          runePriceUSD={0}
          onClose={() => {
            setSelectedPool(undefined);
          }}
        />
      )}
    </main>
  );
}

"use client";

import { PoolDetails, StatsData } from "@/midgard";
import LiquidityPools from "@/app/explore/pools/LiquidityPools";
import ExploreNav from "../components/ExploreNav";

interface PoolsViewProps {
  pools: PoolDetails;
  stats: StatsData;
}

export default function PoolsView({ pools, stats }: PoolsViewProps) {
  return (
    <main className="mx-16">
      <ExploreNav />
      <LiquidityPools pools={pools} runePriceUSD={parseFloat(stats.runePriceUSD)} />
    </main>
  );
}
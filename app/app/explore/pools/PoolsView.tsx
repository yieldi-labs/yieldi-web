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
    <main className="md:mx-16 mx-4">
      <ExploreNav />
      <LiquidityPools pools={pools} runePriceUSD={parseFloat(stats.runePriceUSD)} />
    </main>
  );
}
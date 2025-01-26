"use client";

import { PoolDetails, StatsData } from "@/midgard";
import ExploreNav from "../components/ExploreNav";
import LiquidityPools from "./LiquidityPools";

interface PoolsViewProps {
  pools: PoolDetails;
  stats: StatsData;
}

export default function PoolsView({ pools, stats }: PoolsViewProps) {

  return (
    <main className="md:mx-16">
      <ExploreNav />
      <LiquidityPools
        pools={pools}
        runePriceUSD={parseFloat(stats.runePriceUSD)}
      />
    </main>
  );
}

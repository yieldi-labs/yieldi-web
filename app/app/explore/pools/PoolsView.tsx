"use client";

import { PoolDetails, StatsData } from "@/midgard";
import ExploreNav from "../components/ExploreNav";
import ExploreTable from "../components/ExploreTable";

interface PoolsViewProps {
  pools: PoolDetails;
  stats: StatsData;
}

export default function PoolsView({ pools, stats }: PoolsViewProps) {
  return (
    <main className="md:mx-16">
      <ExploreNav />
      <ExploreTable
        type="pools"
        data={pools}
        runePriceUSD={parseFloat(stats.runePriceUSD)}
      />
    </main>
  );
}

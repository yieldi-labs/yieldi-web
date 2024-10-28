"use client";

import { Saver } from "@/app/explore/types";
import ExploreNav from "../components/ExploreNav";
import { StatsData } from "@/midgard";
import ExploreTable from "../components/ExploreTable";

interface SaversViewProps {
  savers: Saver[];
  stats: StatsData;
}

export default function SaversView({ savers, stats }: SaversViewProps) {
  return (
    <main className="md:mx-16">
      <ExploreNav />
      <ExploreTable
        type="savers"
        data={savers}
        runePriceUSD={parseFloat(stats.runePriceUSD)}
      />
    </main>
  );
}

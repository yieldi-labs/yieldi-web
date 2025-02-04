"use client";

import { PoolDetails } from "@/midgard";
import ExploreNav from "../components/ExploreNav";
import LiquidityPools from "./LiquidityPools";

interface PoolsViewProps {
  pools: PoolDetails;
}

export default function PoolsView({ pools }: PoolsViewProps) {
  return (
    <main className="md:mx-16">
      <ExploreNav />
      <LiquidityPools pools={pools} />
    </main>
  );
}

"use client";

import PoolDetail from "./PoolDetail";
import { PoolDetail as PoolDetailType } from "@/midgard";

interface PoolDetailClientProps {
  pool: PoolDetailType; // Add proper type for your pool
  runePriceUSD: number;
}

export default function PoolDetailClient({
  pool,
  runePriceUSD,
}: PoolDetailClientProps) {
  return <PoolDetail pool={pool} runePriceUSD={runePriceUSD} />;
}

"use client";

import PoolDetail from "./PoolDetail";
import { PoolDetail as PoolDetailType } from "@/midgard";

interface PoolDetailClientProps {
  pool: PoolDetailType; // Add proper type for your pool
}

export default function PoolDetailClient({
  pool,
}: PoolDetailClientProps) {
  return <PoolDetail pool={pool} />;
}

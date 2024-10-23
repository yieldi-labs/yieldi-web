import PoolDetailClient from './PoolDetailClient';
import { getPools, getStats } from "@/midgard";
import { notFound } from 'next/navigation';

export default async function PoolDetailPage({ 
  params 
}: { 
  params: { asset: string } 
}) {
  const [poolsData, statsData] = await Promise.all([
    getPools(),
    getStats()
  ]);

  if (!poolsData.data || !statsData.data) return null;

  const pool = poolsData.data.find(p => p.asset === params.asset);
  if (!pool) return notFound();

  return (
    <PoolDetailClient 
      pool={pool} 
      runePriceUSD={parseFloat(statsData.data.runePriceUSD)}
    />
  );
}
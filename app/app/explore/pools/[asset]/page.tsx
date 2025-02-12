import Loader from "@/app/components/Loader";
import PoolDetailClient from "./PoolDetailClient";
import { getPool, getStats } from "@/midgard";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const revalidate = 60;

export default async function PoolDetailPage({
  params,
}: {
  params: { asset: string };
}) {
  const [poolData, statsData] = await Promise.all([
    getPool({
      path: {
        asset: params.asset,
      },
      query: {
        period: "30d",
      },
    }),
    getStats(),
  ]);

  if (
    !poolData.data ||
    !statsData.data ||
    poolData.data.status.toLowerCase() !== "available"
  )
    return notFound();

  return <Suspense fallback={
    <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
      <Loader />
    </div>
    }>
    <PoolDetailClient pool={poolData.data} />
  </Suspense>;
}

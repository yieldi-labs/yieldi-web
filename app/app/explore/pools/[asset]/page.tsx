import PoolDetailClient from "./PoolDetailClient";
import { getPool, getStats } from "@/midgard";
import { notFound } from "next/navigation";

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

  return <PoolDetailClient pool={poolData.data} />;
}

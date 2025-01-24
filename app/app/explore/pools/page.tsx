import { getPools, getStats } from "@/midgard";
import PoolsView from "./PoolsView";

export default async function PoolsPage() {
  const [poolsData, statsData] = await Promise.all([
    getPools({
      query: {
        status: "available",
      },
    }),
    getStats(),
  ]);

  console.log('poolsData', poolsData.data)

  if (!poolsData.data || !statsData.data) return null;

  return <PoolsView pools={poolsData.data} stats={statsData.data} />;
}

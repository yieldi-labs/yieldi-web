import { getPools } from "@/midgard";
import PoolsView from "./PoolsView";

export const revalidate = 60;

export default async function PoolsPage() {
  const [poolsData] = await Promise.all([
    getPools({
      query: {
        period: "30d",
        status: "available",
      },
    }),
  ]);

  if (!poolsData.data) return null;

  return <PoolsView pools={poolsData.data} />;
}

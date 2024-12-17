import { getStats } from "@/midgard";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const [statsData] = await Promise.all([getStats()]);
  return (
    <DashboardView runePriceUSD={Number(statsData.data?.runePriceUSD) || 0} />
  );
}

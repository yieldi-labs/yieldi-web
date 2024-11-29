import DashboardView from "./DashboardView";
import { PositionsPerAsset } from "./types";

const positions: PositionsPerAsset = [
  {
    assetId: "BTC.BTC",
    apy: 0.1,
    type: 'SAVER',
    deposit: { asset: 0.5, usd: 25000 },
    gain: { asset: 0.1, usd: 5000 },
  },
  {
    assetId: "BTC.BTC",
    apy: 0.1,
    type: 'LP',
    deposit: { asset: 0.5, usd: 25000 },
    gain: { asset: 0.1, usd: 5000 },
  },
  {
    assetId: "ETH.ETH",
    apy: 0.1,
    type: 'LP',
    deposit: { asset: 10, usd: 20000 },
    gain: { asset: 2, usd: 4000 },
  }
]

export default async function DashboardPage() {
  return <DashboardView positions={positions} />;
}

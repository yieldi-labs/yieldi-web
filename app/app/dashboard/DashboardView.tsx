"use client";

import { addDollarSignAndSuffix } from "../utils";
import DashboardHighlightsCard from "./components/DashboardHighlightsCards";
import PositionsList from "./components/PositionsList";
import { PositionsPerAsset } from "./types";

interface PositionsViewProps {
  positions: PositionsPerAsset;
}

export default function DashboardView({ positions }: PositionsViewProps) {
  const titleStyle = 'my-2 md:mb-4 md:mt-0 md:text-2xl font-medium md:mb-6 text-neutral-900 md:text-neutral font-gt-america-ext uppercase'
  return (
    <main className="md:mx-16">
      <div className="flex flex-col md:mb-10">
        <h2 className={titleStyle}>
          Dashboard
        </h2>
        <div className="grid grid-cols-6 gap-4 md:gap-8">
          <div className="col-span-6 md:col-span-2">
            <DashboardHighlightsCard iconPath="icon-total-value-dashboard.svg" title='Total Value (Maybe?)' figure={addDollarSignAndSuffix(0)} />
          </div>
          <div className="col-span-3 md:col-span-2">
            <DashboardHighlightsCard iconPath="icon-total-earnings-dashboard.svg" title='Total Earnings' figure={addDollarSignAndSuffix(0)} />
          </div>
          <div className="col-span-3 md:col-span-2">
            <DashboardHighlightsCard iconPath="icon-points-dashboard.svg" title='Points' figure='-' />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className={titleStyle}>
          Your positions
        </h2>
        <div className="w-2/3 text-neutral-800 text-sm font-normal leading-tight mb-7">Manage your active positions and track your earnings.</div>
        <PositionsList positions={positions} />
      </div>
    </main>
  );
}

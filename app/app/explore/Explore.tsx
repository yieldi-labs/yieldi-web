"use client";

import { useState } from "react";
import LiquidityPools from "./LiquidityPools";
import SaverVaults from "./SaverVaults";
import { PoolDetails, StatsData } from "@/midgard";

export interface Saver {
  asset: string;
  saversCount: number;
  saversReturn: string;
  earned: string;
  filled: number;
  assetPriceUSD: string;
  saversDepth: string;
  assetDepth: string;
  synthSupply: string;
}

interface ExploreProps {
  pools: PoolDetails;
  stats: StatsData;
  savers: Saver[];
}

const Explore = ({ pools, stats, savers }: ExploreProps) => {
  const [activeTab, setActiveTab] = useState("liquidity");
  const runePriceUSD = parseFloat(stats.runePriceUSD);

  return (
    <main className="mx-auto">
      <nav className="mb-4">
        <ul className="flex space-x-8 font-semibold font-gt-america-exp text-2xl">
          <li>
            <a
              href="#"
              onClick={() => setActiveTab("liquidity")}
              className={`pb-2 no-underline ${activeTab === "liquidity" ? "text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 font-medium"}`}
            >
              LIQUIDITY POOLS
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={() => setActiveTab("savers")}
              className={`pb-2 no-underline ${activeTab === "savers" ? "text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 font-medium"}`}
            >
              SAVER VAULTS
            </a>
          </li>
        </ul>
      </nav>

      {activeTab === "liquidity" ? (
        <LiquidityPools pools={pools} runePriceUSD={runePriceUSD} />
      ) : (
        <SaverVaults savers={savers} />
      )}
    </main>
  );
};

export default Explore;

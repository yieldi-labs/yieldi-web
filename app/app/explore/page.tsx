"use client";

import { useState, useEffect } from "react";
import LiquidityPools from "./LiquidityPools";
import SaverVaults from "./SaverVaults";
import { fetchJson } from "@/app/utils";

interface Pool {
  asset: string;
  assetPriceUSD: string;
  volume24h: string;
  depth: string;
  poolAPY: string;
  assetDepth: string;
  runeDepth: string;
  nativeDecimal: string;
}

interface Saver {
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

const Explore = () => {
  const [activeTab, setActiveTab] = useState("liquidity");
  const [pools, setPools] = useState<Pool[]>([]);
  const [savers, setSavers] = useState<Saver[]>([]);
  const [runePriceUSD, setRunePriceUSD] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [poolsData, statsData, saversData] = await Promise.all([
          fetchJson("https://midgard.ninerealms.com/v2/pools"),
          fetchJson("https://midgard.ninerealms.com/v2/stats"),
          fetchJson("https://vanaheimex.com/api/saversInfo"),
        ]);
        setPools(poolsData);
        setSavers(Object.values(saversData).map((s) => s.savers));
        setRunePriceUSD(parseFloat(statsData.runePriceUSD));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      {loading ? (
        <p>Loading data...</p>
      ) : activeTab === "liquidity" ? (
        <LiquidityPools pools={pools} runePriceUSD={runePriceUSD} />
      ) : (
        <SaverVaults savers={savers} />
      )}
    </main>
  );
};

export default Explore;

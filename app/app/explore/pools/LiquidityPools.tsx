import { useState, useMemo } from "react";
import Image from "next/image";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "@/app/explore/TopCards";
import {
  addDollarSignAndSuffix,
  calculatePoolTVL,
  calculateVolumeDepthRatio,
  calculateVolumeUSD,
  formatNumber,
  getFormattedPoolTVL,
} from "@/app/utils";
import { PoolDetails } from "@/midgard";
import { DoubleArrow } from "@shared/components/svg";

interface LiquidityPoolsProps {
  pools: PoolDetails;
  runePriceUSD: number;
}

enum SortKey {
  TVL = "tvl",
  APR = "apr",
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const LiquidityPools: React.FC<LiquidityPoolsProps> = ({
  pools,
  runePriceUSD,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SortKey.TVL,
    direction: SortDirection.DESC,
  });

  const sortedPools = useMemo(() => {
    const sortableItems = [...pools];
    sortableItems.sort((a, b) => {
      if (sortConfig.key === SortKey.TVL) {
        const aTvl = calculatePoolTVL(a, runePriceUSD);
        const bTvl = calculatePoolTVL(b, runePriceUSD);
        return sortConfig.direction === SortDirection.ASC
          ? aTvl - bTvl
          : bTvl - aTvl;
      } else if (sortConfig.key === SortKey.APR) {
        const aApr = parseFloat(a.poolAPY);
        const bApr = parseFloat(b.poolAPY);
        return sortConfig.direction === SortDirection.ASC
          ? aApr - bApr
          : bApr - aApr;
      }
      return 0;
    });
    return sortableItems;
  }, [pools, sortConfig, runePriceUSD]);

  const getAssetSymbol = (asset: string) => {
    return asset.split("-")[0] || asset;
  };

  const getLogoPath = (asset: string) => {
    const assetLower = asset.toLowerCase();
    return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
  };

  const sortData = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
    }));
  };

  const topPools = sortedPools.slice(0, 3);
  const topPoolsData = topPools.map((pool) => ({
    asset: pool.asset,
    formattedTVL: getFormattedPoolTVL(pool, runePriceUSD),
    apr: parseFloat(pool.poolAPY),
  }));

  return (
    <div className="w-full">
      {/* Top section with cards */}
      <div className="mb-8">
        <TopCards
          items={topPoolsData}
          getAssetSymbol={getAssetSymbol}
          getLogoPath={getLogoPath}
          linkPath="pools"
        />
      </div>

      {/* All Pools section */}
      <div className="mb-4">
        <h2 className="text-base md:text-xl font-medium mb-4">All Pools</h2>
      </div>

      {/* Table section with horizontal scroll */}
      <div className="relative -mx-4 md:mx-0">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full md:px-0">
            <div className="min-w-[800px] px-4 md:px-0">
              {/* Table Header */}
              <div className="flex text-left text-sm md:text-base text-gray-700 mb-2">
                <div className="w-48 md:w-1/3 p-3">Asset</div>
                <div className="flex flex-1 justify-between">
                  <div className="w-1/4 p-3">Volume (24h)</div>
                  <div className="w-1/4 p-3">Volume/Depth</div>
                  <div
                    className="w-1/4 p-3 flex items-center cursor-pointer"
                    onClick={() => sortData(SortKey.TVL)}
                  >
                    TVL
                    <DoubleArrow className="ml-1 w-4 h-4" />
                  </div>
                  <div
                    className="w-1/4 p-3 flex items-center cursor-pointer"
                    onClick={() => sortData(SortKey.APR)}
                  >
                    APR
                    <DoubleArrow className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="space-y-1.5">
                {sortedPools.map((pool) => {
                  const volumeUSD = calculateVolumeUSD(pool, runePriceUSD);
                  const volumeDepthRatio = calculateVolumeDepthRatio(
                    pool,
                    runePriceUSD,
                  );
                  return (
                    <TranslucentCard key={pool.asset} className="rounded-xl">
                      <div className="flex items-center w-full">
                        <div className="w-48 md:w-1/3 p-3">
                          <div className="flex items-center">
                            <Image
                              src={getLogoPath(pool.asset)}
                              alt={`${getAssetSymbol(pool.asset)} logo`}
                              width={28}
                              height={28}
                              className="rounded-full"
                            />
                            <span className="ml-3 font-medium text-sm md:text-base">
                              {getAssetSymbol(pool.asset)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-1 justify-between text-sm md:text-base">
                          <div className="w-1/4 p-3">
                            {addDollarSignAndSuffix(volumeUSD)}
                          </div>
                          <div className="w-1/4 p-3">
                            {formatNumber(volumeDepthRatio, 2, 2)}
                          </div>
                          <div className="w-1/4 p-3">
                            {getFormattedPoolTVL(pool, runePriceUSD)}
                          </div>
                          <div className="w-1/4 p-3">
                            {formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}
                            %
                          </div>
                        </div>
                      </div>
                    </TranslucentCard>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPools;

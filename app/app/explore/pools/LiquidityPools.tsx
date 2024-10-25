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
  getAssetCanonicalSymbol,
  getFormattedPoolTVL,
  getLogoPath,
} from "@/app/utils";
import { PoolDetails } from "@/midgard";
import Link from "next/link";
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
    <>
      <TopCards
        items={topPoolsData}
        getAssetSymbol={getAssetCanonicalSymbol}
        getLogoPath={getLogoPath}
        linkPath="pools"
      />

      {/* All Pools table */}
      <h2 className="text-xl font-medium mb-4">All Pools</h2>
      <div className="overflow-hidden">
        <div className="min-w-full">
          <div className="flex text-left text-base text-gray-700">
            <div className="px-3 py-3 w-1/2">Asset</div>
            <div className="flex flex-1 w-1/2 justify-between">
              <div className="px-3 py-3 w-1/4 ml-6">Volume (24h)</div>
              <div className="px-3 py-3 w-1/4">Volume/Depth</div>
              <div
                className="px-3 py-3 w-1/4 flex items-center cursor-pointer"
                onClick={() => sortData(SortKey.TVL)}
              >
                TVL
                <DoubleArrow className="ml-1" />
              </div>
              <div
                className="px-3 py-3 w-1/4 flex items-center cursor-pointer"
                onClick={() => sortData(SortKey.APR)}
              >
                APR
                <DoubleArrow className="ml-1" />
              </div>
            </div>
          </div>
          <div className="min-w-full">
            {sortedPools.map((pool) => {
              const volumeUSD = calculateVolumeUSD(pool, runePriceUSD);
              const volumeDepthRatio = calculateVolumeDepthRatio(
                pool,
                runePriceUSD,
              );
              return (
                <Link key={pool.asset} href={`/explore/pools/${pool.asset}`}>
                  <TranslucentCard
                    key={pool.asset}
                    className="rounded-xl mb-1.5"
                  >
                    <div className="flex items-center min-w-full">
                      <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                        <div className="flex items-center">
                          <Image
                            src={getLogoPath(pool.asset)}
                            alt={`${getAssetCanonicalSymbol(pool.asset)} logo`}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                          <span className="ml-3 font-medium">
                            {getAssetCanonicalSymbol(pool.asset)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start flex-1 w-2/3">
                        <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                          {addDollarSignAndSuffix(volumeUSD)}
                        </div>
                        <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                          {formatNumber(volumeDepthRatio, 2, 2)}
                        </div>
                        <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                          {getFormattedPoolTVL(pool, runePriceUSD)}
                        </div>
                        <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                          {formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%
                        </div>
                      </div>
                    </div>
                  </TranslucentCard>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LiquidityPools;

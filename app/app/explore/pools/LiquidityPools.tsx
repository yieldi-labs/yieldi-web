import { useState, useMemo } from "react";
import Image from "next/image";
import { PoolDetail, PoolDetails } from "@/midgard";
import {
  formatNumber,
  addDollarSignAndSuffix,
  getAssetSymbol,
  getLogoPath,
} from "@/app/utils";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "../../components/TopCards";
import SortHeader from "../../../../shared/components/ui/SortHeader";
import { useMobileDetection } from "@shared/hooks";

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

const calculatePoolTVL = (pool: PoolDetail): number => {
  const assetDepth = parseFloat(pool.assetDepth) / 1e8;
  const assetPriceUSD = parseFloat(pool.assetPriceUSD);
  return assetDepth * assetPriceUSD;
};

const calculateVolumeUSD = (pool: PoolDetail, runePriceUSD: number): number => {
  const volumeInRune = parseFloat(pool.volume24h) / 1e8;
  return volumeInRune * runePriceUSD;
};

const calculateVolumeDepthRatio = (
  pool: PoolDetail,
  runePriceUSD: number,
): number => {
  const volumeUSD = calculateVolumeUSD(pool, runePriceUSD);
  const tvlUSD = calculatePoolTVL(pool);
  return volumeUSD / tvlUSD;
};

const getFormattedPoolTVL = (pool: PoolDetail): string => {
  const tvlUSD = calculatePoolTVL(pool);
  return addDollarSignAndSuffix(tvlUSD);
};

const LiquidityPools: React.FC<LiquidityPoolsProps> = ({
  pools,
  runePriceUSD,
}) => {
  const isMobile = useMobileDetection();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SortKey.TVL,
    direction: SortDirection.DESC,
  });

  const sortedPools = useMemo(() => {
    const sortableItems = [...pools];
    sortableItems.sort((a, b) => {
      if (sortConfig.key === SortKey.TVL) {
        const aTvl = calculatePoolTVL(a);
        const bTvl = calculatePoolTVL(b);
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
  }, [pools, sortConfig]);

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
    formattedTVL: getFormattedPoolTVL(pool),
    apr: parseFloat(pool.poolAPY),
  }));

  const renderMobileCard = (pool: PoolDetail) => (
    <TranslucentCard key={pool.asset} className="rounded-xl mb-1.5">
      <div className="flex items-center w-full flex-col p-1">
        <div className="w-full flex items-center mb-2">
          <Image
            src={getLogoPath(pool.asset)}
            alt={`${getAssetSymbol(pool.asset)} logo`}
            width={26}
            height={26}
            className="rounded-full"
          />
          <span className="ml-3 font-medium text-sm md:text-base">
            {getAssetSymbol(pool.asset)}
          </span>
        </div>
        <div className="flex flex-row w-full gap-1">
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {addDollarSignAndSuffix(calculateVolumeUSD(pool, runePriceUSD))}
            </p>
            <p className="text-xs text-neutral-800">Volume (24h)</p>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {formatNumber(
                calculateVolumeDepthRatio(pool, runePriceUSD),
                2,
                2,
              )}
            </p>
            <p className="text-xs text-neutral-800">Volume/Depth</p>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {getFormattedPoolTVL(pool)}
            </p>
            <p className="text-xs text-neutral-800">TVL</p>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%
            </p>
            <p className="text-xs text-neutral-800">APR</p>
          </div>
        </div>
      </div>
    </TranslucentCard>
  );

  return (
    <div className="w-full">
      {/* Top cards, hidden on mobile*/}
      <div className="mb-8 md:block hidden">
        <TopCards items={topPoolsData} />
      </div>

      <div className="relative -mx-4 md:mx-0">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full md:px-0">
            <div className="w-full px-4 md:px-0">
              {!isMobile ? (
                <>
                  <div className="flex text-left text-base text-gray-700 mb-2">
                    <div className="px-3 py-3 w-1/2">Asset</div>
                    <div className="flex flex-1 w-1/2 justify-between">
                      <div className="px-3 py-3 w-1/4 ml-6">Volume (24h)</div>
                      <div className="px-3 py-3 w-1/4">Volume/Depth</div>
                      <div
                        className="px-3 py-3 w-1/4 flex items-center cursor-pointer"
                        onClick={() => sortData(SortKey.TVL)}
                      >
                        TVL
                        <Image
                          src="/arrow-unfold.svg"
                          alt="Sort"
                          width={16}
                          height={16}
                          className="ml-1"
                        />
                      </div>
                      <div
                        className="px-3 py-3 w-1/4 flex items-center cursor-pointer"
                        onClick={() => sortData(SortKey.APR)}
                      >
                        APR
                        <Image
                          src="/arrow-unfold.svg"
                          alt="Sort"
                          width={16}
                          height={16}
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {sortedPools.map((pool) => (
                      <TranslucentCard key={pool.asset} className="rounded-xl">
                        <div className="flex items-center w-full">
                          <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                            <div className="flex items-center">
                              <Image
                                src={getLogoPath(pool.asset)}
                                alt={`${getAssetSymbol(pool.asset)} logo`}
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                              <span className="ml-3 font-medium">
                                {getAssetSymbol(pool.asset)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start flex-1 w-2/3">
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                              {addDollarSignAndSuffix(
                                calculateVolumeUSD(pool, runePriceUSD),
                              )}
                            </div>
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                              {formatNumber(
                                calculateVolumeDepthRatio(pool, runePriceUSD),
                                2,
                                2,
                              )}
                            </div>
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                              {getFormattedPoolTVL(pool)}
                            </div>
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                              {formatNumber(
                                parseFloat(pool.poolAPY) * 100,
                                2,
                                2,
                              )}
                              %
                            </div>
                          </div>
                        </div>
                      </TranslucentCard>
                    ))}
                  </div>
                </>
              ) : (
                // Mobile layout with sections
                <div className="space-y-2 mt-4">
                  {/* Top Section */}
                  <div>
                    <div className="flex flex-row justify-between items-center">
                      <h2 className="text-base font-medium mb-2 text-neutral-900">
                        Top Pools
                      </h2>
                      <SortHeader
                        sortConfig={sortConfig}
                        onSort={sortData}
                        columns={[
                          {
                            key: SortKey.TVL,
                            label: "TVL",
                          },
                          {
                            key: SortKey.APR,
                            label: "APR",
                          },
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      {sortedPools.slice(0, 3).map(renderMobileCard)}
                    </div>
                  </div>

                  {/* All Pools Section */}
                  <div>
                    <h2 className="text-base font-medium mb-1 text-neutral-900">
                      All Pools
                    </h2>
                    <div className="space-y-1.5">
                      {sortedPools.slice(3).map(renderMobileCard)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPools;

import { useState, useMemo } from "react";
import Image from "next/image";
import TranslucentCard from "../translucentCard";
import TopCards from "./TopCards";
import { formatNumber } from "@/app/utils";
import { PoolDetail, PoolDetails } from "@/midgard";

interface LiquidityPoolsProps {
  pools: PoolDetails;
  runePriceUSD: number;
}

enum SortKey {
  TVL = 'tvl',
  APR = 'apr'
}

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const LiquidityPools: React.FC<LiquidityPoolsProps> = ({ pools, runePriceUSD }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: SortKey.TVL, direction: SortDirection.DESC });

  const calculateTVL = (pool: PoolDetail) => {
    const assetValueInUSD =
      (parseFloat(pool.assetDepth) * parseFloat(pool.assetPriceUSD)) / 1e8;
    const runeValueInUSD = (parseFloat(pool.runeDepth) * runePriceUSD) / 1e8;
    return (assetValueInUSD + runeValueInUSD) / 1e6;
  };

  const sortedPools = useMemo(() => {
    const sortableItems = [...pools];
    sortableItems.sort((a, b) => {
      if (sortConfig.key === SortKey.TVL) {
        const aTvl = calculateTVL(a);
        const bTvl = calculateTVL(b);
        return sortConfig.direction === SortDirection.ASC ? aTvl - bTvl : bTvl - aTvl;
      } else if (sortConfig.key === SortKey.APR) {
        const aApr = parseFloat(a.poolAPY);
        const bApr = parseFloat(b.poolAPY);
        return sortConfig.direction === SortDirection.ASC ? aApr - bApr : bApr - aApr;
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

  const calculateVolumeUSD = (pool: PoolDetail) => {
    const volumeInRune = parseFloat(pool.volume24h) / 1e8;
    return volumeInRune * runePriceUSD;
  };

  const calculateVolumeDepthRatio = (pool: PoolDetail) => {
    const volumeUSD = calculateVolumeUSD(pool);
    const tvlUSD = calculateTVL(pool) * 1e6;
    return volumeUSD / tvlUSD;
  };

  const sortData = (key: SortKey) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
    }));
  };

  const topPools = sortedPools.slice(0, 3);
  const topPoolsData = topPools.map(pool => ({
    asset: pool.asset,
    tvl: calculateTVL(pool),
    apr: parseFloat(pool.poolAPY)
  }));

  return (
    <>
      <TopCards 
        items={topPoolsData}
        getAssetSymbol={getAssetSymbol}
        getLogoPath={getLogoPath}
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
              <div className="px-3 py-3 w-1/4 flex items-center cursor-pointer" onClick={() => sortData(SortKey.TVL)}>
                TVL
                <Image src="/arrow-unfold.svg" alt="Sort" width={16} height={16} className="ml-1" />
              </div>
              <div className="px-3 py-3 w-1/4 flex items-center cursor-pointer" onClick={() => sortData(SortKey.APR)}>
                APR
                <Image src="/arrow-unfold.svg" alt="Sort" width={16} height={16} className="ml-1" />
              </div>
            </div>
          </div>
          <div className="min-w-full">
            {sortedPools.map((pool) => {
              const tvl = calculateTVL(pool);
              const volumeUSD = calculateVolumeUSD(pool);
              const volumeDepthRatio = calculateVolumeDepthRatio(pool);
              return (
                <TranslucentCard key={pool.asset} className="rounded-xl mb-1.5">
                  <div className="flex items-center min-w-full">
                    <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                      <div className="flex items-center">
                        <Image src={getLogoPath(pool.asset)} alt={`${getAssetSymbol(pool.asset)} logo`} width={28} height={28} className="rounded-full" />
                        <span className="ml-3 font-medium">{getAssetSymbol(pool.asset)}</span>
                      </div>
                    </div>
                    <div className="flex items-start flex-1 w-2/3">
                      <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">${formatNumber(volumeUSD, 0, 0)}</div>
                      <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{formatNumber(volumeDepthRatio, 2, 2)}</div>
                      <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">${formatNumber(tvl, 2, 2)}M</div>
                      <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%</div>
                    </div>
                  </div>
                </TranslucentCard>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default LiquidityPools;
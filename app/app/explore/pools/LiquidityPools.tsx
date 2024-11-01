import { useState, useMemo } from "react";
import Image from "next/image";
import { PoolDetail, PoolDetails } from "@/midgard";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  formatNumber,
  addDollarSignAndSuffix,
  getAssetSymbol,
  getLogoPath,
} from "@/app/utils";
import TranslucentCard from "@/app/TranslucentCard";
import {
  useBodyOverflow,
  useMeasureHeight,
  useMobileDetection,
} from "@shared/hooks";
import MobileSortableHeader from "@shared/components/ui/MobileSortableHeader";
import TopCards from "@/app/components/TopCards";
import { SortDirection } from "@shared/components/ui/types";
import { SortableHeader } from "@shared/components/ui";

interface LiquidityPoolsProps {
  pools: PoolDetails;
  runePriceUSD: number;
}

enum PoolSortKey {
  VOLUME = "volume",
  VOLUME_DEPTH = "volumeDepth",
  TVL = "tvl",
  APR = "apr",
}

interface SortConfig {
  key: PoolSortKey;
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
  useBodyOverflow(isMobile);
  const { height: mobileRowHeight, measureRef } = useMeasureHeight({
    isMobile,
    marginBottom: 6,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: PoolSortKey.TVL,
    direction: SortDirection.DESC,
  });

  const sortOptions = [
    { key: PoolSortKey.VOLUME, label: "Volume (24h)" },
    { key: PoolSortKey.VOLUME_DEPTH, label: "Volume/Depth" },
    { key: PoolSortKey.TVL, label: "TVL" },
    { key: PoolSortKey.APR, label: "APR" },
  ];

  const sortedPools = useMemo(() => {
    const sortableItems = [...pools];
    sortableItems.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortConfig.key) {
        case PoolSortKey.VOLUME:
          aValue = calculateVolumeUSD(a, runePriceUSD);
          bValue = calculateVolumeUSD(b, runePriceUSD);
          break;
        case PoolSortKey.VOLUME_DEPTH:
          aValue = calculateVolumeDepthRatio(a, runePriceUSD);
          bValue = calculateVolumeDepthRatio(b, runePriceUSD);
          break;
        case PoolSortKey.TVL:
          aValue = calculatePoolTVL(a);
          bValue = calculatePoolTVL(b);
          break;
        case PoolSortKey.APR:
          aValue = parseFloat(a.poolAPY);
          bValue = parseFloat(b.poolAPY);
          break;
        default:
          return 0;
      }

      return sortConfig.direction === SortDirection.ASC
        ? aValue - bValue
        : bValue - aValue;
    });
    return sortableItems;
  }, [pools, sortConfig, runePriceUSD]);

  const sortData = (key: PoolSortKey, direction?: SortDirection) => {
    if (direction) {
      setSortConfig({ key, direction });
    } else {
      setSortConfig((prevConfig) => ({
        key,
        direction:
          prevConfig.key === key && prevConfig.direction === SortDirection.DESC
            ? SortDirection.ASC
            : SortDirection.DESC,
      }));
    }
  };

  const topPoolsData = sortedPools.slice(0, 3).map((pool) => ({
    asset: pool.asset,
    formattedTVL: getFormattedPoolTVL(pool),
    apr: parseFloat(pool.poolAPY),
  }));

  const MobileCard = ({ pool }: { pool: PoolDetail }) => (
    <TranslucentCard className="rounded-xl mb-1.5">
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
                calculateVolumeDepthRatio(pool, runePriceUSD) * 100,
                2,
                2,
              )}
              %
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

  const MobileRow = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const pool = sortedPools[index];
    return (
      <div style={style}>
        <MobileCard pool={pool} />
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Hidden measurement div */}
        <div ref={measureRef}>
          <MobileCard pool={sortedPools[0]} />
        </div>

        {/* Sort header */}
        <div className="mb-4 flex flex-1 justify-end">
          <MobileSortableHeader<PoolSortKey>
            sortConfig={sortConfig}
            options={sortOptions}
            onSort={sortData}
          />
        </div>

        {/* Virtualized list */}
        <div className="h-[calc(100vh-170px)]">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={sortedPools.length}
                itemSize={mobileRowHeight}
                className="pb-16"
              >
                {MobileRow}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }

  // Desktop view with sortable columns
  return (
    <div className="w-full">
      <div className="mb-8">
        <TopCards items={topPoolsData} />
      </div>

      <div className="relative -mx-4 md:mx-0">
        <div className="flex text-left text-base text-gray-700 mb-2 px-4">
          <div className="px-3 py-3 w-1/2">Asset</div>
          <div className="flex flex-1 w-1/2 justify-between">
            <div className="w-1/4">
              <SortableHeader<PoolSortKey>
                label="Volume (24h)"
                sortKey={PoolSortKey.VOLUME}
                currentSortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSort={sortData}
              />
            </div>
            <div className="w-1/4">
              <SortableHeader<PoolSortKey>
                label="Volume/Depth"
                sortKey={PoolSortKey.VOLUME_DEPTH}
                currentSortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSort={sortData}
              />
            </div>
            <div className="w-1/4">
              <SortableHeader<PoolSortKey>
                label="TVL"
                sortKey={PoolSortKey.TVL}
                currentSortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSort={sortData}
              />
            </div>
            <div className="w-1/4">
              <SortableHeader<PoolSortKey>
                label="APR"
                sortKey={PoolSortKey.APR}
                currentSortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSort={sortData}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {sortedPools.map((pool) => (
            <TranslucentCard key={pool.asset} className="rounded-xl mx-4">
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
                      calculateVolumeDepthRatio(pool, runePriceUSD) * 100,
                      2,
                      2,
                    )}
                    %
                  </div>
                  <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                    {getFormattedPoolTVL(pool)}
                  </div>
                  <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                    {formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%
                  </div>
                </div>
              </div>
            </TranslucentCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiquidityPools;

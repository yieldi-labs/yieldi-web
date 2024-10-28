import { useState, useMemo } from "react";
import Image from "next/image";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "@/app/explore/TopCards";
import { DoubleArrow } from "@shared/components/svg";
import { PoolDetail, PoolDetails } from "@/midgard";
import {
  addDollarSignAndSuffix,
  calculatePoolTVL,
  calculateVolumeDepthRatio,
  calculateVolumeUSD,
  calculateSaverTVL,
  formatNumber,
  getFormattedPoolTVL,
  getFormattedSaverTVL,
} from "@/app/utils";

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

interface Column {
  key: string;
  label: string;
  width: string;
  sortable?: boolean;
  render: (item: any) => React.ReactNode;
}

interface ExploreTableProps {
  type: "pools" | "savers";
  data: PoolDetails | Saver[];
  runePriceUSD?: number;
  title: string;
}

const getAssetSymbol = (asset: string) => {
  return asset.split("-")[0] || asset;
};

const getLogoPath = (asset: string) => {
  const assetLower = asset.toLowerCase();
  return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
};

export default function ExploreTable({
  type,
  data,
  runePriceUSD,
  title,
}: ExploreTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SortKey.TVL,
    direction: SortDirection.DESC,
  });

  const columns: Column[] =
    type === "pools"
      ? [
          {
            key: "asset",
            label: "Asset",
            width: "w-48 md:w-1/3",
            render: (pool) => (
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
            ),
          },
          {
            key: "volume",
            label: "Volume (24h)",
            width: "w-1/4",
            render: (pool) =>
              addDollarSignAndSuffix(calculateVolumeUSD(pool, runePriceUSD!)),
          },
          {
            key: "volumeDepth",
            label: "Volume/Depth",
            width: "w-1/4",
            render: (pool) =>
              formatNumber(
                calculateVolumeDepthRatio(pool, runePriceUSD!),
                2,
                2,
              ),
          },
          {
            key: "tvl",
            label: "TVL",
            width: "w-1/4",
            sortable: true,
            render: (pool) => getFormattedPoolTVL(pool, runePriceUSD!),
          },
          {
            key: "apr",
            label: "APR",
            width: "w-1/4",
            sortable: true,
            render: (pool) =>
              `${formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%`,
          },
        ]
      : [
          {
            key: "asset",
            label: "Asset",
            width: "w-48 md:w-1/3",
            render: (saver) => (
              <div className="flex items-center">
                <Image
                  src={getLogoPath(saver.asset)}
                  alt={`${getAssetSymbol(saver.asset)} logo`}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <span className="ml-3 font-medium text-sm md:text-base">
                  {getAssetSymbol(saver.asset)}
                </span>
              </div>
            ),
          },
          {
            key: "saversCount",
            label: "Savers",
            width: "w-1/4",
            render: (saver) => saver.saversCount,
          },
          {
            key: "filled",
            label: "Utilization",
            width: "w-1/4",
            render: (saver) => `${formatNumber(saver.filled * 100, 2, 2)}%`,
          },
          {
            key: "tvl",
            label: "TVL",
            width: "w-1/4",
            sortable: true,
            render: (saver) => getFormattedSaverTVL(saver),
          },
          {
            key: "apr",
            label: "APR",
            width: "w-1/4",
            sortable: true,
            render: (saver) =>
              `${formatNumber(parseFloat(saver.saversReturn) * 100, 2, 2)}%`,
          },
        ];

  const sortedData = useMemo(() => {
    const items = [...data];
    items.sort((a, b) => {
      if (sortConfig.key === SortKey.TVL) {
        const aTvl =
          type === "pools"
            ? calculatePoolTVL(a as unknown as PoolDetail, runePriceUSD!)
            : calculateSaverTVL(a as unknown as Saver);
        const bTvl =
          type === "pools"
            ? calculatePoolTVL(b as unknown as PoolDetail, runePriceUSD!)
            : calculateSaverTVL(b as unknown as Saver);
        return sortConfig.direction === SortDirection.ASC
          ? aTvl - bTvl
          : bTvl - aTvl;
      } else if (sortConfig.key === SortKey.APR) {
        const aApr =
          type === "pools"
            ? parseFloat((a as unknown as PoolDetail).poolAPY)
            : parseFloat((a as unknown as Saver).saversReturn);
        const bApr =
          type === "pools"
            ? parseFloat((b as unknown as PoolDetail).poolAPY)
            : parseFloat((b as unknown as Saver).saversReturn);
        return sortConfig.direction === SortDirection.ASC
          ? aApr - bApr
          : bApr - aApr;
      }
      return 0;
    });
    return items;
  }, [data, sortConfig, type, runePriceUSD]);

  const topItems = sortedData.slice(0, 3).map((item) => ({
    asset: item.asset,
    formattedTVL:
      type === "pools"
        ? getFormattedPoolTVL(item as unknown as PoolDetail, runePriceUSD!)
        : getFormattedSaverTVL(item as unknown as Saver),
    apr:
      type === "pools"
        ? parseFloat((item as unknown as PoolDetail).poolAPY)
        : parseFloat((item as unknown as Saver).saversReturn),
  }));

  const sortData = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
    }));
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <TopCards
          items={topItems}
          getAssetSymbol={getAssetSymbol}
          getLogoPath={getLogoPath}
          linkPath={type}
        />
      </div>

      <div className="mb-4">
        <h2 className="text-base md:text-xl font-medium mb-4">{title}</h2>
      </div>

      <div className="relative -mx-4 md:mx-0">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full md:px-0">
            <div className="min-w-[800px] px-4 md:px-0">
              <div className="flex text-left text-sm md:text-base text-gray-700 mb-2">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`${col.width} p-3 ${col.sortable ? "cursor-pointer" : ""} flex items-center`}
                    onClick={() => col.sortable && sortData(col.key as SortKey)}
                  >
                    {col.label}
                    {col.sortable && <DoubleArrow className="ml-1 w-4 h-4" />}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                {sortedData.map((item) => (
                  <TranslucentCard key={item.asset} className="rounded-xl">
                    <div className="flex items-center w-full">
                      {columns.map((col) => (
                        <div key={col.key} className={`${col.width} p-3`}>
                          {col.render(item)}
                        </div>
                      ))}
                    </div>
                  </TranslucentCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import Image from "next/image";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  addDollarSignAndSuffix,
  formatNumber,
  getAssetSimpleSymbol,
  getLogoPath,
} from "@/app/utils";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "@/app/components/TopCards";
import MobileSortableHeader from "@shared/components/ui/MobileSortableHeader";
import {
  useBodyOverflow,
  useMeasureHeight,
  useMobileDetection,
} from "@shared/hooks";
import { SortDirection } from "@shared/components/ui/types";
import { SortableHeader } from "@shared/components/ui";

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

interface SaverVaultsProps {
  savers: Saver[];
}

enum SaverSortKey {
  SAVERS = "savers",
  UTILIZATION = "utilization",
  TVL = "tvl",
  APR = "apr",
}

interface SortConfig {
  key: SaverSortKey;
  direction: SortDirection;
}

const calculateSaverTVL = (saver: Saver): number => {
  const depth = parseFloat(saver.saversDepth) / 1e8;
  const priceUSD = parseFloat(saver.assetPriceUSD);
  return depth * priceUSD;
};

const getFormattedSaverTVL = (saver: Saver): string => {
  const tvlUSD = calculateSaverTVL(saver);
  return addDollarSignAndSuffix(tvlUSD);
};

const SaverVaults: React.FC<SaverVaultsProps> = ({ savers }) => {
  const isMobile = useMobileDetection();
  useBodyOverflow(isMobile);
  const { height: mobileRowHeight, measureRef } = useMeasureHeight({
    isMobile,
    marginBottom: 6,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SaverSortKey.TVL,
    direction: SortDirection.DESC,
  });

  const sortOptions = [
    { key: SaverSortKey.SAVERS, label: "Savers" },
    { key: SaverSortKey.UTILIZATION, label: "Utilization" },
    { key: SaverSortKey.TVL, label: "TVL" },
    { key: SaverSortKey.APR, label: "APR" },
  ];

  const sortedSavers = useMemo(() => {
    const sortableItems = [...savers];
    sortableItems.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortConfig.key) {
        case SaverSortKey.SAVERS:
          aValue = a.saversCount;
          bValue = b.saversCount;
          break;
        case SaverSortKey.UTILIZATION:
          aValue = a.filled;
          bValue = b.filled;
          break;
        case SaverSortKey.TVL:
          aValue = calculateSaverTVL(a);
          bValue = calculateSaverTVL(b);
          break;
        case SaverSortKey.APR:
          aValue = parseFloat(a.saversReturn);
          bValue = parseFloat(b.saversReturn);
          break;
        default:
          return 0;
      }

      return sortConfig.direction === SortDirection.ASC
        ? aValue - bValue
        : bValue - aValue;
    });
    return sortableItems;
  }, [savers, sortConfig]);

  const sortData = (key: SaverSortKey, direction?: SortDirection) => {
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

  const topSaversData = sortedSavers.slice(0, 3).map((saver) => ({
    asset: saver.asset,
    formattedTVL: getFormattedSaverTVL(saver),
    apr: parseFloat(saver.saversReturn),
  }));

  const MobileCard = ({ saver }: { saver: Saver }) => (
    <TranslucentCard className="rounded-xl mb-1.5">
      <div className="flex items-center w-full flex-col p-1">
        <div className="w-full flex items-center mb-2">
          <Image
            src={getLogoPath(saver.asset)}
            alt={`${getAssetSimpleSymbol(saver.asset)} logo`}
            width={26}
            height={26}
            className="rounded-full"
          />
          <span className="ml-3 font-medium text-sm md:text-base">
            {getAssetSimpleSymbol(saver.asset)}
          </span>
        </div>
        <div className="flex flex-row w-full gap-1">
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">{saver.saversCount}</p>
            <p className="text-xs text-neutral-800">Savers</p>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {formatNumber(saver.filled * 100, 2, 2)}%
            </p>
            <p className="text-xs text-neutral-800">Utilization</p>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {getFormattedSaverTVL(saver)}
            </p>
            <p className="text-xs text-neutral-800">TVL</p>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white">
            <p className="text-sm text-neutral mb-1">
              {formatNumber(parseFloat(saver.saversReturn) * 100, 2, 2)}%
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
    const saver = sortedSavers[index];
    return (
      <div style={style}>
        <MobileCard saver={saver} />
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Hidden measurement div */}
        <div ref={measureRef}>
          <MobileCard saver={sortedSavers[0]} />
        </div>

        {/* Sort header */}
        <div className="mb-4 flex flex-1 justify-end">
          <MobileSortableHeader<SaverSortKey>
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
                itemCount={sortedSavers.length}
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
        <TopCards items={topSaversData} />
      </div>

      <div className="relative">
        <div className="flex text-left text-base text-gray-700 mb-2 px-4">
          <div className="px-3 py-3 w-1/2">Asset</div>
          <div className="flex flex-1 w-1/2 justify-between">
            <div className="w-1/4">
              <SortableHeader<SaverSortKey>
                label="Savers"
                sortKey={SaverSortKey.SAVERS}
                currentSortKey={sortConfig.key}
                onSort={sortData}
                sortDirection={sortConfig.direction}
              />
            </div>
            <div className="w-1/4">
              <SortableHeader<SaverSortKey>
                label="Utilization"
                sortKey={SaverSortKey.UTILIZATION}
                currentSortKey={sortConfig.key}
                onSort={sortData}
                sortDirection={sortConfig.direction}
              />
            </div>
            <div className="w-1/4">
              <SortableHeader<SaverSortKey>
                label="TVL"
                sortKey={SaverSortKey.TVL}
                currentSortKey={sortConfig.key}
                onSort={sortData}
                sortDirection={sortConfig.direction}
              />
            </div>
            <div className="w-1/4">
              <SortableHeader<SaverSortKey>
                label="APR"
                sortKey={SaverSortKey.APR}
                currentSortKey={sortConfig.key}
                onSort={sortData}
                sortDirection={sortConfig.direction}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {sortedSavers.map((saver) => (
            <TranslucentCard key={saver.asset} className="rounded-xl mx-4">
              <div className="flex items-center w-full">
                <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                  <div className="flex items-center">
                    <Image
                      src={getLogoPath(saver.asset)}
                      alt={`${getAssetSimpleSymbol(saver.asset)} logo`}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <span className="ml-3 font-medium">
                      {getAssetSimpleSymbol(saver.asset)}
                    </span>
                  </div>
                </div>
                <div className="flex items-start flex-1 w-2/3">
                  <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                    {saver.saversCount}
                  </div>
                  <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                    {formatNumber(saver.filled * 100, 2, 2)}%
                  </div>
                  <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                    {getFormattedSaverTVL(saver)}
                  </div>
                  <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">
                    {formatNumber(parseFloat(saver.saversReturn) * 100, 2, 2)}%
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

export default SaverVaults;

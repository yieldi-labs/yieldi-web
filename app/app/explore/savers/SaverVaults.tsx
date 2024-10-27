import { useState, useMemo } from "react";
import Image from "next/image";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "@/app/explore/TopCards";
import { calculateSaverTVL, formatNumber } from "@/app/utils";
import { getFormattedSaverTVL } from "@/app/utils";
import { DoubleArrow } from "@shared/components/svg";

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

const SaverVaults: React.FC<SaverVaultsProps> = ({ savers }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SortKey.TVL,
    direction: SortDirection.DESC,
  });

  const sortedSavers = useMemo(() => {
    const sortableItems = [...savers];
    sortableItems.sort((a, b) => {
      if (sortConfig.key === SortKey.TVL) {
        const aTvl = calculateSaverTVL(a);
        const bTvl = calculateSaverTVL(b);
        return sortConfig.direction === SortDirection.ASC
          ? aTvl - bTvl
          : bTvl - aTvl;
      } else if (sortConfig.key === SortKey.APR) {
        const aApr = parseFloat(a.saversReturn);
        const bApr = parseFloat(b.saversReturn);
        return sortConfig.direction === SortDirection.ASC
          ? aApr - bApr
          : bApr - aApr;
      }
      return 0;
    });
    return sortableItems;
  }, [savers, sortConfig]);

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

  const topSavers = sortedSavers.slice(0, 3);
  const topSaversData = topSavers.map((saver) => ({
    asset: saver.asset,
    formattedTVL: getFormattedSaverTVL(saver),
    apr: parseFloat(saver.saversReturn),
  }));

  return (
    <div className="w-full">
      {/* Top section with cards */}
      <div className="mb-8">
        <TopCards
          items={topSaversData}
          getAssetSymbol={getAssetSymbol}
          getLogoPath={getLogoPath}
          linkPath="savers"
        />
      </div>

      {/* All Savers section */}
      <div className="mb-4">
        <h2 className="text-base md:text-xl font-medium mb-4">All Savers</h2>
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
                  <div className="w-1/4 p-3">Savers</div>
                  <div className="w-1/4 p-3">Utilization</div>
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
                {sortedSavers.map((saver) => (
                  <TranslucentCard key={saver.asset} className="rounded-xl">
                    <div className="flex items-center w-full">
                      <div className="w-48 md:w-1/3 p-3">
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
                      </div>
                      <div className="flex flex-1 justify-between text-sm md:text-base">
                        <div className="w-1/4 p-3">{saver.saversCount}</div>
                        <div className="w-1/4 p-3">
                          {formatNumber(saver.filled * 100, 2, 2)}%
                        </div>
                        <div className="w-1/4 p-3">
                          {getFormattedSaverTVL(saver)}
                        </div>
                        <div className="w-1/4 p-3">
                          {formatNumber(
                            parseFloat(saver.saversReturn) * 100,
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaverVaults;

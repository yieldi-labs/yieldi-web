import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import SortHeader from "./SortHeader";
import { formatNumber } from "@/app/utils";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "../TopCards";

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

// Utility functions
const getAssetSymbol = (asset: string): string => {
  return asset.split("-")[0] || asset;
};

const getLogoPath = (asset: string): string => {
  const assetLower = asset.toLowerCase();
  return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
};

const calculateSaverTVL = (saver: Saver): number => {
  const depth = parseFloat(saver.saversDepth) / 1e8;
  const priceUSD = parseFloat(saver.assetPriceUSD);
  return depth * priceUSD;
};

const getFormattedSaverTVL = (saver: Saver): string => {
  const tvlUSD = calculateSaverTVL(saver);
  if (tvlUSD >= 1e9) {
    return `$${(tvlUSD / 1e9).toFixed(1)}B`;
  } else if (tvlUSD >= 1e6) {
    return `$${(tvlUSD / 1e6).toFixed(1)}M`;
  } else if (tvlUSD >= 1e3) {
    return `$${(tvlUSD / 1e3).toFixed(1)}K`;
  }
  return `$${tvlUSD.toFixed(2)}`;
};

const SaverVaults: React.FC<SaverVaultsProps> = ({ savers }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SortKey.TVL,
    direction: SortDirection.DESC,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const renderMobileCard = (saver: Saver) => (
    <TranslucentCard key={saver.asset} className="rounded-xl mb-1.5">
      <div className="flex items-center w-full flex-col p-1">
        <div className="w-full flex items-center mb-2">
          <Image
            src={getLogoPath(saver.asset)}
            alt={`${getAssetSymbol(saver.asset)} logo`}
            width={26}
            height={26}
            className="rounded-full"
          />
          <span className="ml-3 font-medium text-sm md:text-base">
            {getAssetSymbol(saver.asset)}
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

  return (
    <div className="w-full">
      {/* Top cards, hidden on mobile*/}
      <div className="mb-8 md:block hidden">
        <TopCards
          items={topSaversData}
          getAssetSymbol={getAssetSymbol}
          getLogoPath={getLogoPath}
        />
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
                      <div className="px-3 py-3 w-1/4 ml-6">Savers</div>
                      <div className="px-3 py-3 w-1/4">Utilization</div>
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
                    {sortedSavers.map((saver) => (
                      <TranslucentCard key={saver.asset} className="rounded-xl">
                        <div className="flex items-center w-full">
                          <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                            <div className="flex items-center">
                              <Image
                                src={getLogoPath(saver.asset)}
                                alt={`${getAssetSymbol(saver.asset)} logo`}
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                              <span className="ml-3 font-medium">
                                {getAssetSymbol(saver.asset)}
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
                </>
              ) : (
                // Mobile layout with sections
                <div className="space-y-2 mt-4">
                  {/* Top Section */}
                  <div>
                    <div className="flex flex-row justify-between items-center">
                      <h2 className="text-base font-medium mb-2 text-neutral-900">
                        Top Vaults
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
                      {sortedSavers.slice(0, 3).map(renderMobileCard)}
                    </div>
                  </div>

                  {/* All Savers Section */}
                  <div>
                    <h2 className="text-base font-medium mb-1 text-neutral-900">
                      All Vaults
                    </h2>
                    <div className="space-y-1.5">
                      {sortedSavers.slice(3).map(renderMobileCard)}
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

export default SaverVaults;

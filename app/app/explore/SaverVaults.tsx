import { useState, useMemo } from "react";
import Image from "next/image";
import TranslucentCard from "../TranslucentCard";
import TopCards from "./TopCards";
import { calculateSaverTVL, formatNumber } from "@/app/utils";
import { getFormattedSaverTVL } from "@/app/utils";

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
    <>
      <TopCards
        items={topSaversData}
        getAssetSymbol={getAssetSymbol}
        getLogoPath={getLogoPath}
      />

      {/* All Savers table */}
      <h2 className="text-xl font-medium mb-4">All Savers</h2>
      <div className="overflow-hidden">
        <div className="min-w-full">
          <div className="flex text-left text-base text-gray-700">
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
          <div className="min-w-full">
            {sortedSavers.map((saver) => (
              <TranslucentCard key={saver.asset} className="rounded-xl mb-1.5">
                <div className="flex items-center min-w-full">
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
                      {formatNumber(parseFloat(saver.saversReturn) * 100, 2, 2)}
                      %
                    </div>
                  </div>
                </div>
              </TranslucentCard>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SaverVaults;

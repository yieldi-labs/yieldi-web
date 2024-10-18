import { useState, useMemo } from "react";
import Image from "next/image";
import TranslucentCard from "../translucentCard";
import TopCards from "./TopCards";
import { formatNumber } from "@/app/utils";

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

const SaverVaults: React.FC<SaverVaultsProps> = ({ savers }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "tvl",
    direction: "desc",
  });

  const calculateTVL = (saver: Saver) => {
    return (
      (parseFloat(saver.saversDepth) * parseFloat(saver.assetPriceUSD)) / 1e14
    );
  };

  const sortedSavers = useMemo(() => {
    const sortableItems = [...savers];
    sortableItems.sort((a, b) => {
      if (sortConfig.key === "tvl") {
        const aTvl = calculateTVL(a);
        const bTvl = calculateTVL(b);
        return sortConfig.direction === "asc" ? aTvl - bTvl : bTvl - aTvl;
      } else if (sortConfig.key === "apr") {
        const aApr = parseFloat(a.saversReturn);
        const bApr = parseFloat(b.saversReturn);
        return sortConfig.direction === "asc" ? aApr - bApr : bApr - aApr;
      }
      return 0;
    });
    return sortableItems;
  }, [savers, sortConfig]);

  const getAssetSymbol = (asset: string) => {
    return asset.split(".")[1].split("-")[0] || asset;
  };

  const getLogoPath = (asset: string) => {
    const assetLower = asset.toLowerCase();
    return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
  };

  const sortData = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const topSavers = sortedSavers.slice(0, 3);
  const topSaversData = topSavers.map((saver) => ({
    asset: saver.asset,
    tvl: calculateTVL(saver),
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
                onClick={() => sortData("tvl")}
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
                onClick={() => sortData("apr")}
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
                      ${formatNumber(calculateTVL(saver), 2, 2)}M
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

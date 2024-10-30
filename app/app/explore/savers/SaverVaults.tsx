import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  addDollarSignAndSuffix,
  formatNumber,
  getAssetSymbol,
  getLogoPath,
} from "@/app/utils";
import TranslucentCard from "@/app/TranslucentCard";
import TopCards from "../../components/TopCards";
import SortHeader from "../../../../shared/components/ui/SortHeader";
import { useMobileDetection } from "@shared/hooks";

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

const calculateSaverTVL = (saver: Saver): number => {
  const depth = parseFloat(saver.saversDepth) / 1e8;
  const priceUSD = parseFloat(saver.assetPriceUSD);
  return depth * priceUSD;
};

const getFormattedSaverTVL = (saver: Saver): string => {
  const tvlUSD = calculateSaverTVL(saver);
  return addDollarSignAndSuffix(tvlUSD);
};

const MOBILE_MARGIN_BOTTOM = 6; // 6px bottom margin

const SaverVaults: React.FC<SaverVaultsProps> = ({ savers }) => {
  const isMobile = useMobileDetection();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: SortKey.TVL,
    direction: SortDirection.DESC,
  });
  const [mobileRowHeight, setMobileRowHeight] = useState(150);
  const measureRef = useRef<HTMLDivElement>(null);

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

  // Measure mobile row height on first render
  useEffect(() => {
    if (isMobile && measureRef.current) {
      const height = measureRef.current.offsetHeight;
      setMobileRowHeight(height + MOBILE_MARGIN_BOTTOM);
      measureRef.current.style.display = 'none';
    }
  }, [isMobile]);

  const sortData = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
    }));
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

  const MobileRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
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
          <SortHeader
            sortConfig={sortConfig}
            onSort={sortData}
            columns={[
              { key: SortKey.TVL, label: "TVL" },
              { key: SortKey.APR, label: "APR" },
            ]}
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
              >
                {MobileRow}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }

  // Desktop view without virtualization
  return (
    <div className="w-full">
      <div className="mb-8">
        <TopCards items={topSaversData} />
      </div>

      <div className="relative">
        <div className="flex text-left text-base text-gray-700 mb-2 px-4">
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
            <TranslucentCard key={saver.asset} className="rounded-xl mx-4">
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
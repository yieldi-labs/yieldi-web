"use client";

import { TopCard } from "./TopCard";

interface TopCardItem {
  asset: string;
  formattedTVL: string;
  apr: number;
}

interface TopCardsProps {
  items: TopCardItem[];
  getAssetSymbol: (asset: string) => string;
  getLogoPath: (asset: string) => string;
  linkPath: string;
  children?: React.ReactNode;
}

const TopCards: React.FC<TopCardsProps> = ({
  items,
  getAssetSymbol,
  getLogoPath,
  linkPath,
  children,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 md:gap-6 mb-12 gap-2">
      {items.map((item, index) => (
        <div
          key={item.asset}
          className={`${index === 0 ? "col-span-2 md:col-span-1" : ""}`}
        >
          <TopCard
            asset={item.asset}
            formattedTVL={item.formattedTVL}
            apr={item.apr}
            getAssetSymbol={getAssetSymbol}
            getLogoPath={getLogoPath}
            index={index}
          >
            {children}
          </TopCard>
        </div>
      ))}
    </div>
  );
};

export default TopCards;

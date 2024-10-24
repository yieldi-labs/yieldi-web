"use client";

import Link from "next/link";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {items.map((item) => (
        <Link key={item.asset} href={`/explore/${linkPath}/${item.asset}`}>
          <TopCard
            key={item.asset}
            asset={item.asset}
            formattedTVL={item.formattedTVL}
            apr={item.apr}
            getAssetSymbol={getAssetSymbol}
            getLogoPath={getLogoPath}
          >
            {children}
          </TopCard>
        </Link>
      ))}
    </div>
  );
};

export default TopCards;

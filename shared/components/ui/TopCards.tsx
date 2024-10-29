"use client";

import { TopCard } from "../../../app/app/components/TopCard";

interface TopCardItem {
  asset: string;
  formattedTVL: string;
  apr: number;
}

interface TopCardsProps {
  items: TopCardItem[];
  linkPath?: string;
  children?: React.ReactNode;
}

const TopCards: React.FC<TopCardsProps> = ({
  items,
  children,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 md:gap-6 gap-2 md:mb-12 mb-6">
      {items.map((item, index) => (
        <div
          key={item.asset}
          className={`${index === 0 ? "col-span-2 md:col-span-1" : ""}`}
        >
          <TopCard
            asset={item.asset}
            formattedTVL={item.formattedTVL}
            apr={item.apr}
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

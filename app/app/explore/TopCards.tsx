import Image from "next/image";
import TranslucentCard from "../translucentCard";
import { formatNumber } from "@/app/utils";

interface TopCardItem {
  asset: string;
  tvl: number;
  apr: number;
}

interface TopCardsProps {
  items: TopCardItem[];
  getAssetSymbol: (asset: string) => string;
  getLogoPath: (asset: string) => string;
}

const TopCards: React.FC<TopCardsProps> = ({
  items,
  getAssetSymbol,
  getLogoPath,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {items.map((item) => (
        <TranslucentCard
          key={item.asset}
          className="p-5 rounded-2xl flex flex-col items-start"
        >
          <div className="flex items-center mb-7">
            <Image
              src={getLogoPath(item.asset)}
              alt={`${getAssetSymbol(item.asset)} logo`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="ml-2 text-2xl font-medium font-gt-america-ext">
              {getAssetSymbol(item.asset)}
            </span>
          </div>
          <div className="grid-cols-2 gap-4 w-full flex">
            <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
              <p className="text-3xl font-medium">
                ${formatNumber(item.tvl, 2, 2)}M
              </p>
              <p className="text-gray-700 text-base mt-2 font-medium">TVL</p>
            </div>
            <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
              <p className="text-3xl font-medium">
                {formatNumber(item.apr * 100, 2, 2)}%
              </p>
              <p className="text-gray-700 text-base font-medium">APR</p>
            </div>
          </div>
        </TranslucentCard>
      ))}
    </div>
  );
};

export default TopCards;

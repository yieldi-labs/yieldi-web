import Image from "next/image";
import TranslucentCard from "../TranslucentCard";
import { formatNumber } from "@/app/utils";
import { twMerge } from "tailwind-merge";

// Individual TopCard component
interface TopCardProps {
  asset: string;
  formattedTVL: string;
  apr: number;
  getAssetSymbol: (asset: string) => string;
  getLogoPath: (asset: string) => string;
  children?: React.ReactNode;
  index?: number;
}

export const TopCard: React.FC<TopCardProps> = ({
  asset,
  formattedTVL,
  apr,
  getAssetSymbol,
  getLogoPath,
  children,
  index,
}) => {
  const innerCardClass =
    "bg-white rounded-xl md:p-3 p-1 flex justify-center flex-col items-center flex-1 w-1/2";
  const valueClass = twMerge(
    "md:text-3xl font-medium",
    index! > 0 ? "text-base" : "text-xl",
  );
  const labelClass =
    "text-gray-700 md:text-base text-xs md:mt-2 mt-1 font-medium";
  const isMobile = window.innerWidth < 768;

  return (
    <TranslucentCard className="md:p-5 p-1 rounded-2xl flex flex-col items-start">
      <div className="flex items-center md:mb-7 p-1 md:p-0 mb-2">
        <Image
          src={getLogoPath(asset)}
          alt={`${getAssetSymbol(asset)} logo`}
          width={isMobile ? 32 : 42}
          height={isMobile ? 32 : 42}
          className="rounded-full"
        />
        <span className="ml-2 md:text-2xl text-lg font-medium font-gt-america-ext">
          {getAssetSymbol(asset)}
        </span>
      </div>
      <div className="grid-cols-2 md:gap-4 gap-1 w-full flex">
        <div className={innerCardClass}>
          <p className={valueClass}>{formattedTVL}</p>
          <p className={labelClass}>TVL</p>
        </div>
        <div className={innerCardClass}>
          <p className={valueClass}>{formatNumber(apr * 100, 2, 2)}%</p>
          <p className={labelClass}>APR</p>
        </div>
      </div>
      {children}
    </TranslucentCard>
  );
};

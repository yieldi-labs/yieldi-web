import Image from "next/image";
import TranslucentCard from "../TranslucentCard";
import { formatNumber } from "@/app/utils";

// Individual TopCard component
interface TopCardProps {
  asset: string;
  formattedTVL: string;
  apr: number;
  getAssetSymbol: (asset: string) => string;
  getLogoPath: (asset: string) => string;
  children?: React.ReactNode;
}

export const TopCard: React.FC<TopCardProps> = ({
  asset,
  formattedTVL,
  apr,
  getAssetSymbol,
  getLogoPath,
  children,
}) => {
  return (
    <TranslucentCard className="p-5 rounded-2xl flex flex-col items-start">
      <div className="flex items-center mb-7">
        <Image
          src={getLogoPath(asset)}
          alt={`${getAssetSymbol(asset)} logo`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="ml-2 text-2xl font-medium font-gt-america-ext">
          {getAssetSymbol(asset)}
        </span>
      </div>
      <div className="grid-cols-2 gap-4 w-full flex">
        <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
          <p className="text-3xl font-medium">{formattedTVL}</p>
          <p className="text-gray-700 text-base mt-2 font-medium">TVL</p>
        </div>
        <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
          <p className="text-3xl font-medium">
            {formatNumber(apr * 100, 2, 2)}%
          </p>
          <p className="text-gray-700 text-base font-medium">APR</p>
        </div>
      </div>
      {children}
    </TranslucentCard>
  );
};

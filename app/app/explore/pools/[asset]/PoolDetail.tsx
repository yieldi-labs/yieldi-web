"use client";
import Link from "next/link";
import TranslucentCard from "@/app/TranslucentCard";
import { calculateVolumeDepthRatio, formatNumber, getFormattedPoolTVL } from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { BackArrow } from "@shared/components/svg";
import { TopCard } from "../../TopCard";

interface PoolDetailProps {
  pool: IPoolDetail;
  runePriceUSD: number;
}

export default function PoolDetail({ pool, runePriceUSD }: PoolDetailProps) {
  const getAssetSymbol = (asset: string) => {
    return asset.split(".")[1] || asset;
  };

  const getLogoPath = (asset: string) => {
    const assetLower = asset.toLowerCase();
    return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
  };

  // Calculate pool metrics
  const formattedTVL = getFormattedPoolTVL(pool, runePriceUSD);
  const volumeDepthRatio = calculateVolumeDepthRatio(pool, runePriceUSD); 

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/explore/pools" className="inline-flex items-center mb-8 text-foreground text-2xl font-bold font-gt-america-ext">
        <BackArrow className="mr-2" />
        ALL POOLS
      </Link>

      <div className="grid grid-cols-12 gap-20">
        {/* Left Column */}
        <div className="col-span-6">
          <h2 className="text-2xl font-medium mb-6 text-foreground font-gt-america-ext">OVERVIEW</h2>
          
          <TopCard
            asset={pool.asset}
            formattedTVL={formattedTVL}
            apr={parseFloat(pool.poolAPY)}
            getAssetSymbol={getAssetSymbol}
            getLogoPath={getLogoPath}
          >
            <div className="space-y-4 w-full mt-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Volume/Depth</span>
                <span className="font-medium">{formatNumber(volumeDepthRatio, 2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Fees</span>
                <span className="font-medium">3.6%</span>
              </div>
            </div>
            <button className="w-full bg-[#A1FD59] text-black font-semibold py-3 rounded-full mt-8">
              Add
            </button>
          </TopCard>
        </div>

        {/* Right Column */}
        <div className="col-span-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-foreground font-gt-america-ext">YOUR POSITION</h2>
            <button className="text-red-500 font-medium">REMOVE</button>
          </div>
          
          <TranslucentCard className="p-6 rounded-2xl flex flex-col">
            <div className="mb-8 bg-white rounded-xl w-full p-3">
              <div className="text-gray-700 font-medium text-lg mb-2">PRINCIPAL</div>
              <div className="flex justify-between">
                <div className="text-2xl font-medium text-gray-900">$0,00</div>
                <div className="text-2xl font-medium text-gray-900">0 BTC</div>
              </div>
            </div>

            <div className="mb-8 bg-white rounded-xl w-full p-3">
              <div className="text-gray-700 font-medium text-lg mb-2">YIELD</div>
              <div className="flex justify-between">
                <div className="text-2xl font-medium text-gray-900">$0,00</div>
                <div className="text-2xl font-medium text-gray-900">0 RUNE</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 w-full">
              <button className="w-full bg-secondaryBtn text-white font-bold py-3 rounded-full text-sm">
                Stream
              </button>
              <button className="w-full bg-secondaryBtn text-white font-bold py-3 rounded-full text-sm">
                Re-Invest
              </button>
            </div>

            <button className="w-full border-2 border-secondaryBtn text-secondaryBtn font-bold text-sm py-3 rounded-full">
              Claim
            </button>
          </TranslucentCard>
        </div>
      </div>
    </div>
  );
}
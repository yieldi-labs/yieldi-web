import TranslucentCard from "@/app/TranslucentCard";
import {
  addDollarSignAndSuffix,
  calculateVolumeDepthRatio,
  calculateVolumeUSD,
  formatNumber,
  getAssetSymbol,
  getFormattedPoolTVL,
  getLogoPath,
} from "@/app/utils";
import { PoolDetail } from "@/midgard";
import Image from "next/image";
import Link from "next/link";

export default function LiquidityPoolCardMobile({
  pool,
  runePriceUSD,
}: {
  pool: PoolDetail;
  runePriceUSD: number;
}) {
  return (
    <Link key={pool.asset} href={`/explore/pools/${pool.asset}`}>
      <TranslucentCard className="rounded-xl mb-1.5">
        <div className="flex items-center w-full flex-col p-1">
          <div className="w-full flex items-center mb-2">
            <Image
              src={getLogoPath(pool.asset)}
              alt={`${getAssetSymbol(pool.asset)} logo`}
              width={26}
              height={26}
              className="rounded-full"
            />
            <span className="ml-3 font-medium text-sm md:text-base">
              {getAssetSymbol(pool.asset)}
            </span>
          </div>
          <div className="flex flex-row w-full gap-1">
            <div className="flex-1 p-2 rounded-xl bg-white">
              <p className="text-sm text-neutral mb-1">
                {addDollarSignAndSuffix(calculateVolumeUSD(pool, runePriceUSD))}
              </p>
              <p className="text-xs text-neutral-800">Volume (24h)</p>
            </div>
            <div className="flex-1 p-2 rounded-xl bg-white">
              <p className="text-sm text-neutral mb-1">
                {formatNumber(
                  calculateVolumeDepthRatio(pool, runePriceUSD) * 100,
                  2,
                  2,
                )}
                %
              </p>
              <p className="text-xs text-neutral-800">Volume/Depth</p>
            </div>
            <div className="flex-1 p-2 rounded-xl bg-white">
              <p className="text-sm text-neutral mb-1">
                {getFormattedPoolTVL(pool, runePriceUSD)}
              </p>
              <p className="text-xs text-neutral-800">TVL</p>
            </div>
            <div className="flex-1 p-2 rounded-xl bg-white">
              <p className="text-sm text-neutral mb-1">
                {formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%
              </p>
              <p className="text-xs text-neutral-800">APR</p>
            </div>
          </div>
        </div>
      </TranslucentCard>
    </Link>
  );
}

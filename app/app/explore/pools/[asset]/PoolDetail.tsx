"use client";
import Link from "next/link";
import TranslucentCard from "@/app/TranslucentCard";
import {
  calculateVolumeDepthRatio,
  formatNumber,
  getFormattedPoolTVL,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { BackArrow } from "@shared/components/svg";
import AddLiquidityModal from "@/app/explore/components/AddLiquidityModal";
import { useState, useEffect } from "react";
import { TopCard } from "@/app/components/TopCard";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import { useAppState } from "@/utils/context";

interface PoolDetailProps {
  pool: IPoolDetail;
  runePriceUSD: number;
}

export default function PoolDetail({ pool, runePriceUSD }: PoolDetailProps) {
  const { wallet } = useAppState();
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);
  const { position, loading, error, getMemberDetails, removeLiquidity } =
    useLiquidityPosition({ pool });

  // Calculate pool metrics
  const formattedTVL = getFormattedPoolTVL(pool, runePriceUSD);
  const volumeDepthRatio = calculateVolumeDepthRatio(pool, runePriceUSD);

  // Fetch position when wallet connects
  useEffect(() => {
    if (wallet?.address) {
      getMemberDetails(wallet.address, pool.asset);
    }
  }, [wallet?.address, pool.asset, getMemberDetails]);

  const handleRemove = async () => {
    if (!wallet?.address) {
      // Show connect wallet modal or error
      return;
    }

    try {
      await removeLiquidity({
        asset: pool.asset,
        percentage: 100, // Remove all - could make this configurable
        address: wallet.address,
      });
    } catch (err) {
      console.error("Failed to remove liquidity:", err);
      // Handle error - could show toast/notification
    }
  };

  // Calculate position metrics
  const assetValue = position ? parseFloat(position.assetDeposit) / 1e8 : 0;
  const usdValue = assetValue * parseFloat(pool.assetPriceUSD);

  // Calculate yield metrics
  const assetDeposited = position ? parseFloat(position.assetAdded) / 1e8 : 0;
  const assetWithdrawn = position
    ? parseFloat(position.assetWithdrawn) / 1e8
    : 0;
  const assetYield = assetValue - assetDeposited + assetWithdrawn;
  const yieldUsdValue = assetYield * parseFloat(pool.assetPriceUSD);

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/explore/pools"
        className="inline-flex items-center mb-8 text-foreground text-2xl font-bold font-gt-america-ext"
      >
        <BackArrow className="mr-2" />
        ALL POOLS
      </Link>

      <div className="grid grid-cols-12 gap-20">
        {/* Left Column */}
        <div className="col-span-6">
          <h2 className="text-2xl font-medium mb-6 text-foreground font-gt-america-ext">
            OVERVIEW
          </h2>

          <TopCard
            asset={pool.asset}
            formattedTVL={formattedTVL}
            apr={parseFloat(pool.poolAPY)}
          >
            <div className="space-y-4 w-full mt-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Volume/Depth</span>
                <span className="font-medium">
                  {formatNumber(volumeDepthRatio, 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Fees</span>
                <span className="font-medium">3.6%</span>
              </div>
            </div>
            <button
              className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8"
              onClick={() => setShowAddLiquidityModal(true)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Add"}
            </button>
          </TopCard>
        </div>

        {/* Right Column */}
        <div className="col-span-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-foreground font-gt-america-ext">
              YOUR POSITION
            </h2>
            {position && (
              <button
                className="text-red-500 font-medium"
                onClick={handleRemove}
                disabled={loading}
              >
                {loading ? "Removing..." : "REMOVE"}
              </button>
            )}
          </div>

          <TranslucentCard className="p-6 rounded-2xl flex flex-col shadow-md">
            <div className="mb-8 bg-white rounded-xl w-full p-3">
              <div className="text-gray-700 font-medium text-lg mb-2">
                PRINCIPAL
              </div>
              <div className="flex justify-between">
                <div className="text-2xl font-medium text-gray-900">
                  ${formatNumber(usdValue, 2)}
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {formatNumber(assetValue)}{" "}
                  {pool.asset.split(".")[1].split("-")[0]}
                </div>
              </div>
            </div>

            <div className="mb-8 bg-white rounded-xl w-full p-3">
              <div className="text-gray-700 font-medium text-lg mb-2">
                YIELD
              </div>
              <div className="flex justify-between">
                <div className="text-2xl font-medium text-gray-900">
                  ${formatNumber(yieldUsdValue, 2)}
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {formatNumber(assetYield)}{" "}
                  {pool.asset.split(".")[1].split("-")[0]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 w-full">
              <button
                className="w-full bg-secondaryBtn text-white font-bold py-3 rounded-full text-sm"
                disabled={!position || loading}
              >
                Stream
              </button>
              <button
                className="w-full bg-secondaryBtn text-white font-bold py-3 rounded-full text-sm"
                disabled={!position || loading}
              >
                Re-Invest
              </button>
            </div>

            <button
              className="w-full border-2 border-secondaryBtn text-secondaryBtn font-bold text-sm py-3 rounded-full"
              disabled={!position || loading}
            >
              Claim
            </button>
          </TranslucentCard>
        </div>
      </div>

      {showAddLiquidityModal && (
        <AddLiquidityModal
          pool={pool}
          runePriceUSD={runePriceUSD}
          onClose={() => setShowAddLiquidityModal(false)}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import TranslucentCard from "@/app/TranslucentCard";
import {
  calculateVolumeDepthRatio,
  formatNumber,
  getFormattedPoolTVL,
  getAssetSimpleSymbol,
  calculateGain,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { BackArrow } from "@shared/components/svg";
import AddLiquidityModal from "@/app/explore/components/AddLiquidityModal";
import { TopCard } from "@/app/components/TopCard";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import { useAppState } from "@/utils/context";

interface MemberStats {
  deposit: {
    asset: number;
    usd: number;
  };
  gain: {
    asset: number;
    usd: number;
  };
}

interface PoolDetailProps {
  pool: IPoolDetail;
  runePriceUSD: number;
}

export default function PoolDetail({ pool, runePriceUSD }: PoolDetailProps) {
  const { wallet } = useAppState();
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);
  const [isTransactionPolling, setIsTransactionPolling] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const {
    position,
    loading: positionLoading,
    error,
    getMemberDetails,
    removeLiquidity,
  } = useLiquidityPosition({ pool });
  const [memberStats, setMemberStats] = useState<MemberStats>({
    deposit: { asset: 0, usd: 0 },
    gain: { asset: 0, usd: 0 },
  });

  // Constants for polling
  const REGULAR_POLL_INTERVAL = 5000;
  const TX_POLL_INTERVAL = 1000;
  const MAX_TX_POLL_ATTEMPTS = 20;

  const hasPositionChanged = useCallback(
    (currentPosition: any, newPosition: any) => {
      if (!currentPosition || !newPosition) return true;

      return (
        currentPosition.assetDepth !== newPosition.position.assetDepth ||
        currentPosition.runeDepth !== newPosition.position.runeDepth ||
        currentPosition.liquidityUnits !== newPosition.position.liquidityUnits
      );
    },
    [],
  );

  useEffect(() => {
    if (!wallet?.address) return;

    const updateMemberDetails = async () => {
      try {
        if (isTransactionPolling) return;

        await getMemberDetails(wallet.address, pool.asset);
        const stats = await calculateGain(
          pool.asset,
          wallet.address,
          runePriceUSD,
        );
        if (stats) {
          setMemberStats(stats);
        }

        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Error updating member details:", error);
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      }
    };

    updateMemberDetails();
    const regularPollInterval = setInterval(
      updateMemberDetails,
      REGULAR_POLL_INTERVAL,
    );

    return () => clearInterval(regularPollInterval);
  }, [
    wallet?.address,
    pool.asset,
    runePriceUSD,
    isTransactionPolling,
    initialLoadComplete,
  ]);

  const pollForPositionUpdate = useCallback(
    async (currentPosition: any) => {
      if (!currentPosition) return;

      setIsTransactionPolling(true);
      let attempts = 0;

      const pollInterval = setInterval(async () => {
        if (!wallet?.address) {
          clearInterval(pollInterval);
          setIsTransactionPolling(false);
          return;
        }

        attempts++;
        const updatedPosition = await getMemberDetails(
          wallet.address,
          pool.asset,
        );

        if (
          hasPositionChanged(currentPosition, updatedPosition) ||
          attempts >= MAX_TX_POLL_ATTEMPTS
        ) {
          clearInterval(pollInterval);
          setIsTransactionPolling(false);
        }
      }, TX_POLL_INTERVAL);

      return () => {
        clearInterval(pollInterval);
        setIsTransactionPolling(false);
      };
    },
    [wallet?.address, getMemberDetails, pool.asset, hasPositionChanged],
  );

  const formattedTVL = getFormattedPoolTVL(pool, runePriceUSD);
  const volumeDepthRatio = calculateVolumeDepthRatio(pool, runePriceUSD);
  const assetSymbol = getAssetSimpleSymbol(pool.asset);

  const showLoadingState = !initialLoadComplete && positionLoading;

  const handleRemove = async () => {
    if (!wallet?.address) return;

    try {
      await removeLiquidity({
        asset: pool.asset,
        percentage: 100,
        address: wallet.address,
        withdrawAsset: pool.asset,
      });
      pollForPositionUpdate(position);
    } catch (err) {
      console.error("Failed to remove liquidity:", err);
    }
  };

  const handleAddLiquidityClose = (transactionSubmitted: boolean) => {
    setShowAddLiquidityModal(false);
    if (transactionSubmitted && position) {
      pollForPositionUpdate(position);
    }
  };

  const renderPositionContent = () => (
    <>
      <div className="mb-8 bg-white rounded-xl w-full p-3">
        <div className="text-gray-700 font-medium text-lg mb-2">DEPOSIT</div>
        <div className="flex justify-between">
          <div className="text-2xl font-medium text-gray-900">
            ${formatNumber(memberStats.deposit.usd, 2)}
          </div>
          <div className="text-2xl font-medium text-gray-900">
            {formatNumber(memberStats.deposit.asset)} {assetSymbol}
          </div>
        </div>
      </div>

      <div className="mb-8 bg-white rounded-xl w-full p-3">
        <div className="text-gray-700 font-medium text-lg mb-2">GAIN</div>
        <div className="flex justify-between">
          <div className="text-2xl font-medium text-gray-900">
            {memberStats.gain.usd >= 0 ? "$" : "-$"}
            {formatNumber(Math.abs(memberStats.gain.usd), 2)}
          </div>
          <div className="text-2xl font-medium text-gray-900">
            {formatNumber(memberStats.gain.asset)} {assetSymbol}
          </div>
        </div>
      </div>

      {position && (
        <button
          className="w-full border-red-500 border-2 text-red-500 font-bold py-3 rounded-full
                     hover:text-opacity-50 hover:border-opacity-50 transition-all 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRemove}
          disabled={showLoadingState}
        >
          {showLoadingState ? "Loading..." : "Remove Position"}
        </button>
      )}
    </>
  );

  return (
    <div className="md:mx-16">
      <Link
        href="/explore/pools"
        className="inline-flex items-center mb-8 text-foreground text-2xl font-bold font-gt-america-ext hover:opacity-50 transition-opacity"
      >
        <BackArrow className="mr-2" />
        ALL POOLS
      </Link>

      <div className="grid grid-cols-12 gap-20">
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
              className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8 
                       hover:opacity-50 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowAddLiquidityModal(true)}
              disabled={showLoadingState}
            >
              {showLoadingState ? "Loading..." : "Add"}
            </button>
          </TopCard>
        </div>

        <div className="col-span-6">
          <h2 className="text-2xl font-medium mb-6 text-foreground font-gt-america-ext">
            YOUR POSITION
          </h2>

          <TranslucentCard className="p-6 rounded-2xl flex flex-col shadow-md relative">
            {showLoadingState && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {renderPositionContent()}
          </TranslucentCard>
        </div>
      </div>

      {showAddLiquidityModal && (
        <AddLiquidityModal
          pool={pool}
          runePriceUSD={runePriceUSD}
          onClose={handleAddLiquidityClose}
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

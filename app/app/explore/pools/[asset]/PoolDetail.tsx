"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import TranslucentCard from "@/app/TranslucentCard";
import {
  calculateVolumeDepthRatio,
  formatNumber,
  getFormattedPoolTVL,
  getAssetSimpleSymbol,
  getFormattedPoolEarnings,
  DECIMALS,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { BackArrow } from "@shared/components/svg";
import AddLiquidityModal from "@/app/explore/components/AddLiquidityModal";
import RemoveLiquidityModal from "@/app/explore/components/RemoveLiquidityModal";
import { TopCard } from "@/app/components/TopCard";
import { useAppState } from "@/utils/context";
import { isSupportedChain, parseAssetString } from "@/utils/chain";
import {
  usePositionStats,
  PositionStats,
  emptyPositionStats,
} from "@/hooks/usePositionStats";

interface PoolDetailProps {
  pool: IPoolDetail;
  runePriceUSD: number;
}

export default function PoolDetail({ pool, runePriceUSD }: PoolDetailProps) {
  const { wallet, toggleWalletModal } = useAppState();
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);
  const [showRemoveLiquidityModal, setShowRemoveLiquidityModal] =
    useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<PositionStats | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const addresses = wallet ? [wallet.address] : [];
  const { positions, isPending, error } = usePositionStats({
    addresses,
    specificPool: pool,
    refetchInterval: 5000,
  });

  // Get chain from pool asset
  const [assetChain] = parseAssetString(pool.asset);
  const isChainSupported = isSupportedChain(assetChain);

  useEffect(() => {
    if (!initialLoadComplete && !isPending) {
      setInitialLoadComplete(true);
    }
  }, [isPending, initialLoadComplete]);

  const formattedTVL = getFormattedPoolTVL(pool, runePriceUSD);
  const formattedEarnings = getFormattedPoolEarnings(pool, runePriceUSD);
  const volumeDepthRatio = calculateVolumeDepthRatio(pool, runePriceUSD) * 100;
  const assetSymbol = getAssetSimpleSymbol(pool.asset);

  const showLoadingState = !initialLoadComplete && isPending;

  const handleRemove = (position: PositionStats) => {
    setSelectedPosition(position);
    setShowRemoveLiquidityModal(true);
  };

  const handleRemoveLiquidityClose = () => {
    setShowRemoveLiquidityModal(false);
    setSelectedPosition(null);
  };

  const handleAddLiquidityClose = () => {
    setShowAddLiquidityModal(false);
  };

  const renderActionButton = () => {
    if (!wallet?.address) {
      return (
        <button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8 hover:opacity-50 transition-opacity"
          onClick={toggleWalletModal}
        >
          Connect Wallet
        </button>
      );
    }

    if (!isChainSupported) {
      return (
        <button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8 opacity-50 cursor-not-allowed"
          disabled
        >
          Coming Soon...
        </button>
      );
    }

    return (
      <button
        className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8 
                 hover:opacity-50 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setShowAddLiquidityModal(true)}
        disabled={showLoadingState}
      >
        {showLoadingState ? "Loading..." : "Add"}
      </button>
    );
  };

  const consolidated = positions?.reduce((total, position) => {
    return {
      assetId: total.assetId,
      type: total.type,
      deposit: {
        usd: total.deposit.usd + position.deposit.usd,
        asset: total.deposit.asset + position.deposit.asset,
        assetAdded: total.deposit.assetAdded + position.deposit.assetAdded,
        runeAdded: total.deposit.runeAdded + position.deposit.runeAdded,
      },
      gain: {
        usd: total.gain.usd + position.gain.usd,
        asset: total.gain.asset + position.gain.asset,
        percentage: total.gain.percentage,
      },
      pool: total.pool,
      liquidityUnits: total.liquidityUnits,
      memberDetails: total.memberDetails,
    };
  }, emptyPositionStats());

  const renderPositionsDetails = () => {
    if (!positions) return null;

    return positions.map((position) => {
      const isSingleSided = position.deposit.runeAdded === 0;
      const assetAmount = formatNumber(
        position.deposit.assetAdded || 0,
        parseInt(pool.nativeDecimal),
        8,
      );
      const runeAmount = formatNumber(
        position.deposit.runeAdded || 0,
        DECIMALS,
      );

      return (
        <div key={position.liquidityUnits} className="mb-4">
          <div className="flex-col items-center text-base font-medium text-neutral-900 mb-1">
            <div>
              {assetAmount} {assetSymbol} + {runeAmount} RUNE
            </div>
          </div>
          <button
            className="w-full border-red border-2 text-red font-bold py-3 rounded-full
                       hover:text-opacity-50 hover:border-opacity-50 transition-all 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleRemove(position)}
            disabled={showLoadingState || !isSingleSided}
          >
            {showLoadingState
              ? "Loading..."
              : isSingleSided
                ? "Remove"
                : "Coming Soon..."}
          </button>
        </div>
      );
    });
  };

  const renderPositionsContent = () => (
    <>
      <div className="mb-2 md:mb-8 bg-white rounded-xl w-full p-3">
        <div className="text-gray-700 font-medium text-lg mb-2">DEPOSIT</div>
        <div className="flex justify-between">
          <div className="text-2xl font-medium text-gray-900">
            ${formatNumber(consolidated?.deposit.usd || 0, 2)}
          </div>
          <div className="text-2xl font-medium text-gray-900">
            {formatNumber(consolidated?.deposit.asset || 0)} {assetSymbol}
          </div>
        </div>
      </div>

      <div className="md:mb-8 bg-white rounded-xl w-full p-3">
        <div className="text-gray-700 font-medium text-lg mb-2">GAIN</div>
        <div className="flex justify-between">
          <div className="text-2xl font-medium text-gray-900">
            {consolidated?.gain.usd >= 0 ? "$" : "-$"}
            {formatNumber(Math.abs(consolidated?.gain.usd || 0), 2)}
          </div>
          <div className="text-2xl font-medium text-gray-900">
            {formatNumber(consolidated?.gain.asset || 0)} {assetSymbol}
          </div>
        </div>
      </div>

      <div className="mb-4 md:mb-8 bg-white rounded-xl w-full p-3">
        <div className="text-gray-700 font-medium text-lg mb-2">POSITIONS</div>
        {renderPositionsDetails()}
      </div>
    </>
  );

  return (
    <div className="md:mx-16">
      <Link
        href="/explore/pools"
        className="inline-flex items-center md:mb-8 text-foreground md:text-2xl font-bold font-gt-america-ext hover:opacity-50 transition-opacity"
      >
        <BackArrow className="mr-2" />
        ALL POOLS
      </Link>

      <div className="grid grid-cols-12 md:gap-20">
        <div className="col-span-12 md:col-span-6">
          <h2 className="my-2 md:mt-0 md:text-2xl font-medium md:mb-6 text-foreground font-gt-america-ext">
            OVERVIEW
          </h2>

          <TopCard
            asset={pool.asset}
            formattedTVL={formattedTVL}
            apr={parseFloat(pool.poolAPY)}
          >
            <div className="space-y-4 w-full mt-8 px-3 md:px-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Volume/Depth</span>
                <span className="font-medium">
                  {formatNumber(volumeDepthRatio, 2, 2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Fees</span>
                <span className="font-medium">{formattedEarnings}</span>
              </div>
            </div>
            {renderActionButton()}
          </TopCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <h2 className="my-2 md:mt-0 md:text-2xl font-medium md:mb-6 text-foreground font-gt-america-ext">
            YOUR POSITIONS
          </h2>

          <TranslucentCard className="p-2 md:p-6 rounded-2xl flex flex-col shadow-md relative">
            {showLoadingState && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {renderPositionsContent()}
          </TranslucentCard>
        </div>
      </div>

      {showRemoveLiquidityModal &&
        selectedPosition &&
        selectedPosition.memberDetails && (
          <RemoveLiquidityModal
            pool={pool}
            position={selectedPosition.memberDetails}
            onClose={handleRemoveLiquidityClose}
          />
        )}

      {showAddLiquidityModal && (
        <AddLiquidityModal
          pool={pool}
          runePriceUSD={runePriceUSD}
          onClose={handleAddLiquidityClose}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red text-white p-4 rounded-lg">
          {error.message}
        </div>
      )}
    </div>
  );
}

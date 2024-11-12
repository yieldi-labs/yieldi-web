"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import TranslucentCard from "@/app/TranslucentCard";
import {
  calculateVolumeDepthRatio,
  formatNumber,
  getFormattedPoolTVL,
  fetchJson,
  getAssetSimpleSymbol,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { BackArrow } from "@shared/components/svg";
import AddLiquidityModal from "@/app/explore/components/AddLiquidityModal";
import { TopCard } from "@/app/components/TopCard";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import { useAppState } from "@/utils/context";

interface PoolDetailProps {
  pool: IPoolDetail;
  runePriceUSD: number;
}

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

export default function PoolDetail({ pool, runePriceUSD }: PoolDetailProps) {
  const { wallet } = useAppState();
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);
  const { position, loading, error, getMemberDetails, removeLiquidity } =
    useLiquidityPosition({ pool });
  const [memberStats, setMemberStats] = useState({
    deposit: {
      asset: 0,
      usd: 0,
    },
    gain: {
      asset: 0,
      usd: 0,
    },
  } as MemberStats);

  useEffect(() => {
    const loadThornodePool = async () => {
      if (!pool?.asset || !wallet?.address) return;

      try {
        // Fetch pool and LP data
        const [poolData, liquidityProvider] = await Promise.all([
          fetchJson(
            `https://thornode.ninerealms.com/thorchain/pool/${pool.asset}`,
          ),
          fetchJson(
            `https://thornode.ninerealms.com/thorchain/pool/${pool.asset}/liquidity_provider/${wallet.address}`,
          ),
        ]);

        // Initial Deposit Calculation (R0 + A0)
        const assetRunePrice =
          parseFloat(poolData.balance_asset) /
          parseFloat(poolData.balance_rune);
        const assetPriceUSD = runePriceUSD / assetRunePrice;

        const initialRuneInAsset =
          parseFloat(liquidityProvider.rune_deposit_value) * assetRunePrice; // R0
        const initialAsset = parseFloat(liquidityProvider.asset_deposit_value); // A0
        const totalInitialDeposit = initialRuneInAsset + initialAsset; // total_deposit
        const totalInitialDepositFormatted = totalInitialDeposit / 1e8;

        // Current Position Calculation (R1 + A1)
        const memberShares =
          parseFloat(liquidityProvider.units) / parseFloat(poolData.LP_units);
        const currentRuneInAsset =
          memberShares * parseFloat(poolData.balance_rune) * assetRunePrice; // R1
        const currentAsset = memberShares * parseFloat(poolData.balance_asset); // A1
        const totalCurrentDeposit = currentRuneInAsset + currentAsset; // total_deposit_current

        // Gain Calculation
        const gainValue = (totalCurrentDeposit - totalInitialDeposit) / 1e8; // Gain

        // USD Conversions
        const depositUsdValue = (totalInitialDeposit / 1e8) * assetPriceUSD;
        const gainUsdValue = gainValue * assetPriceUSD;

        setMemberStats({
          deposit: {
            asset: totalInitialDepositFormatted,
            usd: depositUsdValue,
          },
          gain: {
            asset: gainValue,
            usd: gainUsdValue,
          },
        });
      } catch (err) {
        console.error("Failed to load thornode pool data:", err);
      }
    };

    loadThornodePool();
  }, [pool?.asset, wallet?.address, position, runePriceUSD]);
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
      return;
    }

    try {
      await removeLiquidity({
        asset: pool.asset,
        percentage: 100,
        address: wallet.address,
      });
    } catch (err) {
      console.error("Failed to remove liquidity:", err);
    }
  };
  const assetSymbol = getAssetSimpleSymbol(pool.asset);

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
                DEPOSIT
              </div>
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
                  ${formatNumber(memberStats.gain.usd, 2)}
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {formatNumber(memberStats.gain.asset)} {assetSymbol}
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

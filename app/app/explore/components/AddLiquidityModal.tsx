"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/app/button";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { Slider } from "@shared/components/ui";
import { twMerge } from "tailwind-merge";
import { getAssetShortSymbol, getLogoPath } from "@/app/utils";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: () => void;
}

export default function AddLiquidityModal({
  pool,
  runePriceUSD,
  onClose,
}: AddLiquidityModalProps) {
  const { wallet } = useAppState();
  const { loading, error, addLiquidity } = useLiquidityPosition({ pool });
  const [selectedTab] = useState("single");
  const [assetAmount, setAssetAmount] = useState(0.0001);
  const [runeAmount, setRuneAmount] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  const getPercentage = (amount: number, max: number) => {
    return (amount / max) * 100;
  };

  // Load rune balance with midgard client
  const runeBalance = useMemo(() => {
    return 0;
  }, [wallet]);

  const assetBalance = useMemo(() => {
    //Load from RPC
    return 10;
  }, [wallet, pool.asset]);

  const currentAssetPercentage = useMemo(() => {
    return getPercentage(assetAmount, Number(assetBalance));
  }, [assetAmount, assetBalance]);

  const currentRunePercentage = useMemo(() => {
    return getPercentage(runeAmount, Number(runeBalance));
  }, [runeAmount, runeBalance]);

  const isCloseToPercentage = (
    currentPercentage: number,
    targetPercentage: number,
  ) => {
    const tolerance = 0.01;
    return Math.abs(currentPercentage - targetPercentage) <= tolerance;
  };

  const handlePercentageClick = (
    percentage: number,
    isRune: boolean = false,
  ) => {
    if (isRune) {
      const newRuneAmount = runeBalance * (percentage / 100);
      setRuneAmount(newRuneAmount);
    } else {
      const newAssetAmount = assetBalance * (percentage / 100);
      setAssetAmount(newAssetAmount);
    }
  };

  const handleAddLiquidity = async () => {
    if (!wallet?.address) {
      alert("Please connect your wallet first");
      return;
    }

    if (assetAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const hash = await addLiquidity({
        asset: pool.asset,
        amount: assetAmount,
        runeAmount: selectedTab === "double" ? runeAmount : undefined,
        address: wallet.address,
      });

      setTxHash(hash);
      if (hash) {
        onClose();
      }
    } catch (err) {
      console.error("Failed to add liquidity:", err);
    }
  };

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );

  const modalStyle = {
    backgroundColor: "#F5F6F6",
    maxWidth: "36rem",
  };

  return (
    <Modal onClose={onClose} style={modalStyle}>
      <div className="p-6">
        {error && <ErrorCard className="mb-4">{error}</ErrorCard>}

        {/* Asset Input Section */}
        <div>
          <div className="flex items-center justify-between mb-4 text-neutral text-2xl font-medium">
            <div className="flex items-center">
              <Image
                src={getLogoPath(pool.asset)}
                alt={getAssetShortSymbol(pool.asset)}
                width={42}
                height={42}
                className="mr-3"
              />
              <span className="font-gt-america-ext">
                {getAssetShortSymbol(pool.asset)} Balance:{" "}
                {assetBalance.toFixed(6)}
              </span>
            </div>
            <div>
              {assetAmount.toPrecision(6)} ($
              {(parseFloat(pool.assetPriceUSD) * assetAmount).toFixed(2)})
            </div>
          </div>

          <div className="relative mb-6">
            <Slider
              value={assetAmount}
              max={Number(assetBalance)}
              onChange={setAssetAmount}
              step={0.000001}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              className={percentageButtonClasses(
                isCloseToPercentage(currentAssetPercentage, 25),
              )}
              onClick={() => handlePercentageClick(25)}
            >
              25%
            </button>
            <button
              className={percentageButtonClasses(
                isCloseToPercentage(currentAssetPercentage, 50),
              )}
              onClick={() => handlePercentageClick(50)}
            >
              50%
            </button>
            <button
              className={percentageButtonClasses(
                isCloseToPercentage(currentAssetPercentage, 100),
              )}
              onClick={() => handlePercentageClick(100)}
            >
              MAX
            </button>
          </div>
        </div>

        {/* RUNE Input Section */}
        {selectedTab === "double" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 text-neutral text-2xl font-medium">
              <div className="flex items-center">
                <Image
                  src={getLogoPath("thor.rune")}
                  alt="RUNE"
                  width={42}
                  height={42}
                  className="mr-3"
                />
                <span className="font-gt-america-ext">
                  RUNE Balance: {runeBalance.toFixed(6)}
                </span>
              </div>
              <div>
                {runeAmount.toFixed(6)} ($
                {(runeAmount * runePriceUSD).toFixed(2)})
              </div>
            </div>

            <div className="relative mb-4">
              <Slider
                value={runeAmount}
                max={Number(runeBalance)}
                onChange={setRuneAmount}
                step={0.000001}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className={percentageButtonClasses(
                  isCloseToPercentage(currentRunePercentage, 25),
                )}
                onClick={() => handlePercentageClick(25, true)}
              >
                25%
              </button>
              <button
                className={percentageButtonClasses(
                  isCloseToPercentage(currentRunePercentage, 50),
                )}
                onClick={() => handlePercentageClick(50, true)}
              >
                50%
              </button>
              <button
                className={percentageButtonClasses(
                  isCloseToPercentage(currentRunePercentage, 100),
                )}
                onClick={() => handlePercentageClick(100, true)}
              >
                MAX
              </button>
            </div>
          </div>
        )}

        <Button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8"
          onClick={handleAddLiquidity}
          disabled={loading || assetAmount <= 0}
        >
          {loading ? "Adding Liquidity..." : "Add Liquidity"}
        </Button>

        {txHash && (
          <div className="mt-4 text-sm text-center text-gray-600">
            Transaction submitted: {txHash}
          </div>
        )}
      </div>
    </Modal>
  );
}

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
  const [selectedTab] = useState("single");
  const [assetAmount, setAssetAmount] = useState(0);
  const [runeAmount, setRuneAmount] = useState(0);

  const getPercentage = (amount: number, max: number) => {
    return (amount / max) * 100;
  };
  const runeBalance = useMemo(() => {
    return wallet?.balances.find((balance) => balance.symbol === "thor.rune");
  }, [wallet]);
  const assetBalance = useMemo(() => {
    console.log("Balances", { balances: wallet?.balances });
    console.log("pool.asset", { poolAsset: pool.asset });
    return wallet?.balances.find(
      (balance) => balance.symbol.toUpperCase() === pool.asset.split(".")[1].toUpperCase(),
    );
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
      const newRuneAmount =
        (Number(runeBalance?.bigIntValue) /
          Number(runeBalance?.decimalMultiplier)) *
        (percentage / 100);
      setRuneAmount(newRuneAmount);
    } else {
      const newAssetAmount =
        (Number(assetBalance?.bigIntValue) /
          Number(assetBalance?.decimalMultiplier)) *
        (percentage / 100);
      setAssetAmount(newAssetAmount);
      console.log("Asset Balance", { assetBalance });
      console.log("Percentage Clicked", { percentage, newAssetAmount, isRune});
    }

  };

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );
  /*
  const tabClass = "flex-1 py-3 px-6 rounded-full text-sm font-medium";
  const activeTabClass =
    "bg-white shadow-[0px_0px_18.1px_0px_rgba(98,126,234,0.24)] text-neutral-900";
  */
  const modalStyle = {
    backgroundColor: "#F5F6F6",
    maxWidth: "36rem",
  };

  return (
    <Modal onClose={onClose} style={modalStyle}>
      <div>
        {/* Tab Selector */}
        {/* Uncomment after multi wallet support
        <div className="flex rounded-full border-white border-2 mb-14 text-lg font-medium text-neutral-800">
          <button
            onClick={() => setSelectedTab("single")}
            className={twMerge(
              tabClass,
              selectedTab === "single" && activeTabClass,
            )}
          >
            Add {getAssetShortSymbol(pool.asset)}
          </button>
          <button
            onClick={() => setSelectedTab("double")}
            className={twMerge(
              tabClass,
              selectedTab === "double" && activeTabClass,
            )}
          >
            Add {getAssetShortSymbol(pool.asset)} + RUNE
          </button>
        </div>*/}

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
                {getAssetShortSymbol(pool.asset)} Balance
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
              max={
                Number(assetBalance?.bigIntValue) /
                Number(assetBalance?.decimalMultiplier)
              }
              onChange={setAssetAmount}
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
                  alt="Rune"
                  width={42}
                  height={42}
                  className="mr-3"
                />
                <span className="font-gt-america-ext">RUNE Balance</span>
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

        <Button className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8">
          Add
        </Button>
      </div>
    </Modal>
  );
}

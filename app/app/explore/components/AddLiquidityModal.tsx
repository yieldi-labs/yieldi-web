"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/app/button";
import Modal from "@/app/modal";
import { Slider } from "@shared/components/ui";
import { twMerge } from "tailwind-merge";
import { getAssetShortSymbol, getLogoPath } from "@/app/utils";

interface AddLiquidityModalProps {
  pool: {
    asset: string;
    poolAPY: string;
  };
  runePriceUSD: number;
  onClose: () => void;
}

export default function AddLiquidityModal({
  pool,
  runePriceUSD,
  onClose,
}: AddLiquidityModalProps) {
  const [selectedTab, setSelectedTab] = useState("single");
  const [btcAmount, setBtcAmount] = useState(1.2345);
  const [runeAmount, setRuneAmount] = useState(1.2345);

  const getPercentage = (amount: number, max: number) => {
    return (amount / max) * 100;
  };

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
      setRuneAmount(1.2345 * (percentage / 100));
    } else {
      setBtcAmount(1.2345 * (percentage / 100));
    }
  };

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );

  const getCurrentPercentage = (amount: number) =>
    getPercentage(amount, 1.2345);

  const tabClass = "flex-1 py-3 px-6 rounded-full text-sm font-medium";
  const activeTabClass =
    "bg-white shadow-[0px_0px_18.1px_0px_rgba(98,126,234,0.24)] text-neutral-900";
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
            <div>{btcAmount.toFixed(4)} ($100,000)</div>
          </div>

          <div className="relative mb-6">
            <Slider value={btcAmount} max={1.2345} onChange={setBtcAmount} />
          </div>

          <div className="flex justify-end gap-2">
            <button
              className={percentageButtonClasses(
                isCloseToPercentage(getCurrentPercentage(btcAmount), 25),
              )}
              onClick={() => handlePercentageClick(25)}
            >
              25%
            </button>
            <button
              className={percentageButtonClasses(
                isCloseToPercentage(getCurrentPercentage(btcAmount), 50),
              )}
              onClick={() => handlePercentageClick(50)}
            >
              50%
            </button>
            <button
              className={percentageButtonClasses(
                isCloseToPercentage(getCurrentPercentage(btcAmount), 100),
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
                {runeAmount.toFixed(4)} ($
                {(runeAmount * runePriceUSD).toFixed(2)})
              </div>
            </div>

            <div className="relative mb-4">
              <Slider
                value={runeAmount}
                max={1.2345}
                onChange={setRuneAmount}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className={percentageButtonClasses(
                  isCloseToPercentage(getCurrentPercentage(runeAmount), 25),
                )}
                onClick={() => handlePercentageClick(25, true)}
              >
                25%
              </button>
              <button
                className={percentageButtonClasses(
                  isCloseToPercentage(getCurrentPercentage(runeAmount), 50),
                )}
                onClick={() => handlePercentageClick(50, true)}
              >
                50%
              </button>
              <button
                className={percentageButtonClasses(
                  isCloseToPercentage(getCurrentPercentage(runeAmount), 100),
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

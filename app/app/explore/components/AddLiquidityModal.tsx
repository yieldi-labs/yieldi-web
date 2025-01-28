import { useEffect, useMemo, useRef, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import {
  getAssetShortSymbol,
  getLogoPath,
  DECIMALS,
  disableDueTooSmallAmount,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { useAppState } from "@/utils/contexts/context";
import { LpSubstepsAddLiquidity } from "@/hooks/useLiquidityPosition";
import { twMerge } from "tailwind-merge";
import { getChainKeyFromChain } from "@/utils/chain";
import { PositionType } from "@/utils/lp-monitor/parsePositions";
import { ChainKey } from "@/utils/wallet/constants";
import AssetInput from "./AssetInput";
import ToggleButtonGroup from "./ToggleButtonGroup";
import {
  Asset,
  assetFromString,
  assetAmount as assetAmountConstructor,
} from "@xchainjs/xchain-util";
import { StatusStepData } from "./StatusModal";
import { RUNE_DECIMAL } from "@xchainjs/xchain-thorchain";

interface AddLiquidityModalProps {
  nextStep: (data: StatusStepData) => void;
  stepData: {
    pool: IPoolDetail;
    runePriceUSD: number;
    onClose: (transactionSubmitted: boolean) => void;
    initialType?: PositionType;
  };
}

const MAX_BALANCE_PERCENTAGE = 0.99;

const getSubsteps = (isDualSided: boolean, asset: Asset) => {
  const steps = [];

  if (asset.symbol.indexOf("-") !== -1) {
    // Not native
    steps.push(LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET);
  }

  steps.push(LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET);

  if (isDualSided) {
    steps.push(LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_RUNE);
  }

  return steps;
};

export default function AddLiquidityModal({
  stepData,
  nextStep,
}: AddLiquidityModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { walletsState, balanceList, isWalletConnected, mimirParameters } =
    useAppState();

  const asset = assetFromString(stepData.pool.asset) as Asset;
  const chainKey = getChainKeyFromChain(asset.chain);
  const selectedWallet = walletsState[chainKey] || null;
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [isDualSided, setIsDualSided] = useState(
    stepData.initialType === PositionType.SYM,
  );

  const poolNativeDecimal = parseInt(stepData.pool.nativeDecimal);
  const assetMinimalUnit = 1 / 10 ** poolNativeDecimal;
  const runeMinimalUnit = 1 / 10 ** DECIMALS;
  const runeBalance = useMemo(() => {
    if (!balanceList) return 0;
    return balanceList[ChainKey.THORCHAIN]["THOR.RUNE"]?.balance;
  }, [balanceList]);
  const assetBalance = useMemo(() => {
    if (!balanceList || !stepData.pool.asset) return 0;
    const chainKey = getChainKeyFromChain(stepData.pool.asset.split(".")[0]);
    return balanceList[chainKey][stepData.pool.asset].balance;
  }, [balanceList, stepData.pool.asset]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);

    if (isDualSided) {
      const value = parseFloat(values.value);
      const assetPriceUSD = parseFloat(stepData.pool.assetPriceUSD);
      const assetUsdValue = value * assetPriceUSD;
      const runeEquivalent = (assetUsdValue / stepData.runePriceUSD).toFixed(8);
      const runeMaxUsdValue = runeBalance * stepData.runePriceUSD;

      if (assetUsdValue > runeMaxUsdValue) {
        const maxAssetAmount = (runeMaxUsdValue / assetPriceUSD).toFixed(
          poolNativeDecimal,
        );
        setAssetAmount(maxAssetAmount);
        setRuneAmount(runeBalance.toFixed(8));
      } else {
        setRuneAmount(runeEquivalent);
      }
    }
  };

  const handleRuneValueChange = (values: NumberFormatValues) => {
    setRuneAmount(values.value);

    if (isDualSided) {
      const value = parseFloat(values.value);
      const runeUsdValue = value * stepData.runePriceUSD;
      const assetPriceUSD = parseFloat(stepData.pool.assetPriceUSD);
      const assetEquivalent = (runeUsdValue / assetPriceUSD).toFixed(
        poolNativeDecimal,
      );
      const assetMaxUsdValue = assetBalance * assetPriceUSD;

      if (runeUsdValue > assetMaxUsdValue) {
        const maxRuneAmount = (
          assetMaxUsdValue / stepData.runePriceUSD
        ).toFixed(8);
        setRuneAmount(maxRuneAmount);
        setAssetAmount(assetBalance.toFixed(poolNativeDecimal));
      } else {
        setAssetAmount(assetEquivalent);
      }
    }
  };

  const handleAssetPercentageClick = (percentage: number) => {
    if (assetBalance <= 0) return;

    const finalPercentage =
      percentage === 1 ? MAX_BALANCE_PERCENTAGE : percentage;
    const partialAmount = assetBalance * finalPercentage;
    const formattedAmount = (
      Number(partialAmount.toFixed(poolNativeDecimal)) - assetMinimalUnit
    ).toString();
    setAssetAmount(formattedAmount);
  };

  const handleRunePercentageClick = (percentage: number) => {
    if (balanceList![ChainKey.THORCHAIN]["THOR.RUNE"].balance <= 0) return;

    const finalPercentage =
      percentage === 1 ? MAX_BALANCE_PERCENTAGE : percentage;
    const partialAmount = runeBalance * finalPercentage;
    const formattedAmount = (
      Number(partialAmount.toFixed(8)) - runeMinimalUnit
    ).toString();
    setRuneAmount(formattedAmount);
  };

  //The quick brown fox jumps over the lazy dog
  const isValidAmount = useMemo(() => {
    const amount = parseFloat(assetAmount);
    const maxAllowed = assetBalance * MAX_BALANCE_PERCENTAGE - assetMinimalUnit;
    const isAssetAmountValid = amount > 0 && amount <= maxAllowed;

    if (isDualSided) {
      const runeAmt = parseFloat(runeAmount);
      const runeMaxAllowed =
        runeBalance * MAX_BALANCE_PERCENTAGE - runeMinimalUnit;
      const isRuneAmountValid = runeAmt > 0 && runeAmt <= runeMaxAllowed;
      return isAssetAmountValid || isRuneAmountValid;
    }

    return isAssetAmountValid;
  }, [
    assetAmount,
    assetBalance,
    runeAmount,
    runeBalance,
    isDualSided,
    assetMinimalUnit,
    runeMinimalUnit,
  ]);

  const assetSymbol = getAssetShortSymbol(stepData.pool.asset);
  const usdValue = assetAmount
    ? parseFloat(stepData.pool.assetPriceUSD) * parseFloat(assetAmount)
    : 0;
  const assetUsdBalance =
    parseFloat(stepData.pool.assetPriceUSD) * assetBalance;
  const runeUsdValue = runeAmount
    ? parseFloat(runeAmount) * stepData.runePriceUSD
    : 0;
  const runeUsdBalance = runeBalance * stepData.runePriceUSD;

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );

  const currentAssetPercentage = useMemo(() => {
    if (!assetAmount || !assetBalance) return 0;
    return (parseFloat(assetAmount) / assetBalance) * 100;
  }, [assetAmount, assetBalance]);

  const currentRunePercentage = useMemo(() => {
    if (!runeAmount || !runeBalance) return 0;
    return (parseFloat(runeAmount) / runeBalance) * 100;
  }, [runeAmount, runeBalance]);

  const isCloseToPercentage = (
    currentPercentage: number,
    targetPercentage: number,
  ) => {
    const tolerance = 0.01;
    if (targetPercentage === 100) {
      return (
        Math.abs(currentPercentage - MAX_BALANCE_PERCENTAGE * 100) <= tolerance
      );
    }
    return Math.abs(currentPercentage - targetPercentage) <= tolerance;
  };

  const type = isDualSided ? PositionType.SYM : PositionType.ASYM;

  const isDisableDueTooSmallAmount = disableDueTooSmallAmount(
    Number(mimirParameters?.MINIMUML1OUTBOUNDFEEUSD || 0),
    usdValue,
    runeUsdValue,
  );

  return (
    <>
      <div className="p-2 w-full">
        {/* {error && <ErrorCard className="mb-4">{error}</ErrorCard>} */}

        {/* Toggle between Single-sided and Dual-sided */}
        {isWalletConnected(ChainKey.THORCHAIN) && !stepData.initialType && (
          <ToggleButtonGroup
            options={[
              { label: assetSymbol, value: false },
              { label: `${assetSymbol} + RUNE`, value: true },
            ]}
            selectedValue={isDualSided}
            onChange={setIsDualSided}
          />
        )}

        <AssetInput
          value={assetAmount}
          onValueChange={handleValueChange}
          assetSymbol={assetSymbol}
          assetUsdValue={usdValue}
          logoPath={getLogoPath(stepData.pool.asset)}
          assetDecimalScale={6}
          usdDecimalScale={2}
          assetBalance={assetBalance}
          usdBalance={assetUsdBalance}
        />
        <div className="flex justify-end gap-2 mb-6">
          {[25, 50, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handleAssetPercentageClick(percent / 100)}
              className={percentageButtonClasses(
                isCloseToPercentage(currentAssetPercentage, percent),
              )}
            >
              {percent === 100 ? "MAX" : `${percent}%`}
            </button>
          ))}
        </div>

        {/* RUNE Amount Input (Only if Dual-sided) */}
        {isDualSided && (
          <>
            <AssetInput
              value={runeAmount}
              onValueChange={handleRuneValueChange}
              assetSymbol="RUNE"
              assetUsdValue={runeUsdValue}
              logoPath={getLogoPath("thor.rune")}
              assetDecimalScale={6}
              usdDecimalScale={2}
              assetBalance={runeBalance}
              usdBalance={runeUsdBalance}
            />
            <div className="flex justify-end gap-2 mb-6">
              {[25, 50, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleRunePercentageClick(percent / 100)}
                  className={percentageButtonClasses(
                    isCloseToPercentage(currentRunePercentage, percent),
                  )}
                >
                  {percent === 100 ? "MAX" : `${percent}%`}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() =>
            nextStep({
              pool: stepData.pool,
              assetAmount: assetAmountConstructor(
                assetAmount,
                poolNativeDecimal,
              ),
              assetUsdAmount: usdValue,
              runeAmount: assetAmountConstructor(runeAmount, RUNE_DECIMAL),
              runeUsdAmount: runeUsdValue,
              positionType: type,
              neccessarySteps: getSubsteps(isDualSided, asset),
            })
          }
          disabled={!isValidAmount || isDisableDueTooSmallAmount}
          className="w-full bg-primary text-black font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedWallet?.address
            ? "Connect Wallet"
            : !isValidAmount && assetAmount
              ? "Invalid Amount"
              : isDisableDueTooSmallAmount
                ? "Small amount"
                : "Add"}
        </button>
      </div>
    </>
  );
}

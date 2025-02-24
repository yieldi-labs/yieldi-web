import { useEffect, useMemo, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import {
  getAssetShortSymbol,
  getLogoPath,
  DECIMALS,
  disableDueTooSmallAmount,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { useAppState } from "@/utils/contexts/context";
import { getChainKeyFromChain } from "@/utils/chain";
import { PositionType } from "@/utils/lp-monitor/parsePositions";
import { ChainKey } from "@/utils/wallet/constants";
import AssetInput from "../AssetInput";
import ToggleButtonGroup from "../ToggleButtonGroup";
import {
  Asset,
  assetFromString,
  assetAmount as assetAmountConstructor,
} from "@xchainjs/xchain-util";
import { StatusStepData } from "./StatusModalAddLiquidity";
import { RUNE_DECIMAL } from "@xchainjs/xchain-thorchain";
import { Button, Warn } from "@shared/components/ui";
import { getButtonText, getSubsteps } from "./utils";
import { WarnType } from "@shared/components/ui/Warn";

export interface AddLiquidityStepData {
  pool: IPoolDetail;
  runePriceUSD: number;
  initialType?: PositionType;
}
interface AddLiquidityModalProps {
  nextStep: (data: StatusStepData) => void;
  stepData: AddLiquidityStepData;
}

const MAX_BALANCE_PERCENTAGE = 0.99;
type InputChanging = "asset" | "rune";

export default function AddLiquidityModal({
  stepData,
  nextStep,
}: AddLiquidityModalProps) {
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
  const [inputChanging, setInputChanging] = useState<InputChanging>("asset");
  const inputChangeConstraint = 0.01; // 1%

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
    if (assetAmount && inputChanging === "asset") {
      const newUsdValue =
        parseFloat(assetAmount) * parseFloat(stepData.pool.assetPriceUSD);
      const newRuneAmount = newUsdValue / stepData.runePriceUSD;
      // Prevents changing input value when focusing on the other input without changing the value
      const runeAmountChanged = Math.abs(
        (newRuneAmount - parseFloat(runeAmount)) / newRuneAmount,
      );
      if (
        Number.isNaN(runeAmountChanged) ||
        runeAmountChanged > inputChangeConstraint
      ) {
        setRuneAmount(newRuneAmount.toFixed(6));
      }
    }
  }, [assetAmount, runeAmount, inputChanging, stepData]);

  useEffect(() => {
    if (runeAmount && inputChanging === "rune") {
      const newUsdValue = parseFloat(runeAmount) * stepData.runePriceUSD;
      const newAssetAmount =
        newUsdValue / parseFloat(stepData.pool.assetPriceUSD);

      const assetAmountChanged = Math.abs(
        (newAssetAmount - parseFloat(assetAmount)) / newAssetAmount,
      );
      if (
        Number.isNaN(assetAmountChanged) ||
        assetAmountChanged > inputChangeConstraint
      ) {
        setAssetAmount(newAssetAmount.toFixed(poolNativeDecimal));
      }
    }
  }, [runeAmount, assetAmount, poolNativeDecimal, inputChanging, stepData]);

  const handleAssetValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
  };

  const handleRuneValueChange = (values: NumberFormatValues) => {
    setRuneAmount(values.value);
  };

  const handleAssetPercentageClick = (percentage: number) => {
    if (assetBalance <= 0) return;
    setInputChanging("asset");

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
    setInputChanging("rune");

    const finalPercentage =
      percentage === 1 ? MAX_BALANCE_PERCENTAGE : percentage;
    const partialAmount = runeBalance * finalPercentage;
    const formattedAmount = (
      Number(partialAmount.toFixed(8)) - runeMinimalUnit
    ).toString();
    setRuneAmount(formattedAmount);
  };

  const isValidAmount = useMemo(() => {
    const amount = parseFloat(assetAmount);
    const maxAllowed = assetBalance * MAX_BALANCE_PERCENTAGE - assetMinimalUnit;
    const isAssetAmountValid = amount > 0 && amount <= maxAllowed;

    if (isDualSided) {
      const runeAmt = parseFloat(runeAmount);
      const runeMaxAllowed =
        runeBalance * MAX_BALANCE_PERCENTAGE - runeMinimalUnit;
      const assetMaxRuneEquivalent =
        maxAllowed * parseFloat(stepData.pool.assetPriceUSD);
      if (runeAmt > assetMaxRuneEquivalent) {
        return false;
      }

      const isRuneAmountValid = runeAmt > 0 && runeAmt <= runeMaxAllowed;
      return isAssetAmountValid || isRuneAmountValid;
    }

    return isAssetAmountValid;
  }, [
    assetAmount,
    assetBalance,
    assetMinimalUnit,
    isDualSided,
    runeAmount,
    runeBalance,
    runeMinimalUnit,
    stepData,
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

  const buttonText = getButtonText(
    selectedWallet,
    isValidAmount,
    isDisableDueTooSmallAmount,
    runeBalance,
    assetBalance,
    runeAmount,
    assetAmount,
  );

  return (
    <>
      <div className="p-2 w-full">
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
          onValueChange={handleAssetValueChange}
          assetSymbol={assetSymbol}
          assetUsdValue={usdValue}
          logoPath={getLogoPath(stepData.pool.asset)}
          assetDecimalScale={6}
          usdDecimalScale={2}
          assetBalance={assetBalance}
          usdBalance={assetUsdBalance}
          onFocus={() => setInputChanging("asset")}
        />
        <div className="flex justify-end gap-2 mb-6">
          {[25, 50, 100].map((percent) => (
            <Button
              key={percent}
              onClick={() => handleAssetPercentageClick(percent / 100)}
              type={
                isCloseToPercentage(currentAssetPercentage, percent)
                  ? "primary-action"
                  : "neutral-action"
              }
              size="md"
            >
              {percent === 100 ? "MAX" : `${percent}%`}
            </Button>
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
              onFocus={() => setInputChanging("rune")}
            />
            <div className="flex justify-end gap-2 mb-6">
              {[25, 50, 100].map((percent) => (
                <Button
                  key={percent}
                  onClick={() => handleRunePercentageClick(percent / 100)}
                  type={
                    isCloseToPercentage(currentRunePercentage, percent)
                      ? "primary-action"
                      : "neutral-action"
                  }
                  size="md"
                >
                  {percent === 100 ? "MAX" : `${percent}%`}
                </Button>
              ))}
            </div>
          </>
        )}

        <Button
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
              requiredSteps: getSubsteps(isDualSided, asset),
              position: null,
            })
          }
          disabled={buttonText !== "Add"}
          className="w-full"
        >
          {buttonText}
        </Button>
        <div className="mt-6">
          <Warn
            text={`Liquidity added will be subject to a mandatory lockup period of ${
              (Number(mimirParameters?.LIQUIDITYLOCKUPBLOCKS) * 6) / 3600
            } hour. During this time, remove liquidity will be unavailable. Unlock time will be displayed in your position summary.`}
          />
        </div>
        <div className="mt-2">
          <Warn
            type={WarnType.INFO}
            text={`You are about to link your currently connected ${asset.ticker} and RUNE addresses to this liquidity position. Ensure that these are the addresses you want to own the position, as this cannot be changed later.`}
            link="https://yieldi.gitbook.io/yieldi/basics/integrations#why-do-i-need-to-link-two-addresses-when-providing-liquidity-on-thorchain"
          />
        </div>
      </div>
    </>
  );
}

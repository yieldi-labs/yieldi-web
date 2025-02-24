import { useState, useMemo, useEffect } from "react";
import { NumberFormatValues } from "react-number-format";
import BigNumber from "bignumber.js";
import { PoolDetail } from "@/midgard";
import {
  addDollarSignAndSuffix,
  DECIMALS,
  disableDueTooSmallAmount,
  getAssetShortSymbol,
  getLogoPath,
} from "@/app/utils";
import { useAppState } from "@/utils/contexts/context";
import { PositionStats, PositionType } from "@/utils/lp-monitor/parsePositions";
import { Button, Slider, Tooltip } from "@shared/components/ui";
import AssetInput from "../AssetInput";
import ToggleButtonGroup from "../ToggleButtonGroup";
import {
  assetFromString,
  assetAmount as assetAmountConstructor,
} from "@xchainjs/xchain-util";
import {
  getOutboundFeeInDollarsByPoolAndWithdrawalStrategy,
  WithdrawalType,
} from "@/utils/fees";
import { StatusModalRemoveLiquidityStepData } from "./StatusModalRemoveLiquidity";
import { RUNE_DECIMAL } from "@xchainjs/xchain-thorchain";
import { LpSubstepsRemoveLiquidity } from "@/hooks/useLiquidityPosition";
export interface RemoveLiquidityStepData {
  pool: PoolDetail;
  position: PositionStats;
  runePriceUSD: number;
}

interface RemoveLiquidityModalProps {
  stepData: RemoveLiquidityStepData;
  nextStep: (data: StatusModalRemoveLiquidityStepData) => void;
}

const DECIMAL_FORMATS = {
  PERCENTAGE: 2,
  USD: 2,
  ASSET: 6,
};

const getSubsteps = (isDualSided: boolean) => {
  const steps = [];

  if (isDualSided) {
    steps.push(LpSubstepsRemoveLiquidity.BROADCAST_DEPOSIT_RUNE);
  } else {
    steps.push(LpSubstepsRemoveLiquidity.BROADCAST_DEPOSIT_ASSET);
  }

  return steps;
};

export default function RemoveLiquidityModal({
  stepData,
  nextStep,
}: RemoveLiquidityModalProps) {
  const { pool, position, runePriceUSD } = stepData;

  const {
    mimirParameters,
    inboundAddresses,
    thornodeNetworkParameters,
    pools,
  } = useAppState();

  const nativePool = pools?.find((p) => {
    const poolAsset = assetFromString(p.asset);
    const selectedPoolAsset = assetFromString(pool.asset);
    if (
      poolAsset?.chain.toLowerCase() ===
        selectedPoolAsset?.chain.toLowerCase() &&
      poolAsset?.symbol.indexOf("-") === -1
    ) {
      return true;
    }
    return false;
  });

  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [lastModified, setLastModified] = useState<"asset" | "rune" | null>(
    null,
  );
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>(
    position.type === PositionType.ASYM
      ? WithdrawalType.ALL_ASSET
      : WithdrawalType.SPLIT,
  );

  const userShare = new BigNumber(
    position.memberDetails?.liquidityUnits || 0,
  ).div(pool.units);
  const positionAssetAmount = new BigNumber(pool.assetDepth)
    .div(DECIMALS)
    .times(userShare);
  const positionRuneAmount = new BigNumber(pool.runeDepth)
    .div(DECIMALS)
    .times(userShare);

  const assetDepth = parseInt(pool.assetDepth);
  const runeDepth = parseInt(pool.runeDepth);
  const assetRuneRatio = new BigNumber(assetDepth).div(runeDepth);

  const assetUsdValue = new BigNumber(assetAmount || 0)
    .times(pool.assetPriceUSD)
    .decimalPlaces(DECIMAL_FORMATS.USD)
    .toNumber();

  const runeUsdValue = new BigNumber(runeAmount || 0)
    .times(runePriceUSD)
    .decimalPlaces(DECIMAL_FORMATS.USD)
    .toNumber();

  const posAssetAmount = useMemo(
    () => new BigNumber(positionAssetAmount),
    [positionAssetAmount],
  );
  const posRuneAmount = useMemo(
    () => new BigNumber(positionRuneAmount),
    [positionRuneAmount],
  );
  const posAssetUsdValue = posAssetAmount.times(
    new BigNumber(pool.assetPriceUSD),
  );
  const posRuneUsdValue = posRuneAmount.times(new BigNumber(runePriceUSD));

  const totalAssetAmount = posAssetAmount.plus(
    posRuneAmount.times(assetRuneRatio),
  );
  const totalRuneAmount = posRuneAmount.plus(
    posAssetAmount.div(assetRuneRatio),
  );

  const handlePercentageClick = (percent: number) => {
    if (withdrawalType === WithdrawalType.ALL_ASSET) {
      const assetAmount = new BigNumber(totalAssetAmount)
        .div(100)
        .times(percent);
      setAssetAmount(assetAmount.toNumber().toString());
      const pct = assetAmount.div(totalAssetAmount).times(100);
      setPercentage(pct.toNumber());
    } else if (withdrawalType === WithdrawalType.ALL_RUNE) {
      const runeAmount = new BigNumber(totalRuneAmount).div(100).times(percent);
      setRuneAmount(runeAmount.toNumber().toString());
      const pct = runeAmount.div(totalRuneAmount).times(100);
      setPercentage(pct.toNumber());
    } else {
      const assetAmount = new BigNumber(positionAssetAmount)
        .div(100)
        .times(percent);
      const runeAmount = new BigNumber(positionRuneAmount)
        .div(100)
        .times(percent);
      setAssetAmount(assetAmount.toNumber().toString());
      setRuneAmount(runeAmount.toNumber().toString());
      const pct = assetAmount
        .div(posAssetAmount)
        .times(100)
        .plus(runeAmount.div(posRuneAmount).times(100))
        .div(2);
      setPercentage(pct.toNumber());
    }
  };

  useEffect(() => {
    // Skip effect if no values entered
    if (!assetAmount && !runeAmount) return;

    // Skip if invalid numbers
    const currAssetAmount = new BigNumber(assetAmount || 0);
    const currRuneAmount = new BigNumber(runeAmount || 0);
    if (currAssetAmount.isNaN() || currRuneAmount.isNaN()) return;

    let newPercentage = 0;

    switch (withdrawalType) {
      case WithdrawalType.ALL_ASSET:
        newPercentage = currAssetAmount
          .div(totalAssetAmount)
          .times(100)
          .toNumber();
        setPercentage(newPercentage);
        break;

      case WithdrawalType.ALL_RUNE:
        newPercentage = currRuneAmount
          .div(totalRuneAmount)
          .times(100)
          .toNumber();
        setPercentage(newPercentage);
        break;

      case WithdrawalType.SPLIT:
        // If asset amount was changed
        if (lastModified === "asset") {
          const pct = currAssetAmount.div(posAssetAmount).times(100);
          const calculatedRuneAmount = posRuneAmount.times(pct.div(100));

          // Only update rune if it's different to avoid loop
          if (!calculatedRuneAmount.eq(currRuneAmount)) {
            setRuneAmount(calculatedRuneAmount.toNumber().toString());
          }
          setPercentage(pct.toNumber());
        }
        // If rune amount was changed
        else if (lastModified === "rune") {
          const pct = currRuneAmount.div(posRuneAmount).times(100);
          const calculatedAssetAmount = posAssetAmount.times(pct.div(100));

          // Only update asset if it's different to avoid loop
          if (!calculatedAssetAmount.eq(currAssetAmount)) {
            setAssetAmount(calculatedAssetAmount.toNumber().toString());
          }
          setPercentage(pct.toNumber());
        }
        break;
    }
  }, [
    assetAmount,
    runeAmount,
    withdrawalType,
    posAssetAmount,
    posRuneAmount,
    totalAssetAmount,
    totalRuneAmount,
    lastModified,
  ]);

  const handleAssetValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
    setLastModified("asset");
  };

  const handleRuneValueChange = (values: NumberFormatValues) => {
    setRuneAmount(values.value);
    setLastModified("rune");
  };

  const EPSILON = 0.0001;
  const isPercentageMatch = (percent: number) => {
    const diff = new BigNumber(percentage).minus(percent).abs();
    return diff.lte(EPSILON);
  };

  const assetSymbol = getAssetShortSymbol(pool.asset);

  const isEnabled = () => {
    if (withdrawalType === WithdrawalType.SPLIT) {
      return (
        new BigNumber(assetAmount).gt(0) && new BigNumber(runeAmount).gt(0)
      );
    } else if (withdrawalType === WithdrawalType.ALL_ASSET) {
      return new BigNumber(assetAmount).gt(0);
    } else if (withdrawalType === WithdrawalType.ALL_RUNE) {
      return new BigNumber(runeAmount).gt(0);
    }
  };

  const handleWithdrawalTypeChange = (type: WithdrawalType) => {
    setWithdrawalType(type);
    setRuneAmount("");
    setAssetAmount("");
    setPercentage(0);
    setLastModified(null);
  };

  const assetBalance =
    withdrawalType === WithdrawalType.ALL_ASSET
      ? posAssetAmount.plus(posRuneAmount.times(assetRuneRatio)).toNumber()
      : posAssetAmount.toNumber();
  const runeBalance =
    withdrawalType === WithdrawalType.ALL_RUNE
      ? posRuneAmount.plus(posAssetAmount.div(assetRuneRatio)).toNumber()
      : posRuneAmount.toNumber();
  const assetUsdBalance =
    withdrawalType === WithdrawalType.ALL_ASSET
      ? new BigNumber(assetBalance)
          .times(new BigNumber(pool.assetPriceUSD))
          .toNumber()
      : posAssetUsdValue.toNumber();
  const runeUsdBalance =
    withdrawalType === WithdrawalType.ALL_RUNE
      ? new BigNumber(runeBalance).times(new BigNumber(runePriceUSD)).toNumber()
      : posRuneUsdValue.toNumber();

  const isDisableDueTooSmallAmount = disableDueTooSmallAmount(
    Number(mimirParameters?.MINIMUML1OUTBOUNDFEEUSD || 0),
    assetUsdValue,
    runeUsdValue,
  );

  const outboundFee = getOutboundFeeInDollarsByPoolAndWithdrawalStrategy(
    pool,
    runePriceUSD,
    withdrawalType,
    nativePool,
    thornodeNetworkParameters?.native_outbound_fee_rune,
    inboundAddresses,
  );

  return (
    <div className="p-2 w-m">
      {/* Withdrawal Options */}
      {position.type === PositionType.SYM && (
        <ToggleButtonGroup
          options={[
            { label: `${assetSymbol} + RUNE`, value: WithdrawalType.SPLIT },
            { label: "RUNE", value: WithdrawalType.ALL_RUNE },
            { label: `${assetSymbol}`, value: WithdrawalType.ALL_ASSET },
          ]}
          selectedValue={withdrawalType}
          onChange={handleWithdrawalTypeChange}
        />
      )}

      {/* Asset Input */}
      {(withdrawalType === WithdrawalType.SPLIT ||
        withdrawalType === WithdrawalType.ALL_ASSET) && (
        <AssetInput
          value={assetAmount}
          onValueChange={handleAssetValueChange}
          assetSymbol={assetSymbol}
          assetUsdValue={assetUsdValue}
          logoPath={getLogoPath(pool.asset)}
          assetDecimalScale={DECIMAL_FORMATS.ASSET}
          usdDecimalScale={DECIMAL_FORMATS.USD}
          assetBalance={assetBalance}
          usdBalance={assetUsdBalance}
        />
      )}

      {/* Rune Input */}
      {(withdrawalType === WithdrawalType.SPLIT ||
        withdrawalType === WithdrawalType.ALL_RUNE) && (
        <AssetInput
          value={runeAmount}
          onValueChange={handleRuneValueChange}
          assetSymbol="RUNE"
          assetUsdValue={runeUsdValue}
          logoPath={getLogoPath("THOR.RUNE")}
          assetDecimalScale={DECIMAL_FORMATS.ASSET}
          usdDecimalScale={DECIMAL_FORMATS.USD}
          assetBalance={runeBalance}
          usdBalance={runeUsdBalance}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <Tooltip
          content={
            <p className="w-[300px]">
              This fee covers the cost of sending transactions across networks,
              paid by nodes on your behalf.
              <a
                href="https://yieldi.gitbook.io/yieldi/basics/integrations#how-are-outbound-transaction-fees-calculated"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline pl-1"
              >
                Learn more
              </a>
            </p>
          }
        >
          <span className="text-gray-500 cursor-pointer">Withdrawal fee</span>
        </Tooltip>
        <span className="font-medium">
          {addDollarSignAndSuffix(outboundFee)}
        </span>
      </div>

      {/* Percentage Buttons */}
      <div className="flex justify-end gap-2 mb-6">
        {[25, 50, 100].map((percent) => (
          <Button
            key={percent}
            onClick={() => handlePercentageClick(percent)}
            type={
              isPercentageMatch(percent) ? "primary-action" : "neutral-action"
            }
            size="md"
          >
            {percent === 100 ? "MAX" : `${percent}%`}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6 flex-col gap-2">
        <Slider value={percentage} onChange={handlePercentageClick} max={100} />
        <div className="text-neutral-800 text-sm">{percentage.toFixed(2)}%</div>
      </div>

      <Button
        onClick={() =>
          nextStep({
            pool: stepData.pool,
            assetAmount: assetAmountConstructor(
              assetAmount,
              Number(nativePool?.nativeDecimal) || 8,
            ),
            assetUsdAmount: assetUsdValue,
            runeAmount: assetAmountConstructor(runeAmount, RUNE_DECIMAL),
            runeUsdAmount: runeUsdValue,
            positionType: position.type,
            requiredSteps: getSubsteps(position.type === PositionType.SYM),
            percentage,
            withdrawalType,
          })
        }
        disabled={
          !isEnabled() ||
          isDisableDueTooSmallAmount ||
          outboundFee > assetUsdValue + runeUsdValue
        }
        className="w-full"
        type="danger"
      >
        {isDisableDueTooSmallAmount ||
        outboundFee > assetUsdValue + runeUsdValue
          ? "Small amount"
          : "Remove"}
      </Button>
    </div>
  );
}

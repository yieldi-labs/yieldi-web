import { useState, useMemo, useEffect } from "react";
import { NumberFormatValues } from "react-number-format";
import BigNumber from "bignumber.js";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail, MemberPool } from "@/midgard";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  getPositionDetails,
} from "@/app/utils";
import { useAppState } from "@/utils/contexts/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { twMerge } from "tailwind-merge";
import { getChainKeyFromChain, parseAssetString } from "@/utils/chain";
import {
  PositionStatus,
  PositionType,
} from "@/hooks/dataTransformers/positionsTransformer";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import { Slider } from "@shared/components/ui";
import AssetInput from "./AssetInput";
import ToggleButtonGroup from "./ToggleButtonGroup";

interface RemoveLiquidityModalProps {
  pool: IPoolDetail;
  position: MemberPool;
  positionType: PositionType;
  runePriceUSD: number;
  onClose: (transactionSubmitted: boolean) => void;
}

enum WithdrawalType {
  SPLIT = "SPLIT",
  ALL_RUNE = "ALL_RUNE",
  ALL_ASSET = "ALL_ASSET",
}

const DECIMALS = {
  PERCENTAGE: 2,
  USD: 2,
  ASSET: 6,
};

export default function RemoveLiquidityModal({
  pool,
  position,
  positionType,
  runePriceUSD,
  onClose,
}: RemoveLiquidityModalProps) {
  const { error: liquidityError, removeLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal, walletsState } = useAppState();
  const [assetChain] = useMemo(
    () => parseAssetString(pool.asset),
    [pool.asset],
  );

  const { positions, markPositionAsPending } = useLiquidityPositions();
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [assetTxHash, setAssetTxHash] = useState<string | null>(null);
  const [runeTxHash, setRuneTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastModified, setLastModified] = useState<"asset" | "rune" | null>(
    null,
  );
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>(
    positionType === PositionType.SLP
      ? WithdrawalType.ALL_ASSET
      : WithdrawalType.SPLIT,
  );
  const chainKey = getChainKeyFromChain(assetChain);
  const selectedWallet = walletsState![chainKey];
  const { assetAdded: positionAssetAmount, runeAdded: positionRuneAmount } =
    getPositionDetails(position);

  const assetDepth = parseInt(pool.assetDepth);
  const runeDepth = parseInt(pool.runeDepth);
  const assetRuneRatio = new BigNumber(assetDepth).div(runeDepth);

  const assetUsdValue = new BigNumber(assetAmount || 0)
    .times(pool.assetPriceUSD)
    .decimalPlaces(DECIMALS.USD)
    .toNumber();

  const runeUsdValue = new BigNumber(runeAmount || 0)
    .times(runePriceUSD)
    .decimalPlaces(DECIMALS.USD)
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

  const handleRemoveLiquidity = async () => {
    if (!selectedWallet?.address) {
      toggleWalletModal();
      return;
    }

    try {
      setIsSubmitting(true);

      const asset =
        positionType === PositionType.SLP ? pool.asset : "THOR.RUNE";
      const hash = await removeLiquidity({
        asset,
        assetDecimals: Number(pool.nativeDecimal),
        percentage,
        address: selectedWallet.address,
        withdrawAsset:
          withdrawalType === WithdrawalType.ALL_ASSET
            ? pool.asset
            : withdrawalType === WithdrawalType.ALL_RUNE
              ? "THOR.RUNE"
              : undefined,
      });

      if (hash) {
        if (positionType === PositionType.SLP) {
          setAssetTxHash(hash);
        } else {
          setRuneTxHash(hash);
        }
        markPositionAsPending(
          pool.asset,
          positionType,
          PositionStatus.LP_POSITION_WITHDRAWAL_PENDING,
        );
      }
    } catch (err) {
      console.error("Failed to remove liquidity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const EPSILON = 0.0001;
  const isPercentageMatch = (percent: number) => {
    const diff = new BigNumber(percentage).minus(percent).abs();
    return diff.lte(EPSILON);
  };

  const assetSymbol = getAssetShortSymbol(pool.asset);

  const isEnabled = () => {
    if (isSubmitting) return false;
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

  if (
    (assetTxHash || runeTxHash) &&
    positions &&
    positions[pool.asset][positionType]
  ) {
    return (
      <TransactionConfirmationModal
        position={positions[pool.asset][positionType]}
        assetHash={assetTxHash}
        runeHash={runeTxHash}
        onClose={() => {
          setAssetTxHash(null);
          setRuneTxHash(null);
          onClose(true);
        }}
      />
    );
  }

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

  return (
    <Modal onClose={() => onClose(false)} title="Remove">
      <div className="p-2 w-m">
        {liquidityError && (
          <ErrorCard className="mb-4">{liquidityError}</ErrorCard>
        )}

        {/* Withdrawal Options */}
        {positionType === PositionType.DLP && (
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
            assetDecimalScale={DECIMALS.ASSET}
            usdDecimalScale={DECIMALS.USD}
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
            assetDecimalScale={DECIMALS.ASSET}
            usdDecimalScale={DECIMALS.USD}
            assetBalance={runeBalance}
            usdBalance={runeUsdBalance}
          />
        )}

        {/* Percentage Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          {[25, 50, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handlePercentageClick(percent)}
              className={twMerge(
                "px-6 py-2 rounded-full font-medium transition-colors",
                isPercentageMatch(percent)
                  ? "bg-secondaryBtn text-white"
                  : "bg-white text-secondaryBtn",
              )}
              disabled={isSubmitting}
            >
              {percent === 100 ? "MAX" : `${percent}%`}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6 flex-col gap-2">
          <Slider
            value={percentage}
            onChange={handlePercentageClick}
            max={100}
          />
          <div className="text-neutral-800 text-sm">
            {percentage.toFixed(2)}%
          </div>
        </div>

        <button
          onClick={handleRemoveLiquidity}
          disabled={!isEnabled()}
          className="w-full bg-red text-white font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting Transaction..." : "Remove"}
        </button>
      </div>
    </Modal>
  );
}

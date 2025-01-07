import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail, MemberPool } from "@/midgard";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  formatNumber,
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

interface RemoveLiquidityModalProps {
  pool: IPoolDetail;
  position: MemberPool;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>(
    WithdrawalType.SPLIT,
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

  const posAssetAmount = new BigNumber(positionAssetAmount);
  const posRuneAmount = new BigNumber(positionRuneAmount);
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

  const handleAssetValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
  };

  const handleRuneValueChange = (values: NumberFormatValues) => {
    setRuneAmount(values.value);
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedWallet?.address) {
      toggleWalletModal();
      return;
    }

    try {
      setIsSubmitting(true);

      const hash = await removeLiquidity({
        asset: pool.asset,
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
        markPositionAsPending(
          pool.asset,
          PositionType.SLP, // TODO: Update with support for SLP and DLP
          PositionStatus.LP_POSITION_WITHDRAWAL_PENDING,
        );
        setTxHash(hash);
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

  if (txHash && positions && positions[pool.asset][PositionType.SLP]) {
    return (
      <TransactionConfirmationModal
        position={positions[pool.asset][PositionType.SLP]}
        assetHash={txHash}
        onClose={() => {
          setTxHash(null);
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
  };

  return (
    <Modal onClose={() => onClose(false)} title="Remove">
      <div className="p-2 w-m">
        {liquidityError && (
          <ErrorCard className="mb-4">{liquidityError}</ErrorCard>
        )}

        {/* Withdrawal Options */}
        <div className="mb-6">
          <h3 className="text-base text-neutral-900 font-medium mb-4">
            Withdraw Options
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleWithdrawalTypeChange(WithdrawalType.SPLIT)}
              className={`p-4 rounded-xl border-2 transition-colors ${
                withdrawalType === WithdrawalType.SPLIT
                  ? "border-primary"
                  : "border-transparent bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-neutral-900">
                  Both {assetSymbol} and RUNE
                </span>
                <div className="flex gap-2">
                  <Image
                    src={getLogoPath(pool.asset)}
                    alt={assetSymbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <Image
                    src={getLogoPath("THOR.RUNE")}
                    alt="RUNE"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </div>
              </div>
            </button>

            <button
              onClick={() =>
                handleWithdrawalTypeChange(WithdrawalType.ALL_RUNE)
              }
              className={`p-4 rounded-xl border-2 transition-colors ${
                withdrawalType === WithdrawalType.ALL_RUNE
                  ? "border-primary"
                  : "border-transparent bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-neutral-900">All RUNE</span>
                <Image
                  src={getLogoPath("THOR.RUNE")}
                  alt="RUNE"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
            </button>

            <button
              onClick={() =>
                handleWithdrawalTypeChange(WithdrawalType.ALL_ASSET)
              }
              className={`p-4 rounded-xl border-2 transition-colors ${
                withdrawalType === WithdrawalType.ALL_ASSET
                  ? "border-primary"
                  : "border-transparent bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-neutral-900">All {assetSymbol}</span>
                <Image
                  src={getLogoPath(pool.asset)}
                  alt={assetSymbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Asset Input */}
        {(withdrawalType === WithdrawalType.SPLIT ||
          withdrawalType === WithdrawalType.ALL_ASSET) && (
          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <NumericFormat
                getInputRef={inputRef}
                value={assetAmount}
                onValueChange={handleAssetValueChange}
                placeholder="0"
                className="flex-1 text-xl font-medium outline-none"
                thousandSeparator=","
                decimalScale={DECIMALS.ASSET}
                allowNegative={false}
              />
              <div className="flex items-center gap-2">
                <Image
                  src={getLogoPath(pool.asset)}
                  alt={assetSymbol}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-neutral">{assetSymbol}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-medium text-neutral-800">
              <div>≈ ${formatNumber(assetUsdValue, DECIMALS.USD)}</div>
            </div>
          </div>
        )}

        {/* Rune Input */}
        {(withdrawalType === WithdrawalType.SPLIT ||
          withdrawalType === WithdrawalType.ALL_RUNE) && (
          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <NumericFormat
                value={runeAmount}
                onValueChange={handleRuneValueChange}
                placeholder="0"
                className="flex-1 text-xl font-medium outline-none"
                thousandSeparator=","
                decimalScale={DECIMALS.ASSET}
                allowNegative={false}
              />
              <div className="flex items-center gap-2">
                <Image
                  src={getLogoPath("THOR.RUNE")}
                  alt="RUNE"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-neutral">RUNE</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-medium text-neutral-800">
              <div>≈ ${formatNumber(runeUsdValue, DECIMALS.USD)}</div>
            </div>
          </div>
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

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
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { twMerge } from "tailwind-merge";
import { parseAssetString } from "@/utils/chain";
import { PositionType } from "@/hooks/dataTransformers/positionsTransformer";
import { useLiquidityPositions } from "@/utils/PositionsContext";

interface RemoveLiquidityModalProps {
  pool: IPoolDetail;
  position: MemberPool;
  onClose: (transactionSubmitted: boolean) => void;
}

const DECIMALS = {
  PERCENTAGE: 2,
  USD: 2,
  ASSET: 6,
};

export default function RemoveLiquidityModal({
  pool,
  position,
  onClose,
}: RemoveLiquidityModalProps) {
  const { error: liquidityError, removeLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal, walletsState, getChainKeyFromChain } =
    useAppState();
  const [assetChain] = useMemo(
    () => parseAssetString(pool.asset),
    [pool.asset],
  );

  const { positions, markPositionAsPending } = useLiquidityPositions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [assetAmount, setAssetAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chainKey = getChainKeyFromChain(assetChain);
  const selectedWallet = walletsState![chainKey];
  const { assetAdded: positionAssetAmount } = getPositionDetails(position);
  const positionAssetUsdValue = new BigNumber(pool.assetPriceUSD)
    .times(positionAssetAmount)
    .decimalPlaces(DECIMALS.USD)
    .toNumber();

  const percentage = assetAmount
    ? new BigNumber(assetAmount)
        .div(positionAssetAmount)
        .times(100)
        .decimalPlaces(DECIMALS.PERCENTAGE)
        .toNumber()
    : 0;

  const usdValue = new BigNumber(assetAmount || 0)
    .times(pool.assetPriceUSD)
    .decimalPlaces(DECIMALS.USD)
    .toNumber();

  const handlePercentageClick = (percent: number) => {
    const amount = new BigNumber(positionAssetAmount)
      .times(percent)
      .div(100)
      .decimalPlaces(DECIMALS.ASSET)
      .toString();
    setAssetAmount(amount);
  };

  const handleValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
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
        percentage,
        address: selectedWallet.address,
      });

      if (hash) {
        markPositionAsPending(pool.asset, PositionType.SLP); // TODO: Update with support for SLP and DLP
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

  if (txHash && positions && positions[pool.asset][PositionType.SLP]) {
    // TODO: Update with support for SLP and DLP
    return (
      <TransactionConfirmationModal
        position={positions[pool.asset][PositionType.SLP]} // TODO: Update with support for SLP and DLP
        txHash={txHash}
        onClose={() => {
          setTxHash(null);
          onClose(true);
        }}
      />
    );
  }

  return (
    <Modal onClose={() => onClose(false)} title="Remove">
      <div className="p-2 w-m">
        {liquidityError && (
          <ErrorCard className="mb-4">{liquidityError}</ErrorCard>
        )}

        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <NumericFormat
              getInputRef={inputRef}
              value={assetAmount}
              onValueChange={handleValueChange}
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
            <div>≈ ${formatNumber(usdValue, DECIMALS.USD)}</div>
            <div>
              Balance:{" "}
              {formatNumber(
                positionAssetAmount,
                parseFloat(pool.nativeDecimal),
              )}{" "}
              ($
              {formatNumber(positionAssetUsdValue, DECIMALS.USD)})
            </div>
          </div>
        </div>

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

        <button
          onClick={handleRemoveLiquidity}
          disabled={isSubmitting}
          className="w-full bg-red text-white font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting Transaction..." : "Remove"}
        </button>
      </div>
    </Modal>
  );
}

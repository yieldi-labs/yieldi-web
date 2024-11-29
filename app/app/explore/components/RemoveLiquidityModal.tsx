import { useState, useRef } from "react";
import Image from "next/image";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail } from "@/midgard";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  formatNumber,
  MemberStats,
} from "@/app/utils";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { twMerge } from "tailwind-merge";

interface RemoveLiquidityModalProps {
  pool: IPoolDetail;
  memberStats: MemberStats;
  onClose: (transactionSubmitted: boolean) => void;
}

export default function RemoveLiquidityModal({
  pool,
  memberStats,
  onClose,
}: RemoveLiquidityModalProps) {
  const { wallet } = useAppState();
  const { error: liquidityError, removeLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal } = useAppState();

  const inputRef = useRef<HTMLInputElement>(null);
  const [percentage, setPercentage] = useState(0);
  const [assetAmount, setAssetAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePercentageClick = (percent: number) => {
    setPercentage(percent);
    const amount = (memberStats.current.totalAsAsset * percent) / 100;
    setAssetAmount(amount.toString());
  };

  const handleValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
    const amount = parseFloat(values.value);
    const percentage = (amount / memberStats.current.totalAsAsset) * 100;
    setPercentage(percentage);
  };

  const handleRemoveLiquidity = async () => {
    if (!wallet?.address) {
      toggleWalletModal();
      return;
    }

    try {
      setIsSubmitting(true);

      const hash = await removeLiquidity({
        asset: pool.asset,
        percentage,
        address: wallet.address,
      });

      if (hash) {
        setTimeout(() => {
          setTxHash(hash);
          onClose(true);
        }, 0);
      }
    } catch (err) {
      console.error("Failed to remove liquidity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = liquidityError;
  const assetSymbol = getAssetShortSymbol(pool.asset);
  const usdValue = parseFloat(assetAmount) * parseFloat(pool.assetPriceUSD);

  if (txHash) {
    return (
      <TransactionConfirmationModal
        txHash={txHash}
        onClose={() => {
          setTxHash(null);
          onClose(true);
        }}
      />
    );
  }

  return (
    <Modal onClose={() => onClose(false)}>
      <div className="p-2 w-m">
        {error && <ErrorCard className="mb-4">{error}</ErrorCard>}

        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <NumericFormat
              getInputRef={inputRef}
              value={assetAmount}
              onValueChange={handleValueChange}
              placeholder="0"
              className="flex-1 text-xl font-medium outline-none"
              thousandSeparator=","
              decimalScale={6}
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
            <div>≈ ${formatNumber(usdValue, 2)}</div>
            <div>
              Balance:{" "}
              {formatNumber(
                memberStats.current.totalAsAsset,
                parseFloat(pool.nativeDecimal),
              )}{" "}
              ($
              {formatNumber(memberStats.current.totalAssetUsdValue, 2)})
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
                percentage === percent
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
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting Transaction..." : "Remove"}
        </button>
      </div>
    </Modal>
  );
}

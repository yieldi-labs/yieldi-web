import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { NumericFormat } from "react-number-format";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail } from "@/midgard";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
  formatNumber,
} from "@/app/utils";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { useContracts } from "@/hooks/useContracts";
import { useUTXO } from "@/hooks/useUTXO";
import { formatUnits } from "viem";
import { twMerge } from "tailwind-merge";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: (transactionSubmitted: boolean) => void;
}

const MAX_BALANCE_PERCENTAGE = 0.9995; // 99.95%

export default function AddLiquidityModal({
  pool,
  onClose,
}: AddLiquidityModalProps) {
  const { wallet } = useAppState();
  const { error: liquidityError, addLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal } = useAppState();

  const [assetAmount, setAssetAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [assetBalance, setAssetBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utxoChain = useMemo(() => {
    const chain = pool.asset.split(".")[0].toLowerCase();
    if (chain === "btc") return "BTC";
    if (chain === "doge") return "DOGE";
    return null;
  }, [pool.asset]);

  if (!wallet?.provider) {
    throw new Error("Wallet provider not found, please connect your wallet.");
  }

  const {
    getBalance: getUTXOBalance,
    loading: utxoLoading,
    error: utxoError,
  } = useUTXO({
    chain: utxoChain as "BTC" | "DOGE",
    wallet: utxoChain ? wallet : null,
  });

  const poolViemAddress = !utxoChain
    ? pool.asset.split(".")[1].split("-")[1]
    : undefined;
  const tokenAddress =
    !utxoChain && isERC20(pool.asset)
      ? normalizeAddress(poolViemAddress!)
      : undefined;

  const {
    balance: tokenBalance,
    error: tokenError,
    loadMetadata,
  } = useContracts({
    tokenAddress,
    provider: !utxoChain ? wallet?.provider : undefined,
  });

  useEffect(() => {
    if (!utxoChain && wallet?.provider) {
      loadMetadata();
    }
  }, [utxoChain, wallet?.provider, loadMetadata]);

  useEffect(() => {
    if (utxoChain && wallet?.address) {
      setBalanceLoading(true);
      getUTXOBalance(wallet.address)
        .then((balance) => {
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(formatUnits(balanceBigInt, 8));
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    }
  }, [utxoChain, wallet?.address, getUTXOBalance]);

  useEffect(() => {
    if (!utxoChain && tokenBalance?.formatted) {
      setAssetBalance(Number(tokenBalance.formatted));
    }
  }, [utxoChain, tokenBalance]);

  const handleValueChange = (values: any) => {
    setAssetAmount(values.value);
  };

  const handlePercentageClick = (percentage: number) => {
    // If it's MAX (100%), use MAX_BALANCE_PERCENTAGE directly
    const finalPercentage = percentage === 1 ? MAX_BALANCE_PERCENTAGE : percentage;
    const maxAmount = assetBalance * finalPercentage;
    const newAmount = maxAmount.toFixed(8);
    setAssetAmount(newAmount);
  };

  const handleAddLiquidity = async () => {
    if (!wallet?.address) {
      toggleWalletModal();
      return;
    }

    const parsedAmount = parseFloat(assetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const hash = await addLiquidity({
        asset: pool.asset,
        amount: parsedAmount,
        address: wallet.address,
      });

      if (hash) {
        setTimeout(() => {
          setTxHash(hash);
          setShowConfirmation(true);
        }, 0);
      }
    } catch (err) {
      console.error("Failed to add liquidity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBalanceLoading = balanceLoading || utxoLoading;
  const error = liquidityError || tokenError || utxoError;
  const assetSymbol = getAssetShortSymbol(pool.asset);
  const usdValue = assetAmount
    ? parseFloat(pool.assetPriceUSD) * parseFloat(assetAmount)
    : 0;
  const assetUsdBalance = parseFloat(pool.assetPriceUSD) * assetBalance;

  const isValidAmount = useMemo(() => {
    if (!assetAmount || isNaN(parseFloat(assetAmount)) || parseFloat(assetAmount) <= 0) {
      return false;
    }
    return parseFloat(assetAmount) <= assetBalance * MAX_BALANCE_PERCENTAGE;
  }, [assetAmount, assetBalance]);

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );

  const currentAssetPercentage = useMemo(() => {
    if (!assetAmount || !assetBalance) return 0;
    return (parseFloat(assetAmount) / assetBalance) * 100;
  }, [assetAmount, assetBalance]);

  const isCloseToPercentage = (
    currentPercentage: number,
    targetPercentage: number,
  ) => {
    const tolerance = 0.01;
    return Math.abs(currentPercentage - targetPercentage) <= tolerance;
  };

  if (showConfirmation && txHash) {
    return (
      <TransactionConfirmationModal
        txHash={txHash}
        onClose={() => {
          setShowConfirmation(false);
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
              value={assetAmount}
              onValueChange={handleValueChange}
              placeholder="0"
              className="flex-1 text-xl font-medium outline-none"
              thousandSeparator=","
              decimalScale={8}
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
              Balance: {formatNumber(assetBalance, 6)} ($
              {formatNumber(assetUsdBalance, 2)})
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mb-6">
          {[25, 50, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handlePercentageClick(percent / 100)}
              className={percentageButtonClasses(
                isCloseToPercentage(currentAssetPercentage, percent),
              )}
              disabled={isBalanceLoading || isSubmitting}
            >
              {percent === 100 ? "MAX" : `${percent}%`}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddLiquidity}
          disabled={
            !isValidAmount ||
            isBalanceLoading ||
            isSubmitting
          }
          className="w-full bg-primary text-black font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!wallet?.address
            ? "Connect Wallet"
            : isBalanceLoading
              ? "Loading..."
              : isSubmitting
                ? "Submitting Transaction..."
                : !isValidAmount && assetAmount
                  ? "Amount exceeds balance"
                  : "Add"}
        </button>
      </div>
    </Modal>
  );
}
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
  formatNumber,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { useContracts } from "@/hooks/useContracts";
import { useUTXO } from "@/hooks/useUTXO";
import { formatUnits } from "viem";
import { twMerge } from "tailwind-merge";

import { parseAssetString } from "@/utils/chain";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: (transactionSubmitted: boolean) => void;
}

export default function AddLiquidityModal({
  pool,
  onClose,
}: AddLiquidityModalProps) {
  const { toggleWalletModal, getWallet } = useAppState();
  const { error: liquidityError, addLiquidity } = useLiquidityPosition({
    pool,
  });

  // Parse asset details
  const [assetChain] = useMemo(
    () => parseAssetString(pool.asset),
    [pool.asset]
  );
  const selectedWallet = getWallet(assetChain);
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

  const {
    getBalance: getUTXOBalance,
    loading: utxoLoading,
    error: utxoError,
  } = useUTXO({
    chain: utxoChain as "BTC" | "DOGE",
    wallet: utxoChain ? selectedWallet : null,
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
    provider: !utxoChain ? selectedWallet?.provider : undefined,
  });

  useEffect(() => {
    if (!utxoChain && selectedWallet?.provider) {
      loadMetadata();
    }
  }, [utxoChain, selectedWallet?.provider, loadMetadata]);

  useEffect(() => {
    if (utxoChain && selectedWallet?.address) {
      setBalanceLoading(true);
      getUTXOBalance(selectedWallet.address)
        .then((balance) => {
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(formatUnits(balanceBigInt, 8));
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    }
  }, [utxoChain, selectedWallet?.address, getUTXOBalance]);

  useEffect(() => {
    if (!utxoChain && tokenBalance?.formatted) {
      setAssetBalance(Number(tokenBalance.formatted));
    }
  }, [utxoChain, tokenBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (
      value === "" ||
      (!isNaN(parseFloat(value)) && parseFloat(value) <= assetBalance)
    ) {
      setAssetAmount(value);
    }
  };

  const handleAddLiquidity = async () => {
    if (!selectedWallet?.address) {
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
        address: selectedWallet.address,
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

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn"
    );

  const currentAssetPercentage = useMemo(() => {
    if (!assetAmount || !assetBalance) return 0;
    return (parseFloat(assetAmount) / assetBalance) * 100;
  }, [assetAmount, assetBalance]);

  const isCloseToPercentage = (
    currentPercentage: number,
    targetPercentage: number
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
  const handlePercentageClick = (percentage: number) => {
    const newAmount = (assetBalance * percentage).toFixed(8);
    setAssetAmount(newAmount);
  };
  return (
    <Modal onClose={() => onClose(false)}>
      <div className="p-2 w-m">
        {error && <ErrorCard className="mb-4">{error}</ErrorCard>}

        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={assetAmount}
              onChange={handleAmountChange}
              placeholder="0"
              className="flex-1 text-xl font-medium outline-none"
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
              {formatNumber(assetBalance, 6)} ($
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
                isCloseToPercentage(currentAssetPercentage, percent)
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
            !assetAmount ||
            parseFloat(assetAmount) <= 0 ||
            isBalanceLoading ||
            isSubmitting
          }
          className="w-full bg-primary text-black font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedWallet?.address
            ? "Connect Wallet"
            : isBalanceLoading
            ? "Loading..."
            : isSubmitting
            ? "Submitting Transaction..."
            : "Add"}
        </button>
      </div>
    </Modal>
  );
}

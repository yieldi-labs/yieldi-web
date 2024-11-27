import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail } from "@/midgard";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
  formatNumber,
  DECIMALS,
} from "@/app/utils";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { useContracts } from "@/hooks/useContracts";
import { useUTXO } from "@/hooks/useUTXO";
import { formatUnits } from "viem";
import { twMerge } from "tailwind-merge";
import { useRuneBalance, useWalletConnection } from "@/hooks";
import { useThorchain } from "@/hooks/useThorchain";
import { isEVMAddress } from "@/utils/chain";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: (transactionSubmitted: boolean) => void;
}

const MAX_BALANCE_PERCENTAGE = 0.99;

export default function AddLiquidityModal({
  pool,
  runePriceUSD,
  onClose,
}: AddLiquidityModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { wallet } = useAppState();
  const { error: liquidityError, addLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal } = useAppState();
  const { getNetworkAddressFromLocalStorage, hasThorAddressInLocalStorage } = useWalletConnection();

  const { runeBalance } = useRuneBalance({ wallet });
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [assetBalance, setAssetBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [poolNativeDecimal, setPoolNativeDecimal] = useState(0);
  const [isDualSided, setIsDualSided] = useState(false);

  const utxoChain = useMemo(() => {
    const chain = pool.asset.split(".")[0].toLowerCase();
    if (chain === "btc") return "BTC";
    if (chain === "doge") return "DOGE";
    return null;
  }, [pool.asset]);

  const assetMinimalUnit = useMemo(() => {
    return 1 / 10 ** poolNativeDecimal;
  }, [poolNativeDecimal]);

  const runeMinimalUnit = useMemo(() => {
    return 1 / 10 ** DECIMALS;
  }, []);

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

  const {
    getBalance: getThorchainBalance,
    loading: thorchainLoading,
    error: thorchainError,
  } = useThorchain({
    wallet: utxoChain ? null : wallet,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update pool native decimal
  useEffect(() => {
    setPoolNativeDecimal(parseInt(pool.nativeDecimal));
  }, [pool.nativeDecimal]);

  useEffect(() => {
    if (!utxoChain && wallet?.provider && isEVMAddress(wallet.address)) {
      loadMetadata();
    }
  }, [utxoChain, wallet?.provider, wallet?.address, loadMetadata, pool.asset]);

  useEffect(() => {
    if (utxoChain && wallet?.address) {
      setBalanceLoading(true);
      getUTXOBalance(wallet.address)
        .then((balance) => {
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(
            formatUnits(balanceBigInt, poolNativeDecimal),
          );
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    }
  }, [utxoChain, wallet?.address, getUTXOBalance, poolNativeDecimal]);

  useEffect(() => {
    if (!utxoChain && tokenBalance?.value) {
      setAssetBalance(
        Number(formatUnits(tokenBalance.value, tokenBalance.decimals)),
      );
    }
  }, [utxoChain, tokenBalance]);

  useEffect(() => {
    if (pool.asset.split(".")[0].toLowerCase() === "thor" && wallet?.address) {
      setBalanceLoading(true);
      getThorchainBalance(wallet.address)
        .then((balance) => {
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(
            formatUnits(balanceBigInt, poolNativeDecimal),
          );
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    }
  }, [wallet?.address, getThorchainBalance, poolNativeDecimal, pool.asset]);

  const handleValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
  };

  const handleRuneValueChange = (values: NumberFormatValues) => {
    setRuneAmount(values.value);
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
    if (runeBalance <= 0) return;

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
      const isRuneAmountValid = runeAmt > 0 && runeAmt <= runeMaxAllowed;
      // return isAssetAmountValid && isRuneAmountValid;
      // TODO: remove temp condition atfer Mutichain Wallet connection.
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

  const handleAddLiquidity = async () => {
    if (!wallet?.address) {
      toggleWalletModal();
      return;
    }

    const parsedAssetAmount = parseFloat(assetAmount);
    const parsedRuneAmount = isDualSided ? parseFloat(runeAmount) : undefined;

    if (
      isDualSided &&
      (!parsedRuneAmount || parsedRuneAmount <= 0) &&
      (!parsedAssetAmount || parsedAssetAmount <= 0)
    ) {
      throw new Error("Invalid RUNE amount.");
    }
    if (!isDualSided && (!parsedAssetAmount || parsedAssetAmount <= 0)) {
      throw new Error("Invalid asset amount.");
    }

    try {
      setIsSubmitting(true);

      let pairedAddress = undefined;
      if (parsedRuneAmount === 0 || Number.isNaN(parsedRuneAmount)) {
        pairedAddress = getNetworkAddressFromLocalStorage("thor") || undefined;
      } else if (parsedAssetAmount === 0 || Number.isNaN(parsedAssetAmount)) {
        const identifier = pool.asset.split(".")[0].toLowerCase();
        pairedAddress =
          getNetworkAddressFromLocalStorage(identifier) || undefined;
      }

      if (isDualSided && !pairedAddress) {
        throw new Error("Paired address not found.");
      }

      const hash = await addLiquidity({
        asset: pool.asset,
        amount: parsedAssetAmount,
        runeAmount: parsedRuneAmount,
        pairedAddress,
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

  const isBalanceLoading = balanceLoading || utxoLoading || thorchainLoading;
  const error = liquidityError || tokenError || utxoError || thorchainError;
  const assetSymbol = getAssetShortSymbol(pool.asset);
  const usdValue = assetAmount
    ? parseFloat(pool.assetPriceUSD) * parseFloat(assetAmount)
    : 0;
  const assetUsdBalance = parseFloat(pool.assetPriceUSD) * assetBalance;
  const runeUsdValue = runeAmount ? parseFloat(runeAmount) * runePriceUSD : 0;
  const runeUsdBalance = runeBalance * runePriceUSD;

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

        {/* Toggle between Single-sided and Dual-sided */}
        {hasThorAddressInLocalStorage() && (
          <div className="flex gap-4 mb-4">
            <div className="flex justify-between items-center flex-1 rounded-3xl border-2 border-neutral-50">
              <button
                className={twMerge(
                  "flex justify-center items-center gap-2 flex-1 py-2 rounded-3xl text-lg",
                  !isDualSided
                    ? "bg-neutral-50 text-neutral-800 shadow-toggle"
                    : "bg-transparent text-neutral-800 border border-transparent shadow-none",
                )}
                onClick={() => setIsDualSided(false)}
              >
                {assetSymbol}
              </button>
              <button
                className={twMerge(
                  "flex justify-center items-center gap-2 flex-1 py-2 rounded-3xl text-lg",
                  isDualSided
                    ? "bg-neutral-50 text-neutral-800 shadow-toggle"
                    : "bg-transparent text-neutral-800 border border-transparent shadow-none",
                )}
                onClick={() => setIsDualSided(true)}
              >
                {assetSymbol} + RUNE
              </button>
            </div>
          </div>
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
              decimalScale={poolNativeDecimal}
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
              onClick={() => handleAssetPercentageClick(percent / 100)}
              className={percentageButtonClasses(
                isCloseToPercentage(currentAssetPercentage, percent),
              )}
              disabled={isBalanceLoading || isSubmitting}
            >
              {percent === 100 ? "MAX" : `${percent}%`}
            </button>
          ))}
        </div>

        {/* RUNE Amount Input (Only if Dual-sided) */}
        {isDualSided && (
          <>
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <NumericFormat
                  value={runeAmount}
                  onValueChange={handleRuneValueChange}
                  placeholder="0"
                  className="flex-1 text-xl font-medium outline-none"
                  thousandSeparator=","
                  decimalScale={8}
                  allowNegative={false}
                />
                <div className="flex items-center gap-2">
                  <Image
                    src={getLogoPath("thor.rune")}
                    alt="RUNE"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-neutral">RUNE</span>
                </div>
              </div>
              <div className="flex justify-between text-base font-medium text-neutral-800">
                <div>≈ ${formatNumber(runeUsdValue, 2)}</div>
                <div>
                  Balance: {formatNumber(runeBalance, 6)} ($
                  {formatNumber(runeUsdBalance, 2)})
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mb-6">
              {[25, 50, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleRunePercentageClick(percent / 100)}
                  className={percentageButtonClasses(
                    isCloseToPercentage(currentRunePercentage, percent),
                  )}
                  disabled={isBalanceLoading || isSubmitting}
                >
                  {percent === 100 ? "MAX" : `${percent}%`}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleAddLiquidity}
          disabled={!isValidAmount || isBalanceLoading || isSubmitting}
          className="w-full bg-primary text-black font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!wallet?.address
            ? "Connect Wallet"
            : isBalanceLoading
              ? "Loading..."
              : isSubmitting
                ? "Submitting Transaction..."
                : !isValidAmount && assetAmount
                  ? "Invalid Amount"
                  : "Add"}
        </button>
      </div>
    </Modal>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
  formatNumber,
  DECIMALS,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { useContracts } from "@/hooks/useContracts";
import { useUTXO } from "@/hooks/useUTXO";
import { formatUnits } from "viem";
import { twMerge } from "tailwind-merge";
import { useRuneBalance, useWalletConnection } from "@/hooks";
import { isEVMAddress } from "@/utils/chain";

import { parseAssetString } from "@/utils/chain";
import { ProviderKey } from "@/utils/wallet/constants";

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
  const { error: liquidityError, addLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal, walletsState, getProviderTypeFromChain } =
    useAppState();
  const { getNetworkAddressFromLocalStorage, hasThorAddressInLocalStorage } =
    useWalletConnection();

  // Parse asset details
  const [assetChain] = useMemo(
    () => parseAssetString(pool.asset),
    [pool.asset]
  );
  const providerKey = getProviderTypeFromChain(assetChain);
  const selectedWallet = walletsState![providerKey];
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [assetBalance, setAssetBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDualSided, setIsDualSided] = useState(false);
  const {
    runeBalance,
    loading: runeBalanceLoading,
    error: runeBalanceError,
  } = useRuneBalance({ wallet: selectedWallet });

  const utxoChain = useMemo(() => {
    const chain = pool.asset.split(".")[0].toLowerCase();
    if (chain === "btc") return "BTC";
    if (chain === "doge") return "DOGE";
    return null;
  }, [pool.asset]);

  const poolNativeDecimal = parseInt(pool.nativeDecimal);
  const assetMinimalUnit = 1 / 10 ** poolNativeDecimal;
  const runeMinimalUnit = 1 / 10 ** DECIMALS;

  if (!selectedWallet?.provider) {
    throw new Error("Wallet provider not found, please connect your wallet.");
  }

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
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (
      !utxoChain &&
      selectedWallet?.provider &&
      isEVMAddress(selectedWallet.address)
    ) {
      loadMetadata();
    }
  }, [
    utxoChain,
    selectedWallet?.provider,
    selectedWallet?.address,
    loadMetadata,
    pool.asset,
  ]);

  useEffect(() => {
    if (utxoChain && selectedWallet?.address) {
      setBalanceLoading(true);
      getUTXOBalance(selectedWallet.address)
        .then((balance) => {
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(
            formatUnits(balanceBigInt, poolNativeDecimal)
          );
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    }
  }, [utxoChain, selectedWallet?.address, getUTXOBalance, poolNativeDecimal]);

  useEffect(() => {
    if (!utxoChain && tokenBalance?.value) {
      setAssetBalance(
        Number(formatUnits(tokenBalance.value, tokenBalance.decimals))
      );
    }
  }, [utxoChain, tokenBalance]);

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
    if (!selectedWallet?.address) {
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

      // If dual-sided, check if paired address is available on local storage
      // in the future this will be replaced by multi-chain wallet connection.
      let pairedAddress = undefined;
      if (isDualSided) {
        if (parsedRuneAmount === 0 || Number.isNaN(parsedRuneAmount)) {
          pairedAddress =
            getNetworkAddressFromLocalStorage(ProviderKey.THORCHAIN) ||
            undefined;
        } else if (parsedAssetAmount === 0 || Number.isNaN(parsedAssetAmount)) {
          const identifier = getProviderTypeFromChain(pool.asset.split(".")[0]);
          pairedAddress =
            getNetworkAddressFromLocalStorage(identifier) || undefined;
        }
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

  const isBalanceLoading = balanceLoading || utxoLoading || runeBalanceLoading;
  const error = liquidityError || tokenError || utxoError || runeBalanceError;
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
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn"
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
    targetPercentage: number
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
  const handlePercentageClick = (percentage: number) => {
    const newAmount = (assetBalance * percentage).toFixed(8);
    setAssetAmount(newAmount);
  };
  return (
    <Modal onClose={() => onClose(false)}>
      <div className="p-2 w-full">
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
                    : "bg-transparent text-neutral-800 border border-transparent shadow-none"
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
                    : "bg-transparent text-neutral-800 border border-transparent shadow-none"
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
                isCloseToPercentage(currentAssetPercentage, percent)
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
                    isCloseToPercentage(currentRunePercentage, percent)
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
          {!selectedWallet?.address
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

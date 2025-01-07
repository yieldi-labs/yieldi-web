import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  formatNumber,
  DECIMALS,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { useAppState } from "@/utils/contexts/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { twMerge } from "tailwind-merge";
import { getChainKeyFromChain, parseAssetString } from "@/utils/chain";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import {
  PositionStatus,
  PositionType,
} from "@/hooks/dataTransformers/positionsTransformer";
import { ChainKey } from "@/utils/wallet/constants";

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
  const {
    error: liquidityError,
    addLiquidity,
    getAssetWallet,
  } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal, walletsState, balanceList, isWalletConnected } =
    useAppState();

  const [assetChain] = parseAssetString(pool.asset);
  const chainKey = getChainKeyFromChain(assetChain);
  const selectedWallet = walletsState[chainKey] || null;
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [assetTxHash, setAssetTxHash] = useState<string | null>(null);
  const [runeTxHash, setRuneTxHash] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDualSided, setIsDualSided] = useState(false);

  const { positions, markPositionAsPending } = useLiquidityPositions();

  const poolNativeDecimal = parseInt(pool.nativeDecimal);
  const assetMinimalUnit = 1 / 10 ** poolNativeDecimal;
  const runeMinimalUnit = 1 / 10 ** DECIMALS;
  const runeBalance = useMemo(() => {
    if (!balanceList) return 0;
    return balanceList[ChainKey.THORCHAIN]["THOR.RUNE"].balance;
  }, [balanceList]);
  const assetBalance = useMemo(() => {
    if (!balanceList || !pool.asset) return 0;
    const chainKey = getChainKeyFromChain(pool.asset.split(".")[0]);
    return balanceList[chainKey][pool.asset].balance;
  }, [balanceList, pool.asset]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    if (balanceList![ChainKey.THORCHAIN]["THOR.RUNE"].balance <= 0) return;

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

      // If dual-sided, check if paired address is available in connected wallets
      let pairedAddress: string | undefined;

      if (isDualSided) {
        if (walletsState[ChainKey.THORCHAIN]) {
          pairedAddress = walletsState[ChainKey.THORCHAIN].address;
        } else {
          throw new Error("No paired wallet found.");
        }
      }

      if (parsedAssetAmount > 0) {
        const result = await addLiquidity({
          asset: pool.asset,
          amount: parsedAssetAmount,
          runeAmount: parsedRuneAmount,
          pairedAddress,
        });
        if (result) {
          setAssetTxHash(result);
          setShowConfirmation(true);
        } else {
          throw new Error("Failed to add asset liquidity.");
        }
      }

      if (isDualSided && parsedRuneAmount) {
        pairedAddress = getAssetWallet(pool.asset).address;
        const result = await addLiquidity({
          asset: "THOR.RUNE",
          amount: 0,
          pairedAddress,
          runeAmount: parsedRuneAmount,
        });
        if (result) {
          setRuneTxHash(result);
          setShowConfirmation(true);
        } else {
          throw new Error("Failed to add Rune liquidity.");
        }
      }

      markPositionAsPending(
        pool.asset,
        type,
        PositionStatus.LP_POSITION_DEPOSIT_PENDING,
      );
    } catch (err) {
      console.error("Failed to add liquidity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = liquidityError;
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

  const type = isDualSided ? PositionType.DLP : PositionType.SLP;
  if (
    showConfirmation &&
    (assetTxHash || runeTxHash) && // Changed condition
    positions &&
    positions[pool.asset][type]
  ) {
    const position = positions[pool.asset][type];
    return (
      <TransactionConfirmationModal
        position={position}
        assetHash={assetTxHash}
        runeHash={runeTxHash}
        onClose={() => {
          setShowConfirmation(false);
          setAssetTxHash(null);
          setRuneTxHash(null);
          onClose(true);
        }}
      />
    );
  }
  return (
    <Modal onClose={() => onClose(false)}>
      <div className="p-2 w-full">
        {error && <ErrorCard className="mb-4">{error}</ErrorCard>}

        {/* Toggle between Single-sided and Dual-sided */}
        {isWalletConnected(ChainKey.THORCHAIN) && (
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
              Balance: {formatNumber(assetBalance)} ($
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
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  {percent === 100 ? "MAX" : `${percent}%`}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleAddLiquidity}
          disabled={!isValidAmount || isSubmitting}
          className="w-full bg-primary text-black font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedWallet?.address
            ? "Connect Wallet"
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

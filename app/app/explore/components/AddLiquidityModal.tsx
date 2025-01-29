import { useEffect, useMemo, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  DECIMALS,
  disableDueTooSmallAmount,
} from "@/app/utils";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { useAppState } from "@/utils/contexts/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { twMerge } from "tailwind-merge";
import { getChainKeyFromChain } from "@/utils/chain";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import {
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { ChainKey } from "@/utils/wallet/constants";
import AssetInput from "./AssetInput";
import ToggleButtonGroup from "./ToggleButtonGroup";
import { Asset, assetFromString } from "@xchainjs/xchain-util";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: (transactionSubmitted: boolean) => void;
  initialType?: PositionType;
}

const MAX_BALANCE_PERCENTAGE = 0.99;
type InputChanging = "asset" | "rune";

export default function AddLiquidityModal({
  pool,
  runePriceUSD,
  onClose,
  initialType,
}: AddLiquidityModalProps) {
  const {
    error: liquidityError,
    addLiquidity,
    getAssetWallet,
  } = useLiquidityPosition({
    pool,
  });
  const {
    toggleWalletModal,
    walletsState,
    balanceList,
    isWalletConnected,
    mimirParameters,
  } = useAppState();

  const asset = assetFromString(pool.asset) as Asset;
  const chainKey = getChainKeyFromChain(asset.chain);
  const selectedWallet = walletsState[chainKey] || null;
  const [assetAmount, setAssetAmount] = useState("");
  const [runeAmount, setRuneAmount] = useState("");
  const [assetTxHash, setAssetTxHash] = useState<string | null>(null);
  const [runeTxHash, setRuneTxHash] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDualSided, setIsDualSided] = useState(
    initialType === PositionType.SYM,
  );
  const [inputChanging, setInputChanging] = useState<InputChanging>("asset");
  const { positions, markPositionAsPending } = useLiquidityPositions();
  const inputChangeConstraint = 0.01; // 1%

  const poolNativeDecimal = parseInt(pool.nativeDecimal);
  const assetMinimalUnit = 1 / 10 ** poolNativeDecimal;
  const runeMinimalUnit = 1 / 10 ** DECIMALS;
  const runeBalance = useMemo(() => {
    if (!balanceList) return 0;
    return balanceList[ChainKey.THORCHAIN]["THOR.RUNE"]?.balance;
  }, [balanceList]);
  const assetBalance = useMemo(() => {
    if (!balanceList || !pool.asset) return 0;
    const chainKey = getChainKeyFromChain(pool.asset.split(".")[0]);
    return balanceList[chainKey][pool.asset].balance;
  }, [balanceList, pool.asset]);

  useEffect(() => {
    if (assetAmount && inputChanging === "asset") {
      const newUsdValue =
        parseFloat(assetAmount) * parseFloat(pool.assetPriceUSD);
      const newRuneAmount = newUsdValue / runePriceUSD;
      // Prevents changing input value when focusing on the other input without changing the value
      if (
        Math.abs((newRuneAmount - parseFloat(runeAmount)) / newRuneAmount) >
        inputChangeConstraint
      ) {
        setRuneAmount(newRuneAmount.toFixed(6));
      }
    }
  }, [
    assetAmount,
    runeAmount,
    pool.assetPriceUSD,
    runePriceUSD,
    inputChanging,
  ]);

  useEffect(() => {
    if (runeAmount && inputChanging === "rune") {
      const newUsdValue = parseFloat(runeAmount) * runePriceUSD;
      const newAssetAmount = newUsdValue / parseFloat(pool.assetPriceUSD);
      // Prevents changing input value when focusing on the other input without changing the value
      if (
        Math.abs((newAssetAmount - parseFloat(assetAmount)) / newAssetAmount) >
        inputChangeConstraint
      ) {
        setAssetAmount(newAssetAmount.toFixed(poolNativeDecimal));
      }
    }
  }, [
    runeAmount,
    assetAmount,
    pool.assetPriceUSD,
    runePriceUSD,
    poolNativeDecimal,
    inputChanging,
  ]);

  const handleAssetValueChange = (values: NumberFormatValues) => {
    setAssetAmount(values.value);
  };

  const handleRuneValueChange = (values: NumberFormatValues) => {
    setRuneAmount(values.value);
  };

  const handleAssetPercentageClick = (percentage: number) => {
    if (assetBalance <= 0) return;
    setInputChanging("asset");

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
    setInputChanging("rune");

    const finalPercentage =
      percentage === 1 ? MAX_BALANCE_PERCENTAGE : percentage;
    const partialAmount = runeBalance * finalPercentage;
    const formattedAmount = (
      Number(partialAmount.toFixed(8)) - runeMinimalUnit
    ).toString();
    setRuneAmount(formattedAmount);
  };

  //The quick brown fox jumps over the lazy dog
  const isValidAmount = useMemo(() => {
    const amount = parseFloat(assetAmount);
    const maxAllowed = assetBalance * MAX_BALANCE_PERCENTAGE - assetMinimalUnit;
    const isAssetAmountValid = amount > 0 && amount <= maxAllowed;

    if (isDualSided) {
      const runeAmt = parseFloat(runeAmount);
      const runeMaxAllowed =
        runeBalance * MAX_BALANCE_PERCENTAGE - runeMinimalUnit;
      const assetMaxRuneEquivalent =
        maxAllowed * parseFloat(pool.assetPriceUSD);
      if (runeAmt > assetMaxRuneEquivalent) {
        return false;
      }

      const isRuneAmountValid = runeAmt > 0 && runeAmt <= runeMaxAllowed;
      return isAssetAmountValid || isRuneAmountValid;
    }

    return isAssetAmountValid;
  }, [
    assetAmount,
    assetBalance,
    assetMinimalUnit,
    isDualSided,
    runeAmount,
    runeBalance,
    runeMinimalUnit,
    pool.assetPriceUSD,
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
          assetDecimals: Number(pool.nativeDecimal),
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
          assetDecimals: Number(pool.nativeDecimal),
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

  const type = isDualSided ? PositionType.SYM : PositionType.ASYM;
  if (
    showConfirmation &&
    (assetTxHash || runeTxHash) && // Changed condition
    positions &&
    positions[pool.asset] &&
    positions[pool.asset][type]
  ) {
    const position = positions[pool.asset][type];
    if (!position) return null;
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

  const isDisableDueTooSmallAmount = disableDueTooSmallAmount(
    Number(mimirParameters?.MINIMUML1OUTBOUNDFEEUSD || 0),
    usdValue,
    runeUsdValue,
  );

  return (
    <Modal onClose={() => onClose(false)}>
      <div className="p-2 w-full">
        {error && <ErrorCard className="mb-4">{error}</ErrorCard>}

        {/* Toggle between Single-sided and Dual-sided */}
        {isWalletConnected(ChainKey.THORCHAIN) && !initialType && (
          <ToggleButtonGroup
            options={[
              { label: assetSymbol, value: false },
              { label: `${assetSymbol} + RUNE`, value: true },
            ]}
            selectedValue={isDualSided}
            onChange={setIsDualSided}
          />
        )}

        <AssetInput
          value={assetAmount}
          onValueChange={handleAssetValueChange}
          assetSymbol={assetSymbol}
          assetUsdValue={usdValue}
          logoPath={getLogoPath(pool.asset)}
          assetDecimalScale={6}
          usdDecimalScale={2}
          assetBalance={assetBalance}
          usdBalance={assetUsdBalance}
          onFocus={() => setInputChanging("asset")}
        />
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
            <AssetInput
              value={runeAmount}
              onValueChange={handleRuneValueChange}
              assetSymbol="RUNE"
              assetUsdValue={runeUsdValue}
              logoPath={getLogoPath("thor.rune")}
              assetDecimalScale={6}
              usdDecimalScale={2}
              assetBalance={runeBalance}
              usdBalance={runeUsdBalance}
              onFocus={() => setInputChanging("rune")}
            />
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
          disabled={
            !isValidAmount || isSubmitting || isDisableDueTooSmallAmount
          }
          className="w-full bg-primary text-black font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedWallet?.address
            ? "Connect Wallet"
            : isSubmitting
              ? "Submitting Transaction..."
              : !isValidAmount && assetAmount
                ? "Invalid Amount"
                : isDisableDueTooSmallAmount
                  ? "Small amount"
                  : "Add"}
        </button>
      </div>
    </Modal>
  );
}

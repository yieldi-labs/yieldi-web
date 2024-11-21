import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { Slider } from "@shared/components/ui";
import { twMerge } from "tailwind-merge";
import TransactionConfirmationModal from "./TransactionConfirmationModal";
import {
  getAssetShortSymbol,
  getLogoPath,
  getPercentage,
  isERC20,
  normalizeAddress,
} from "@/app/utils";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { useContracts } from "@/hooks/useContracts";
import { useRuneBalance } from "@/hooks";
import { useUTXO } from "@/hooks/useUTXO";
import { formatUnits } from "viem";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: (transactionSubmitted: boolean) => void;
}

export default function AddLiquidityModal({
  pool,
  runePriceUSD,
  onClose,
}: AddLiquidityModalProps) {
  const { wallet } = useAppState();
  const { error: liquidityError, addLiquidity } = useLiquidityPosition({
    pool,
  });
  const { toggleWalletModal } = useAppState();

  const {
    runeBalance,
    loading: runeLoading,
    error: runeError,
  } = useRuneBalance({
    wallet,
  });

  const [selectedTab] = useState("single");
  const [assetAmount, setAssetAmount] = useState(0);
  const [runeAmount, setRuneAmount] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [assetBalance, setAssetBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if this is a UTXO chain and which one
  const utxoChain = useMemo(() => {
    const chain = pool.asset.split(".")[0].toLowerCase();
    if (chain === "btc") return "BTC";
    if (chain === "doge") return "DOGE";
    return null;
  }, [pool.asset]);

  // Initialize UTXO hooks if needed
  if (!wallet?.provider)
    throw new Error("Wallet provider not found, please connect your wallet.");

  const {
    getBalance: getUTXOBalance,
    loading: utxoLoading,
    error: utxoError,
  } = useUTXO({
    chain: utxoChain as "BTC" | "DOGE",
    wallet: utxoChain ? wallet : null,
  });

  // Initialize contract hooks for EVM assets
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

  // Load token metadata for EVM assets
  useEffect(() => {
    if (!utxoChain && wallet?.provider) {
      loadMetadata();
    }
  }, [utxoChain, wallet?.provider, loadMetadata]);

  // Get UTXO balance if needed
  useEffect(() => {
    if (utxoChain && wallet?.address) {
      setBalanceLoading(true);
      getUTXOBalance(wallet.address)
        .then((balance) => {
          // Convert from base units
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(formatUnits(balanceBigInt, 8));
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setBalanceLoading(false));
    }
  }, [utxoChain, wallet?.address, getUTXOBalance]);

  // Update asset balance for EVM tokens
  useEffect(() => {
    if (!utxoChain && tokenBalance?.formatted) {
      setAssetBalance(Number(tokenBalance.formatted));
    }
  }, [utxoChain, tokenBalance]);

  const currentAssetPercentage = useMemo(() => {
    return getPercentage(assetAmount, assetBalance);
  }, [assetAmount, assetBalance]);

  const currentRunePercentage = useMemo(() => {
    return getPercentage(runeAmount, runeBalance);
  }, [runeAmount, runeBalance]);

  const isCloseToPercentage = (
    currentPercentage: number,
    targetPercentage: number,
  ) => {
    const tolerance = 0.01;
    return Math.abs(currentPercentage - targetPercentage) <= tolerance;
  };

  const handlePercentageClick = (
    percentage: number,
    isRune: boolean = false,
  ) => {
    if (isRune) {
      const newRuneAmount = runeBalance * (percentage / 100);
      setRuneAmount(newRuneAmount);
    } else {
      const newAssetAmount = assetBalance * (percentage / 100);
      setAssetAmount(newAssetAmount);
    }
  };

  const handleAddLiquidity = async () => {
    if (!wallet?.address) {
      toggleWalletModal();
      return;
    }

    if (assetAmount <= 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const hash = await addLiquidity({
        asset: pool.asset,
        amount: assetAmount,
        runeAmount: selectedTab === "double" ? runeAmount : undefined,
        address: wallet.address,
      });

      if (hash) {
        setTxHash(hash);
      }
      setShowConfirmation(true);
    } catch (err) {
      console.error("Failed to add liquidity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose(false);
  };

  const isBalanceLoading = balanceLoading || utxoLoading || runeLoading;
  const error = liquidityError || tokenError || runeError || utxoError;

  const getButtonText = () => {
    if (!wallet?.address) return "Connect Wallet";
    if (isBalanceLoading) return "Loading...";
    if (isSubmitting) return "Submitting Transaction...";
    return "Add Liquidity";
  };

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );

  if (showConfirmation && txHash) {
    return (
      <TransactionConfirmationModal
        txHash={txHash}
        onClose={handleConfirmationClose}
      />
    );
  }

  return (
    <Modal
      onClose={() => {
        onClose(true);
      }}
      style={{ backgroundColor: "#F5F6F6", maxWidth: "36rem" }}
    >
      <div className="p-6">
        {error && <ErrorCard className="mb-4">{error}</ErrorCard>}

        {/* Asset Input Section */}
        <div>
          <div className="flex items-center justify-between mb-4 text-neutral text-2xl font-medium">
            <div className="flex items-center">
              <Image
                src={getLogoPath(pool.asset)}
                alt={getAssetShortSymbol(pool.asset)}
                width={42}
                height={42}
                className="mr-3"
              />
              <span className="font-gt-america-ext">
                {getAssetShortSymbol(pool.asset)}: {assetBalance.toFixed(6)}
              </span>
            </div>
            <div>
              {assetAmount.toPrecision(6)} ($
              {(parseFloat(pool.assetPriceUSD) * assetAmount).toFixed(2)})
            </div>
          </div>

          <div className="relative mb-6">
            <Slider
              value={assetAmount}
              max={assetBalance}
              onChange={setAssetAmount}
            />
          </div>

          <div className="flex justify-end gap-2">
            {[25, 50, 100].map((percent) => (
              <button
                key={percent}
                className={percentageButtonClasses(
                  isCloseToPercentage(currentAssetPercentage, percent),
                )}
                onClick={() => handlePercentageClick(percent)}
                disabled={isBalanceLoading || isSubmitting}
              >
                {percent === 100 ? "MAX" : `${percent}%`}
              </button>
            ))}
          </div>
        </div>

        {/* RUNE Input Section - only show for double-sided liquidity */}
        {selectedTab === "double" && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 text-neutral text-2xl font-medium">
              <div className="flex items-center">
                <Image
                  src={getLogoPath("thor.rune")}
                  alt="RUNE"
                  width={42}
                  height={42}
                  className="mr-3"
                />
                <span className="font-gt-america-ext">
                  RUNE: {runeBalance.toFixed(6)}
                </span>
              </div>
              <div>
                {runeAmount.toFixed(6)} ($
                {(runeAmount * runePriceUSD).toFixed(2)})
              </div>
            </div>

            <div className="relative mb-4">
              <Slider
                value={runeAmount}
                max={runeBalance}
                onChange={setRuneAmount}
              />
            </div>

            <div className="flex justify-end gap-2">
              {[25, 50, 100].map((percent) => (
                <button
                  key={percent}
                  className={percentageButtonClasses(
                    isCloseToPercentage(currentRunePercentage, percent),
                  )}
                  onClick={() => handlePercentageClick(percent, true)}
                  disabled={isBalanceLoading || isSubmitting}
                >
                  {percent === 100 ? "MAX" : `${percent}%`}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8 hover:opacity-50 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddLiquidity}
          disabled={
            !wallet?.address ||
            isBalanceLoading ||
            isSubmitting ||
            assetAmount <= 0
          }
        >
          {getButtonText()}
        </button>
      </div>
    </Modal>
  );
}

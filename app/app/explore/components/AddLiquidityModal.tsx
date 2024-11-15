import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/app/button";
import Modal from "@/app/modal";
import { PoolDetail as IPoolDetail } from "@/midgard";
import { Slider } from "@shared/components/ui";
import { twMerge } from "tailwind-merge";
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
import { useDoge } from "@/hooks/useDoge";
import { formatUnits } from "viem";

interface AddLiquidityModalProps {
  pool: IPoolDetail;
  runePriceUSD: number;
  onClose: () => void;
}

export default function AddLiquidityModal({
  pool,
  runePriceUSD,
  onClose,
}: AddLiquidityModalProps) {
  const { wallet } = useAppState();
  const {
    loading: liquidityLoading,
    error: liquidityError,
    addLiquidity,
  } = useLiquidityPosition({ pool });
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
  const [loading, setLoading] = useState(false);

  // Determine if this is a DOGE pool
  const isDogePool = useMemo(() => {
    return pool.asset.split(".")[0].toLowerCase() === "doge";
  }, [pool.asset]);

  // Initialize DOGE hooks if needed
  if (!wallet?.provider)
    throw new Error("Wallet provider not found, please connect your wallet.");
  const {
    getBalance: getDogeBalance,
    loading: dogeLoading,
    error: dogeError,
  } = useDoge({ wallet });

  // Initialize contract hooks for EVM assets
  const poolViemAddress = !isDogePool
    ? pool.asset.split(".")[1].split("-")[1]
    : undefined;
  const tokenAddress =
    !isDogePool && isERC20(pool.asset)
      ? normalizeAddress(poolViemAddress!)
      : undefined;

  const {
    balance: tokenBalance,
    error: tokenError,
    loadMetadata,
  } = useContracts({
    tokenAddress,
    provider: !isDogePool ? wallet?.provider : undefined,
  });

  // Load token metadata for EVM assets
  useEffect(() => {
    if (!isDogePool && wallet?.provider) {
      loadMetadata();
    }
  }, [isDogePool, wallet?.provider, loadMetadata]);

  // Get DOGE balance if needed
  useEffect(() => {
    if (isDogePool && wallet?.address) {
      setLoading(true);
      getDogeBalance(wallet.address)
        .then((balance) => {
          // Convert from base units to DOGE
          const balanceAmount = balance.amount.amount();
          const balanceBigInt = BigInt(balanceAmount.toString());
          const formattedBalance = Number(formatUnits(balanceBigInt, 8));
          setAssetBalance(formattedBalance);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isDogePool, wallet?.address, getDogeBalance]);

  // Update asset balance for EVM tokens
  useEffect(() => {
    if (!isDogePool && tokenBalance?.formatted) {
      setAssetBalance(Number(tokenBalance.formatted));
    }
  }, [isDogePool, tokenBalance]);

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
      setLoading(true);
      const hash = await addLiquidity({
        asset: pool.asset,
        amount: assetAmount,
        runeAmount: selectedTab === "double" ? runeAmount : undefined,
        address: wallet.address,
      });

      setTxHash(hash);
      if (hash) {
        onClose();
      }
    } catch (err) {
      console.error("Failed to add liquidity:", err);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || liquidityLoading || runeLoading || dogeLoading;
  const error = liquidityError || tokenError || runeError || dogeError;

  const percentageButtonClasses = (isActive: boolean) =>
    twMerge(
      "px-6 py-2 rounded-full font-medium transition-colors",
      isActive ? "bg-secondaryBtn text-white" : "bg-white text-secondaryBtn",
    );

  return (
    <Modal
      onClose={onClose}
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
                disabled={isLoading}
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
                >
                  {percent === 100 ? "MAX" : `${percent}%`}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8"
          onClick={handleAddLiquidity}
          disabled={!wallet?.address || isLoading || assetAmount <= 0}
        >
          {!wallet?.address
            ? "Connect Wallet"
            : isLoading
              ? "Adding Liquidity..."
              : "Add Liquidity"}
        </Button>

        {txHash && (
          <div className="mt-4 text-sm text-center text-gray-600">
            Transaction submitted: {txHash}
          </div>
        )}
      </div>
    </Modal>
  );
}

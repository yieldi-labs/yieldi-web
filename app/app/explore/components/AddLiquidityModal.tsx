import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/app/button";
import Modal from "@/app/modal";
import { Balance, getBalance, PoolDetail as IPoolDetail } from "@/midgard";
import { Slider } from "@shared/components/ui";
import { twMerge } from "tailwind-merge";
import {
  getAssetShortSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
} from "@/app/utils";
import { useAppState } from "@/utils/context";
import { useLiquidityPosition } from "@/hooks/useLiquidityPosition";
import ErrorCard from "@/app/errorCard";
import { useContracts } from "@/hooks/useContracts";

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
  const { loading, error, addLiquidity } = useLiquidityPosition({ pool });
  const [selectedTab] = useState("single");
  const [assetAmount, setAssetAmount] = useState(0);
  const [runeAmount, setRuneAmount] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Initialize contract hooks
  const poolViemAddress = pool.asset.split(".")[1].split("-")[1];
  const tokenAddress = isERC20(pool.asset)
    ? normalizeAddress(poolViemAddress)
    : undefined; // Set to undefined for non-ERC20 assets

  // Use useContracts for ERC20 interaction
  const {
    balance: tokenBalance,
    error: tokenError,
    loadMetadata,
  } = useContracts({
    tokenAddress,
    provider: wallet?.provider,
  });

  // Load token metadata on mount
  useEffect(() => {
    if (wallet?.provider) {
      loadMetadata();
    }
  }, [wallet?.provider, loadMetadata]);

  const getPercentage = (amount: number, max: number) => {
    return max > 0 ? (amount / max) * 100 : 0;
  };

  const [runeBalance, setRuneBalance] = useState(0);
  const getRuneBalance = useCallback(async () => {
    if (!wallet?.address) return;
    const { data: runeBalance } = await getBalance({
      path: {
        address: wallet.address,
      },
    });
    return runeBalance;
  }, [wallet]);

  // Fetch RUNE balance on mount and every 10 seconds
  useEffect(() => {
    const fetchRuneBalance = async () => {
      const balance: Balance | undefined = await getRuneBalance();
      const amountStr: string = balance?.coins[0]?.amount || "0";
      setRuneBalance(parseInt(amountStr));
    };

    fetchRuneBalance();
    const intervalId = setInterval(fetchRuneBalance, 10000);
    return () => clearInterval(intervalId);
  }, [getRuneBalance]);

  // Get formatted asset balance from tokenBalance
  const assetBalance = useMemo(() => {
    if (!tokenBalance?.formatted) return 0;
    return Number(tokenBalance.formatted);
  }, [tokenBalance]);

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
      alert("Please connect your wallet first");
      return;
    }

    if (assetAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
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
    }
  };

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
        {(error || tokenError) && (
          <ErrorCard className="mb-4">{error || tokenError}</ErrorCard>
        )}

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
                {getAssetShortSymbol(pool.asset)} Balance:{" "}
                {isERC20(pool.asset) ? assetBalance.toFixed(6) : "N/A"}
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
              >
                {percent === 100 ? "MAX" : `${percent}%`}
              </button>
            ))}
          </div>
        </div>

        {/* RUNE Input Section */}
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
                  RUNE Balance: {runeBalance.toFixed(6)}
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
          disabled={loading || assetAmount <= 0}
        >
          {loading ? "Adding Liquidity..." : "Add Liquidity"}
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

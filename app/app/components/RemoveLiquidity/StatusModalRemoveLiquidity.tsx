import { addDollarSignAndSuffix, getLogoPath } from "@/app/utils";
import { PoolDetail } from "@/midgard";
import {
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { AssetAmount, assetFromString } from "@xchainjs/xchain-util";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppState } from "@/utils/contexts/context";
import {
  LpSubstepsRemoveLiquidity,
  useLiquidityPosition,
} from "@/hooks/useLiquidityPosition";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import { showToast, ToastType } from "@/app/errorToast";
import { getChainKeyFromChain } from "@/utils/chain";
import { WithdrawalType } from "@/utils/fees";
import LpSubstepDetail, { LpSubstepsStatus } from "@/app/components/LpSubstepDetail";

export interface StatusModalRemoveLiquidityStepData {
  pool: PoolDetail;
  assetAmount: AssetAmount;
  assetUsdAmount: number;
  runeAmount: AssetAmount;
  runeUsdAmount: number;
  positionType: PositionType;
  requiredSteps: LpSubstepsRemoveLiquidity[];
  percentage: number;
  withdrawalType: WithdrawalType;
}

export interface ConfirmStepData {
  assetHash: string | null;
  runeHash: string | null;
  pool: PoolDetail;
  positionType: PositionType;
}

export default function StatusModal({
  stepData,
  onClose,
  nextStep,
}: {
  stepData: StatusModalRemoveLiquidityStepData;
  onClose: () => void;
  nextStep: (stepData: ConfirmStepData) => void;
}) {
  const { positionType, pool, percentage, withdrawalType, assetAmount, assetUsdAmount, runeAmount, runeUsdAmount, requiredSteps } = stepData;
  const { removeLiquidity } = useLiquidityPosition({
    pool,
  });

  const { markPositionAsPending } = useLiquidityPositions();

  const [assetTxHash, setAssetTxHash] = useState<string | null>(null);
  const [runeTxHash, setRuneTxHash] = useState<string | null>(null);

  const isInProgress = useRef(false);

  const [stepStatus, setStepStatus] = useState(
    requiredSteps.map((step) => ({
      step: step,
      status: LpSubstepsStatus.INACTIVE,
    }))
  );

  const { walletsState } = useAppState();

  const asset = assetFromString(pool.asset);
  if (!asset) {
    throw Error(`Invalid asset ${pool.asset}`);
  }

  const chainKey = getChainKeyFromChain(asset?.chain || "");
  const selectedWallet = walletsState![chainKey];

  const isDualSided = positionType === PositionType.SYM;

  const logoAsset = getLogoPath(pool.asset);
  const logoRune = getLogoPath("THOR.RUNE");

  useEffect(() => {
    if (stepStatus.every((step) => step.status === LpSubstepsStatus.SUCCESS)) {
      markPositionAsPending(
        pool.asset,
        positionType,
        PositionStatus.LP_POSITION_WITHDRAWAL_PENDING
      );
      nextStep({
        assetHash: assetTxHash,
        runeHash: runeTxHash,
        pool: pool,
        positionType: positionType,
      });
    }
  }, [assetTxHash, markPositionAsPending, nextStep, pool, positionType, runeTxHash, stepData, stepStatus]);

  useEffect(() => {
    if (isInProgress.current) return;
    isInProgress.current = true;

    const executeLiquidityRemove = async () => {

      setStepStatus((prev) => {
        const firstStep = prev[0].step;
        return prev.map((step) => {
          if (step.step === firstStep) {
            return {
              ...step,
              status: LpSubstepsStatus.PENDING,
            };
          }
          return step;
        });
      });

      const assetId =
        positionType === PositionType.ASYM ? pool.asset : "THOR.RUNE";
      
        await removeLiquidity({
        assetIdToStartAction: assetId,
        percentage,
        withdrawAsset:
          withdrawalType === WithdrawalType.ALL_ASSET
            ? pool.asset
            : withdrawalType === WithdrawalType.ALL_RUNE
            ? "THOR.RUNE"
            : undefined,
          emitError: (error) => {
            showToast({ text: error, type: ToastType.ERROR });
            setStepStatus((prev) => {
              return prev.map((step) => {
                if (step.status === LpSubstepsStatus.PENDING) {
                  return {
                    ...step,
                    status: LpSubstepsStatus.INACTIVE,
                  };
                }
                return step;
              });
            });
          },
          emitNewHash: (hash, stepToUpdate) => {
            if (stepToUpdate === LpSubstepsRemoveLiquidity.BROADCAST_DEPOSIT_ASSET) {
              setAssetTxHash(hash);
            } else {
              setRuneTxHash(hash);
            }
            setStepStatus((prev) => {
              return prev.map((step) => {
                if (step.step === stepToUpdate) {
                  return {
                    ...step,
                    status: LpSubstepsStatus.SUCCESS,
                  };
                }
                return step;
              });
            });
          },
      });
    };

    executeLiquidityRemove()
  }, [
    isDualSided,
    markPositionAsPending,
    onClose,
    percentage,
    pool.asset,
    positionType,
    removeLiquidity,
    selectedWallet.address,
    stepData,
    walletsState,
    withdrawalType,
  ]);

  return (
    <>
      <div className="max-w-[520px]">
        <div className="px-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-medium">Deposit</span>
            <span className="text-gray-900 font-semibold text-lg">
              {addDollarSignAndSuffix(
                isDualSided
                  ? runeUsdAmount + assetUsdAmount
                  : assetUsdAmount
              )}
            </span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="block text-gray-600 font-medium mb-3">Tokens</span>
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <Image
                      src={logoAsset}
                      alt={`${asset.symbol} logo`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900">
                      {asset.ticker.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {assetAmount.amount().toFixed(6)} (
                  {addDollarSignAndSuffix(assetUsdAmount)})
                </span>
              </div>
              {isDualSided && (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8">
                      <Image
                        src={logoRune}
                        alt={`${asset.ticker} logo`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">
                        RUNE
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {runeAmount.amount().toFixed(6)} (
                    {addDollarSignAndSuffix(runeUsdAmount)})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {stepStatus.map((stepStatus, index) => (
              <LpSubstepDetail
                key={index}
                step={stepStatus.step}
                status={stepStatus.status}
                symbol={asset.ticker}
              />
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500 text-center">
          {`You will be prompted to confirm transactions on your wallet.
            Ensure your wallet is connected in the correct network and has sufficient funds for this
            transaction.`}
        </div>
      </div>
    </>
  );
}

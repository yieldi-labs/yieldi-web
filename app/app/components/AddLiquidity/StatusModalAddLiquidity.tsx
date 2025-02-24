import { addDollarSignAndSuffix, getLogoPath } from "@/app/utils";
import { PoolDetail } from "@/midgard";
import {
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { Asset, AssetAmount, assetFromString } from "@xchainjs/xchain-util";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppState } from "@/utils/contexts/context";
import { ChainKey } from "@/utils/wallet/constants";
import {
  LpSubstepsAddLiquidity,
  useLiquidityPosition,
} from "@/hooks/useLiquidityPosition";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import LpSubstepDetail, { LpSubstepsStatus } from "../LpSubstepDetail";
import { Warn } from "@shared/components/ui";
import { showToast, ToastType } from "@/app/errorToast";
import { WarnType } from "@shared/components/ui/Warn";

export interface StatusStepData {
  pool: PoolDetail;
  assetAmount: AssetAmount;
  assetUsdAmount: number;
  runeAmount: AssetAmount;
  runeUsdAmount: number;
  positionType: PositionType;
  requiredSteps: LpSubstepsAddLiquidity[];
  position: PositionStats | null;
}

export interface ConfirmStepData {
  assetHash: string | null;
  runeHash: string | null;
  pool: PoolDetail;
  positionType: PositionType;
}

export default function StatusModalAddLiquidity({
  stepData,
  onClose,
  nextStep,
}: {
  stepData: StatusStepData;
  onClose: () => void;
  nextStep: (stepData: ConfirmStepData) => void;
}) {
  const { addLiquidity, getAssetWallet } = useLiquidityPosition({
    pool: stepData.pool,
  });

  const { markPositionAsPending } = useLiquidityPositions();

  const [assetTxHash, setAssetTxHash] = useState<string | null>(null);
  const [runeTxHash, setRuneTxHash] = useState<string | null>(null);
  const [requiredWalletsSymbol, setRequiredWalletsSymbol] = useState<
    string[] | undefined
  >([]);

  const [invalidWalletNotice, setInvalidWalletNotice] = useState<string | null>(
    null,
  );

  const isInProgress = useRef(false);

  const [stepStatus, setStepStatus] = useState(
    stepData.requiredSteps.map((step) => ({
      step: step,
      status: LpSubstepsStatus.INACTIVE,
    })),
  );

  const { walletsState } = useAppState();

  const asset = assetFromString(stepData.pool.asset) as Asset; // Todo: Pass as step data
  const isDualSided = stepData.positionType === PositionType.SYM;

  const logoAsset = getLogoPath(stepData.pool.asset);
  const logoRune = getLogoPath("THOR.RUNE");

  useEffect(() => {
    if (stepStatus.every((step) => step.status === LpSubstepsStatus.SUCCESS)) {
      markPositionAsPending(
        stepData.pool.asset,
        stepData.positionType,
        PositionStatus.LP_POSITION_DEPOSIT_PENDING,
      );
      nextStep({
        assetHash: assetTxHash,
        runeHash: runeTxHash,
        pool: stepData.pool,
        positionType: stepData.positionType,
      });
    }
  }, [
    assetTxHash,
    markPositionAsPending,
    nextStep,
    runeTxHash,
    stepData,
    stepStatus,
  ]);

  useEffect(() => {
    if (isInProgress.current) return;
    isInProgress.current = true;

    const parsedAssetAmount = stepData.assetAmount.amount().toNumber();
    const parsedRuneAmount = stepData.runeAmount.amount().toNumber();

    const executeLiquidityAddition = async () => {
      let pairedRuneAddress: string | undefined;

      if (isDualSided) {
        pairedRuneAddress = stepData.position?.memberDetails?.runeAddress;
        if (walletsState[ChainKey.THORCHAIN] && !stepData.position) {
          pairedRuneAddress = walletsState[ChainKey.THORCHAIN].address;
        }
        if (!pairedRuneAddress) {
          throw Error("Unable to find paired address for RUNE");
        }
      }

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

      let hashAssetDeposit = null;
      if (parsedAssetAmount > 0) {
        const assetWallet = getAssetWallet(stepData.pool.asset);
        if (
          stepData.position?.memberDetails?.assetAddress.toLowerCase() !==
          assetWallet.address.toLowerCase()
        ) {
          setInvalidWalletNotice(
            `You are trying to complete this position from an incorrect wallet. Please connect the correct wallet: ${stepData.position?.memberDetails?.assetAddress}`,
          );
          setStepStatus((prev) => {
            return prev.map((step) => ({
              ...step,
              status: LpSubstepsStatus.INACTIVE,
            }));
          });
          return;
        }

        hashAssetDeposit = await addLiquidity({
          asset: stepData.pool.asset,
          assetDecimals: Number(stepData.pool.nativeDecimal),
          amount: parsedAssetAmount,
          runeAmount: parsedRuneAmount,
          pairedAddress: pairedRuneAddress,
          emitError: (error) => {
            showToast({ text: error, type: ToastType.ERROR });
            setStepStatus((prev) => {
              return prev.map((step) => {
                if (step.status === LpSubstepsStatus.PENDING) {
                  return {
                    ...step,
                    status: LpSubstepsStatus.FAILED,
                  };
                }
                return step;
              });
            });
          },
          emitNewHash: (hash, stepToUpdate) => {
            setAssetTxHash(hash);
            setStepStatus((prev) => {
              let updatedStepIndex = -2;
              return prev.map((step, index) => {
                if (index === updatedStepIndex + 1) {
                  return {
                    ...prev[index],
                    status: LpSubstepsStatus.PENDING,
                  };
                }
                if (step.step === stepToUpdate) {
                  updatedStepIndex = index;
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
      }

      if (
        isDualSided &&
        parsedRuneAmount > 0 &&
        (hashAssetDeposit || parsedAssetAmount <= 0)
      ) {
        const runeWallet = getAssetWallet("THOR.RUNE");
        if (
          stepData.position?.memberDetails?.runeAddress.toLowerCase() !==
          runeWallet.address.toLowerCase()
        ) {
          setInvalidWalletNotice(
            `You are trying to complete this position from an incorrect wallet. Please connect the correct wallet: ${stepData.position?.memberDetails?.runeAddress}`,
          );
          setStepStatus((prev) => {
            return prev.map((step) => ({
              ...step,
              status: LpSubstepsStatus.INACTIVE,
            }));
          });
          return;
        }
        const pairedAssetAddress =
          stepData.position?.memberDetails?.assetAddress ||
          getAssetWallet(stepData.pool.asset).address;
        await addLiquidity({
          asset: "THOR.RUNE",
          assetDecimals: Number(stepData.pool.nativeDecimal),
          amount: 0,
          pairedAddress: pairedAssetAddress,
          runeAmount: parsedRuneAmount,
          emitError: (error) => {
            showToast({ text: error, type: ToastType.ERROR });
            setStepStatus((prev) => {
              return prev.map((step) => {
                if (step.status === LpSubstepsStatus.PENDING) {
                  return {
                    ...step,
                    status: LpSubstepsStatus.FAILED,
                  };
                }
                return step;
              });
            });
          },
          emitNewHash: (hash, stepToUpdate) => {
            setRuneTxHash(hash);
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
      }
    };

    let missingWallets: string[] = [];
    const assetWallet = getAssetWallet(stepData.pool.asset);
    const runeWallet = getAssetWallet("THOR.RUNE");

    if (parsedAssetAmount > 0 && !assetWallet) {
      missingWallets.push(
        assetFromString(stepData.pool.asset)?.ticker as string,
      );
    }

    if (isDualSided && parsedRuneAmount > 0 && !runeWallet) {
      missingWallets.push(assetFromString("THOR.RUNE")?.ticker as string);
    }

    if (missingWallets.length === 0) {
      executeLiquidityAddition();
    }
    setRequiredWalletsSymbol(missingWallets);
  }, [
    addLiquidity,
    getAssetWallet,
    isDualSided,
    onClose,
    stepData,
    walletsState,
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
                  ? stepData.runeUsdAmount + stepData.assetUsdAmount
                  : stepData.assetUsdAmount,
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
                  {stepData.assetAmount.amount().toFixed(6)} (
                  {addDollarSignAndSuffix(stepData.assetUsdAmount)})
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
                    {stepData.runeAmount.amount().toFixed(6)} (
                    {addDollarSignAndSuffix(stepData.runeUsdAmount)})
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

        {requiredWalletsSymbol?.length ? (
          <div>
            <Warn
              text={`Connect your ${requiredWalletsSymbol.join(
                " ",
              )} wallet to continue.`}
            />
          </div>
        ) : null}

        {invalidWalletNotice ? (
          <div>
            <Warn type={WarnType.ERROR} text={invalidWalletNotice} />
          </div>
        ) : null}

        {!invalidWalletNotice && !requiredWalletsSymbol?.length && (
          <div className="text-sm text-gray-500 text-center pt-4">
            {`You will be prompted to confirm transactions on your wallet.
              Ensure your wallet is connected in the correct network and has sufficient funds for this
              transaction.`}
          </div>
        )}
      </div>
    </>
  );
}

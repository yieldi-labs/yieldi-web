"use client";

import { useEffect, useState } from "react";
import { addDollarSignAndSuffix } from "../utils";
import DashboardHighlightsCard from "./components/DashboardHighlightsCards";
import PositionsList from "./components/PositionsList";
import { PoolDetail } from "@/midgard";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import Loader from "../components/Loader";
import RemoveLiquidityModal from "../explore/components/RemoveLiquidityModal";
import Image from "next/image";
import {
  Positions,
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import AddLiquidityManager, {
  LpSteps,
} from "../explore/components/AddLiquidityManager";
import { StatusStepData } from "../explore/components/StatusModal";
import { baseAmount, baseToAsset } from "@xchainjs/xchain-util";
import { LpSubstepsAddLiquidity } from "@/hooks/useLiquidityPosition";
import { AddLiquidityStepData } from "../explore/components/AddLiquidityModal";
import { useAppState } from "@/utils/contexts/context";
import { Tooltip } from "@shared/components/ui";
import { showToast, ToastType } from "../errorToast";
import { getAddressUrl } from "@/utils/wallet/utils";
import Input from "../input";
import Button from "../button";
import { ChainKey } from "@/utils/wallet/constants";
import { usePositionStats } from "@/hooks/usePositionStats";

const allChainKeys = Object.values(ChainKey).filter(
  (value) => typeof value === 'string'
) as ChainKey[];

console.log('allChainKeys', allChainKeys)

export default function DashboardView() {
  const [addLiquidityProcessState, setAddLiquidityProcessState] = useState<{
    initialStep: LpSteps;
    stepData: StatusStepData | AddLiquidityStepData | null;
  }>({
    initialStep: LpSteps.SELECT_OPTIONS,
    stepData: null,
  });
  const [addressInSearch, setAddressInSearch] = useState("");
  const [selectedPool, setSelectedPool] = useState<PoolDetail | null>(null);
  const [selectedPosition, setSelectedPosition] =
    useState<PositionStats | null>(null);
  const [showRemoveLiquidityModal, setShowRemoveLiquidityModal] =
    useState(false);
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);

  const { positions, isPending, positionsError } = useLiquidityPositions();
  const { midgardStats, pools } = useAppState();

  const { positions: searchedPositions, fetchPositions } = usePositionStats({
    defaultRefetchInterval: 300000,
    mimirParameters: midgardStats,
    poolsData: pools,
    addresses: new Set<string>([addressInSearch]),
    filterByChains: allChainKeys,
    autoFetch: false,
  })

  console.log('searchedPositions', searchedPositions)

  const runePriceUSD = Number(midgardStats?.runePriceUSD) || 0; // TODO: Loading state

  const currentPositions = positions || searchedPositions;

  const allPositionsArray =
    (currentPositions &&
      Object.entries(currentPositions).reduce((pools: PositionStats[], [, types]) => {
        const chainPools = Object.entries(types)
          .filter(([, position]) => position)
          .map(([, position]) => position as PositionStats);
        return pools.concat(chainPools);
      }, [])) ||
    [];

  // Calculate totals
  const totalValue = allPositionsArray?.reduce((total, position) => {
    return total + position.deposit.usd + position.gain.usd;
  }, 0);

  const totalGain = allPositionsArray?.reduce((total, position) => {
    return total + position.gain.usd;
  }, 0);

  const titleStyle =
    "my-2 md:mb-4 md:mt-0 md:text-2xl font-medium md:mb-6 text-neutral-900 md:text-neutral font-gt-america-ext uppercase";

  useEffect(() => {
    if (positionsError) {
      showToast({
        type: ToastType.ERROR,
        text: "Failed to load your liquidity positions. Please try again.",
      });
    }
  }, [positionsError]);

  return (
    <main className="md:mx-16 space-y-3 md:space-y-5">
      <div className="flex flex-col">
        <h2 className={titleStyle}>Dashboard</h2>
        <div className="grid grid-cols-6 gap-4 md:gap-8">
          <div className="col-span-6 md:col-span-2">
            <DashboardHighlightsCard
              iconPath="icon-total-value-dashboard.svg"
              title="Total value"
              figure={(totalValue && addDollarSignAndSuffix(totalValue)) || "-"}
            />
          </div>
          <div className="col-span-3 md:col-span-2">
            <DashboardHighlightsCard
              iconPath="icon-total-earnings-dashboard.svg"
              title="Total earnings"
              figure={(totalGain && addDollarSignAndSuffix(totalGain)) || "-"}
            />
          </div>
          <div className="col-span-3 md:col-span-2">
            <DashboardHighlightsCard
              iconPath="icon-points-dashboard.svg"
              title="Points"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex align-center">
            <h2 className={titleStyle}>Your positions</h2>
            <Tooltip
              content={
                <p className="w-[300px]">
                  If you can’t find your liquidity position, make sure you are
                  connected with both addresses used during the initial deposit.
                  <a
                    href="https://yieldi.gitbook.io/yieldi/basics/integrations#why-cant-i-find-my-dual-chain-liquidity-position-in-yieldi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline pl-1"
                  >
                    Learn more
                  </a>
                </p>
              }
            >
              <Image
                src="/help.svg"
                alt="settings"
                className="rounded-full ml-2 mt-1 cursor-pointer"
                width={24}
                height={24}
              />
            </Tooltip>
          </div>
          <div className="flex">
            <Input label={"Search"} placeholder={"0x"} value={addressInSearch} onChange={(newAddress) => {setAddressInSearch(newAddress)}} />
            <Button onClick={() => fetchPositions()} className="ml-2">Search</Button>
          </div>
        </div>
        <div className="w-2/3 text-neutral-800 text-sm font-normal leading-tight mb-7">
          Manage your active positions and track your earnings.
        </div>
        {isPending && !currentPositions ? (
          <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
            <Loader />
          </div>
        ) : (
          <PositionsList
            positions={allPositionsArray}
            onClickStatus={(assetId: string, type: PositionType) => {
              const pool = pools?.find((pool) => pool.asset === assetId);
              const position = (currentPositions as Positions)[assetId][type];
              if (!position || !pool) {
                throw Error("Position or pool not found");
              }
              switch (position.status) {
                case PositionStatus.LP_POSITION_COMPLETE:
                case PositionStatus.LP_POSITION_DEPOSIT_PENDING:
                case PositionStatus.LP_POSITION_WITHDRAWAL_PENDING:
                  window.open(
                    `${getAddressUrl()}${position.memberDetails?.assetAddress}?tab=lps`,
                    "_blank",
                  );
                  break;
                case PositionStatus.LP_POSITION_INCOMPLETE:
                  const assetPriceUSD = parseFloat(pool.assetPriceUSD);

                  const assetAmount = baseToAsset(
                    baseAmount(position.memberDetails?.assetPending, 8),
                  );
                  const runeAmount = baseToAsset(
                    baseAmount(position.memberDetails?.runePending, 8),
                  );

                  const valueOfPendingAssetInUsd =
                    assetAmount.times(assetPriceUSD);
                  const valueOfPendingRuneInUsd =
                    runeAmount.times(runePriceUSD);

                  const amountOfAssetToDeposit =
                    valueOfPendingRuneInUsd.div(assetPriceUSD);
                  const amountOfRuneToDeposit =
                    valueOfPendingAssetInUsd.div(runePriceUSD);
                  const requiredSteps =
                    position.memberDetails?.assetPending === "0"
                      ? [
                          LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET,
                          LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET,
                        ]
                      : [LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_RUNE];
                  setAddLiquidityProcessState({
                    initialStep: LpSteps.HANDLE_STATE,
                    stepData: {
                      pool,
                      assetAmount: amountOfAssetToDeposit,
                      assetUsdAmount: valueOfPendingRuneInUsd
                        .amount()
                        .toNumber(),
                      runeAmount: amountOfRuneToDeposit,
                      runeUsdAmount: valueOfPendingAssetInUsd
                        .amount()
                        .toNumber(),
                      positionType: type,
                      requiredSteps: requiredSteps,
                    },
                  });
                  setShowAddLiquidityModal(true);
                  break;
                default:
                  break;
              }
            }}
            onAdd={(assetId: string, type: PositionType) => {
              const pool = pools?.find((pool) => pool.asset === assetId);
              if (!pool) {
                throw Error("Pool not found");
              }
              setSelectedPool(pool);
              setSelectedPosition(
                (currentPositions as Positions)[assetId][type] || null,
              );
              setAddLiquidityProcessState({
                initialStep: LpSteps.SELECT_OPTIONS,
                stepData: {
                  pool,
                  runePriceUSD: runePriceUSD,
                  initialType: type,
                },
              });
              setShowAddLiquidityModal(true);
            }}
            onRemove={(poolId: string, type: PositionType) => {
              setSelectedPool(
                pools?.find((pool) => pool.asset === poolId) || null,
              );
              setSelectedPosition((currentPositions as Positions)[poolId][type]);
              setShowRemoveLiquidityModal(true);
            }}
          />
        )}
      </div>
      {showAddLiquidityModal && addLiquidityProcessState.stepData && (
        <AddLiquidityManager
          initialStep={addLiquidityProcessState.initialStep}
          onClose={() => {
            setSelectedPool(null);
            setShowAddLiquidityModal(false);
          }}
          stepData={
            addLiquidityProcessState.stepData as
              | AddLiquidityStepData
              | StatusStepData
          }
        />
      )}
      {showRemoveLiquidityModal &&
        selectedPool &&
        selectedPosition &&
        selectedPosition.memberDetails && (
          <RemoveLiquidityModal
            pool={selectedPool}
            position={selectedPosition.memberDetails}
            positionType={selectedPosition.type}
            runePriceUSD={runePriceUSD}
            onClose={() => {
              setSelectedPool(null);
              setSelectedPosition(null);
              setShowRemoveLiquidityModal(false);
            }}
          />
        )}
    </main>
  );
}

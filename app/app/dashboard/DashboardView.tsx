"use client";

import { useEffect, useState } from "react";
import { addDollarSignAndSuffix } from "../utils";
import DashboardHighlightsCard from "./components/DashboardHighlightsCards";
import PositionsList from "./components/PositionsList";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import Loader from "../components/Loader";
import Image from "next/image";
import {
  Positions,
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { baseAmount, baseToAsset } from "@xchainjs/xchain-util";
import { LpSubstepsAddLiquidity } from "@/hooks/useLiquidityPosition";
import { useAppState } from "@/utils/contexts/context";
import { Button, Input, Tooltip } from "@shared/components/ui";
import { showToast, ToastType } from "../errorToast";
import {
  generateEmptyAddressObject,
  getAddressUrl,
  identifyNetworks,
} from "@/utils/wallet/utils";
import { ChainKey, ThorchainIdentifiers } from "@/utils/wallet/constants";
import { usePositionStats } from "@/hooks/usePositionStats";
import RemoveLiquidityManager, {
  LpRemoveSteps,
} from "../components/RemoveLiquidity/RemoveLiquidityManager";
import AddLiquidityManager, {
  LpAddSteps,
} from "../components/AddLiquidity/AddLiquidityManager";
import { StatusStepData } from "../components/AddLiquidity/StatusModalAddLiquidity";
import { AddLiquidityStepData } from "../components/AddLiquidity/AddLiquidityModal";
import { RemoveLiquidityStepData } from "../components/RemoveLiquidity/RemoveLiquidityModal";

const allChainKeys = Object.values(ChainKey).filter(
  (value) => typeof value === "string",
) as ChainKey[];

export default function DashboardView() {
  const [addLiquidityProcessState, setAddLiquidityProcessState] = useState<{
    initialStep: LpAddSteps;
    stepData: StatusStepData | AddLiquidityStepData | null;
  }>({
    initialStep: LpAddSteps.SELECT_OPTIONS,
    stepData: null,
  });
  const [removeLiquidityProcessState, setRemoveLiquidityProcessState] =
    useState<{
      initialStep: LpRemoveSteps;
      stepData: RemoveLiquidityStepData | null;
    }>({
      initialStep: LpRemoveSteps.SELECT_OPTIONS,
      stepData: null,
    });
  const [addressInSearch, setAddressInSearch] = useState("");
  const [showRemoveLiquidityModal, setShowRemoveLiquidityModal] =
    useState(false);
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);

  const { positions, isPending, isRefetching, positionsError, refetch } =
    useLiquidityPositions();
  const { midgardStats, pools, isWalletConnected } = useAppState();

  const networkIdentifiers = identifyNetworks(addressInSearch);

  const {
    positions: searchedPositions,
    fetchPositions,
    resetPositions,
    error: positionsErrorSearch,
  } = usePositionStats({
    defaultRefetchInterval: 300000,
    mimirParameters: midgardStats,
    poolsData: pools,
    addressesByChain: networkIdentifiers.reduce<
      Record<ThorchainIdentifiers, string>
    >((addresseses, network) => {
      addresseses[network] = addressInSearch;
      return addresseses;
    }, generateEmptyAddressObject()),
    filterByChains: allChainKeys,
    autoFetch: false,
    ensureBothAddressConnectedOnDlp: false,
  });

  useEffect(() => {
    if (
      (searchedPositions && Object.keys(searchedPositions).length === 0) ||
      positionsErrorSearch
    ) {
      showToast({
        type: ToastType.ERROR,
        text: "No positions found for the entered address. Please verify the address and try again.",
      });
    }
  }, [searchedPositions, positionsErrorSearch]);

  useEffect(() => {
    if (isWalletConnected()) {
      resetPositions();
      setAddressInSearch("");
    }
  }, [isWalletConnected, resetPositions]);

  const runePriceUSD = Number(midgardStats?.runePriceUSD) || 0; // TODO: Loading state

  const currentPositions = positions || searchedPositions;

  const allPositionsArray =
    (currentPositions &&
      Object.entries(currentPositions).reduce(
        (pools: PositionStats[], [, types]) => {
          const chainPools = Object.entries(types)
            .filter(([, position]) => position)
            .map(([, position]) => position as PositionStats);
          return pools.concat(chainPools);
        },
        [],
      )) ||
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
        <div
          className={`flex ${
            !isWalletConnected() ? "flex-col" : "flew-row"
          } md:flex-row items-start justify-between md:items-center`}
        >
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
          {isWalletConnected() && (
            <div
              onClick={() => refetch()}
              className="bg-white w-12 h-12 flex justify-center intems-center rounded-xl cursor-pointer hover:bg-white/50"
            >
              <Image
                src="/refresh.svg"
                alt="settings"
                className=""
                width={24}
                height={24}
              />
            </div>
          )}
          {!isWalletConnected() && (
            <div className="flex mb-4 md:mb-0">
              <Input
                className="md:w-96"
                placeholder={"0x"}
                value={addressInSearch}
                onChange={(newAddress) => {
                  setAddressInSearch(newAddress);
                }}
              />
              <Button
                type="secondary"
                disabled={!addressInSearch}
                onClick={() => {
                  if (addressInSearch) {
                    fetchPositions();
                  }
                }}
                className="ml-2"
              >
                Search
              </Button>
            </div>
          )}
        </div>
        <div className="w-2/3 text-neutral-800 text-sm font-normal leading-tight mb-7">
          Manage your active positions and track your earnings.
        </div>
        {(isPending && !currentPositions) || isRefetching ? (
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
                    `${getAddressUrl()}${
                      position.memberDetails?.assetAddress
                    }?tab=lps`,
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
                    initialStep: LpAddSteps.HANDLE_STATE,
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
                      position,
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
              setAddLiquidityProcessState({
                initialStep: LpAddSteps.SELECT_OPTIONS,
                stepData: {
                  pool,
                  runePriceUSD: runePriceUSD,
                  initialType: type,
                },
              });
              setShowAddLiquidityModal(true);
            }}
            onRemove={(assetId: string, type: PositionType) => {
              const pool = pools?.find((pool) => pool.asset === assetId);
              if (!pool) {
                throw Error("Pool not found");
              }
              const position = (currentPositions as Positions)[assetId][type];
              if (!position) {
                throw Error("Position not found");
              }
              setRemoveLiquidityProcessState({
                initialStep: LpRemoveSteps.SELECT_OPTIONS,
                stepData: {
                  pool,
                  position,
                  runePriceUSD,
                },
              });
              setShowRemoveLiquidityModal(true);
            }}
          />
        )}
      </div>
      {showAddLiquidityModal && addLiquidityProcessState.stepData && (
        <AddLiquidityManager
          initialStep={addLiquidityProcessState.initialStep}
          onClose={() => {
            setShowAddLiquidityModal(false);
          }}
          stepData={
            addLiquidityProcessState.stepData as
              | AddLiquidityStepData
              | StatusStepData
          }
        />
      )}
      {showRemoveLiquidityModal && removeLiquidityProcessState.stepData && (
        <RemoveLiquidityManager
          initialStep={removeLiquidityProcessState.initialStep}
          stepData={removeLiquidityProcessState.stepData}
          onClose={() => {
            setShowRemoveLiquidityModal(false);
          }}
        />
      )}
    </main>
  );
}

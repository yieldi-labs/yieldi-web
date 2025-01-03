import { useQuery } from "@tanstack/react-query";
import {
  getMemberDetail,
  getPools,
  MemberPool,
  PoolDetail,
  PoolDetails,
} from "@/midgard";
import {
  Positions,
  PositionStats,
  PositionStatus,
  positionsTransformer,
  PositionType,
} from "./dataTransformers/positionsTransformer";
import { useCallback, useEffect, useState } from "react";
import { useAppState } from "@/utils/contexts/context";

interface UsePositionStatsProps {
  defaultRefetchInterval?: number;
}

interface PositionsCache {
  positions: Positions;
  pools: PoolDetails;
}

export function emptyPositionStats(asset = "BTC.BTC"): PositionStats {
  return {
    assetId: asset,
    status: PositionStatus.LP_POSITION_COMPLETE,
    type: PositionType.SLP,
    deposit: {
      usd: 0,
      totalInAsset: 0,
      assetAdded: 0,
      runeAdded: 0,
    },
    gain: {
      usd: 0,
      asset: 0,
      percentage: "0",
    },
    pool: {} as PoolDetail,
    memberDetails: {} as MemberPool,
  };
}

export function usePositionStats({
  defaultRefetchInterval = 15000,
}: UsePositionStatsProps) {
  const [currentPositionsStats, setCurrentPositionsStats] = useState<
    PositionsCache | undefined
  >();

  const [addresses, setAddresses] = useState<string[]>([]);
  const [currentRefetchInterval, setRefetchInterval] = useState<
    number | undefined
  >(defaultRefetchInterval);
  const { walletsState } = useAppState();

  useEffect(() => {
    const addresses = [];
    for (const key in walletsState!) {
      if (walletsState!.hasOwnProperty(key)) {
        const wallet = walletsState![key];
        addresses.push(wallet.address);
      }
    }
    setAddresses(addresses);
  }, [walletsState]);

  const {
    isFetching: isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["position-stats", addresses],
    retry: false,
    enabled: addresses.length > 0,
    refetchInterval: currentRefetchInterval,
    queryFn: async () => {
      const resultPools = await getPools();
      const pools = resultPools.data;
      const result = await getMemberDetail({
        path: {
          address: addresses.join(","),
        },
      });

      if (result.response.status === 404) {
        // Midgard return 404 if user hasn't positions
        setRefetchInterval(undefined);
      }

      if (!pools) {
        throw Error("No pools available");
      }

      const genericPositionsDataStructure = positionsTransformer(
        result.data?.pools || [],
        pools,
      );

      const newPayload = updatePendingPositions(
        currentPositionsStats || {
          positions: genericPositionsDataStructure,
          pools,
        },
        { positions: genericPositionsDataStructure, pools },
      );
      setCurrentPositionsStats(newPayload);

      return { positions: genericPositionsDataStructure, pools };
    },
  });

  useEffect(() => {
    const hasPendingPositions = Object.values(
      currentPositionsStats?.positions || {},
    ).some((positions) =>
      Object.values(positions).some(
        (position) =>
          position?.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING ||
          position?.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING,
      ),
    );

    if (hasPendingPositions) {
      setRefetchInterval(defaultRefetchInterval);
    } else {
      setRefetchInterval(undefined);
    }
  }, [currentPositionsStats, defaultRefetchInterval]);

  const markPositionAsPending = useCallback(
    (pooldId: string, positionType: PositionType, status: PositionStatus) => {
      setCurrentPositionsStats((prev) => {
        const updatedPositions = { ...prev };

        if (!updatedPositions.positions) {
          throw Error("Pool or positions does not exist");
        }

        if (!updatedPositions.positions[pooldId]) {
          updatedPositions.positions[pooldId] = { DLP: null, SLP: null };
        }

        if (!updatedPositions.positions[pooldId][positionType]) {
          updatedPositions.positions[pooldId][positionType] =
            emptyPositionStats(pooldId);
        } else {
          updatedPositions.positions[pooldId][positionType] = {
            ...updatedPositions.positions[pooldId][positionType],
            status: status,
          };
        }
        setRefetchInterval(defaultRefetchInterval);
        refetch();
        return updatedPositions as PositionsCache;
      });
    },
    [defaultRefetchInterval, refetch],
  );

  const updatePendingPositions = (
    previous: PositionsCache,
    newPayload: PositionsCache,
  ) => {
    if (
      Object.entries(previous.positions).length !==
      Object.entries(newPayload.positions).length
    ) {
      return {
        pools: newPayload.pools,
        positions: {
          ...newPayload.positions,
          ...previous.positions,
        },
      };
    }
    Object.entries(previous.positions).forEach(([poolId, positions]) => {
      Object.entries(positions).forEach(([type, position]) => {
        if (
          position?.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING ||
          position?.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING
        ) {
          const positionType = type as PositionType;
          const previousData = previous.positions[poolId]?.[positionType];
          const currentData = newPayload.positions[poolId]?.[positionType];

          if (
            currentData &&
            JSON.stringify(previousData?.memberDetails) !==
              JSON.stringify(currentData.memberDetails)
          ) {
            const updatedPositions = { ...previous };
            updatedPositions.positions[poolId][positionType] = {
              ...(newPayload.positions[poolId][positionType] ||
                emptyPositionStats()),
            };
            return updatedPositions;
          }
        }
      });
    });
    return previous;
  };

  return {
    positions: currentPositionsStats?.positions,
    pools: currentPositionsStats?.pools,
    markPositionAsPending,
    isPending,
    error,
  };
}

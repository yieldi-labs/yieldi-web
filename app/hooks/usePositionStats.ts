import { useQuery } from "@tanstack/react-query";
import { MemberPool, PoolDetail, PoolDetails } from "@/midgard";
import {
  Positions,
  PositionStats,
  PositionStatus,
  positionsTransformer,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { useCallback, useEffect, useState } from "react";
import { assetFromString } from "@xchainjs/xchain-util";
import { MimirResponse } from "@/thornode";
import { ChainKey } from "@/utils/wallet/constants";
import { getChainKeyFromChain } from "@/utils/chain";

interface UsePositionStatsProps {
  defaultRefetchInterval?: number;
  mimirParameters: MimirResponse | undefined;
  poolsData: PoolDetails | undefined;
  addresses: string[];
  filterByChains: ChainKey[];
  autoFetch?: boolean
  ensureBothAddressConnectedOnDlp: boolean
}

export function emptyPositionStats(
  asset = "BTC.BTC",
  positionType = PositionType.SYM
): PositionStats {
  return {
    assetId: asset,
    status: PositionStatus.LP_POSITION_COMPLETE,
    type: positionType,
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
    pendingActions: [],
    liquidityLockUpRemainingInSeconds: 0,
    pool: {} as PoolDetail,
    memberDetails: {} as MemberPool,
  };
}

export function usePositionStats({
  defaultRefetchInterval = 30000,
  mimirParameters,
  poolsData,
  addresses,
  filterByChains,
  autoFetch = true,
  ensureBothAddressConnectedOnDlp = false
}: UsePositionStatsProps) {
  const [currentPositionsStats, setCurrentPositionsStats] = useState<
    Positions | undefined
  >();
  const [currentRefetchInterval, setRefetchInterval] = useState<
    number | undefined
  >(defaultRefetchInterval);
  const [fetchPositions, setFetchPositions] = useState(autoFetch);

  const {
    isFetching: isPending,
    isRefetching,
    isStale,
    error,
    refetch,
  } = useQuery({
    queryKey: ["position-stats", addresses],
    retry: false,
    staleTime: 2000,
    enabled: fetchPositions && addresses.length > 0 && Boolean(mimirParameters),
    refetchInterval: currentRefetchInterval,
    queryFn: async () => {
      const uniqueAddresses = Array.from(addresses);

      if (!poolsData) {
        throw Error("No pools available");
      }

      console.log('uniqueAddresses', uniqueAddresses)

      const genericPositionsDataStructure = await positionsTransformer( // TODO: Remove filter from both addresses for DLP on search
        uniqueAddresses,
        poolsData,
        {
          LIQUIDITYLOCKUPBLOCKS: Number(mimirParameters?.LIQUIDITYLOCKUPBLOCKS),
          ensureBothAddressConnectedOnDlp
        }
      );

      const filteredPositions = Object.keys(
        genericPositionsDataStructure
      ).reduce((positions: Positions, key: string) => {
        const chain = assetFromString(key)?.chain;
        if (chain) {
          const chainKey = getChainKeyFromChain(chain);
          if (filterByChains.includes(chainKey)) {
            positions[key] = genericPositionsDataStructure[key];
          }
        }
        return positions;
      }, {});

      setCurrentPositionsStats(filteredPositions);
      return { positions: genericPositionsDataStructure, pools: poolsData };
    },
  });

  useEffect(() => {
    const hasPendingPositions = Object.values(currentPositionsStats || {}).some(
      (positions) =>
        Object.values(positions).some(
          (position) =>
            position?.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING ||
            position?.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING
        )
    );

    if (hasPendingPositions) {
      setRefetchInterval(defaultRefetchInterval);
    } else {
      setRefetchInterval(undefined);
    }
  }, [currentPositionsStats, defaultRefetchInterval]);

  const fetchPositionsManually = useCallback(() => {
    console.log('refeching...')
    setFetchPositions(true);
    refetch({
      
    });
  }, [refetch]);

  const resetPositions = useCallback(() => {
    setCurrentPositionsStats(undefined);
    setFetchPositions(autoFetch);
  }, [autoFetch]);

  const markPositionAsPending = useCallback(
    (pooldId: string, positionType: PositionType, status: PositionStatus) => {
      setCurrentPositionsStats((prev) => {
        if (!prev) {
          throw Error("Pool or positions does not exist");
        }

        if (!prev[pooldId]) {
          prev[pooldId] = { SYM: null, ASYM: null };
        }

        if (!prev[pooldId][positionType]) {
          prev[pooldId][positionType] = emptyPositionStats(
            pooldId,
            positionType
          );
        } else {
          prev[pooldId][positionType] = {
            ...prev[pooldId][positionType],
            status: status,
          };
        }
        setRefetchInterval(defaultRefetchInterval + 1); // Reset refech interval to improve UX
        return prev;
      });
    },
    [defaultRefetchInterval]
  );

  return {
    positions: currentPositionsStats,
    markPositionAsPending,
    fetchPositions: fetchPositionsManually,
    resetPositions,
    isPending,
    isRefetching: isRefetching,
    error,
  };
}

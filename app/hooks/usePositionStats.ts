import { useQuery } from "@tanstack/react-query";
import { getMemberDetail, getPools, PoolDetail, PoolDetails } from "@/midgard";
import { Positions, PositionStats, PositionStatus, positionsTransformer, PositionType } from "./dataTransformers/positionsTransformer";
import { useCallback, useState } from "react";

interface UsePositionStatsProps {
  addresses: string[];
  specificPool?: PoolDetail;
  refetchInterval?: number;
}

interface PositionsCache {
  positions: Positions;
  pools: PoolDetails;
} 

export function emptyPositionStats(): PositionStats {
  return {
    assetId: "",
    status: PositionStatus.LP_POSITION_COMPLETE,
    type: PositionType.SLP,
    deposit: {
      usd: 0,
      asset: 0,
      assetAdded: 0,
      runeAdded: 0,
    },
    gain: {
      usd: 0,
      asset: 0,
      percentage: "0",
    },
  };
}

export function usePositionStats({
  addresses,
  specificPool,
  refetchInterval = 15000,
}: UsePositionStatsProps) {

  const [currentPositionsStats, setCurrentPositionsStats] = useState<PositionsCache | undefined>();

  const {
    isFetching: isPending,
    error,
  } = useQuery({
    queryKey: ["position-stats", addresses, specificPool?.asset],
    enabled: addresses.length > 0,
    refetchInterval, // TODO: Dependant on pending positions (transaction pending and block confirmation times of pending chains)
    queryFn: async () => {
      const resultPools = await getPools();
      const pools = resultPools.data;
      const result = await getMemberDetail({
        query: {
          showSavers: true,
        },
        path: {
          address: addresses.join(","),
        },
      });

      if (!result.data) {
        throw Error ('No member details available')
      }

      if (!pools) {
        throw Error ('No pools available')
      }

      const genericPositionsDataStructure = positionsTransformer(result.data?.pools, pools)
      let positions = genericPositionsDataStructure
      
      if (specificPool) {
        positions = {
          [specificPool.asset]: {
            ...genericPositionsDataStructure[specificPool.asset]
          }
        }
      }

      const newPayload = updatePendingPositions(currentPositionsStats || { positions, pools }, { positions, pools })
      setCurrentPositionsStats(newPayload)

      return { positions, pools }
    }
  });

  const markPositionAsPending = useCallback((pooldId: string, type: PositionType) => {
    setCurrentPositionsStats((prev) => {
      const updatedPositions = { ...prev };

      console.log('Udpdating position')

      if (!updatedPositions.positions || !updatedPositions.positions[pooldId]) {
        throw Error('Pool or positions does not exist')
      }

      if (!updatedPositions.positions[pooldId][type]) {
        updatedPositions.positions[pooldId][type] = {
          data: emptyPositionStats(),
          status: PositionStatus.LP_POSITION_PENDING,
        }
      } else {
        updatedPositions.positions[pooldId][type] = {
          ...updatedPositions.positions[pooldId][type],
          status: PositionStatus.LP_POSITION_PENDING,
        };
      }

      return updatedPositions as PositionsCache;
    });
  }, [])

  const updatePendingPositions = (previous: PositionsCache, newPayload: PositionsCache) => {
    Object.entries(previous.positions).forEach(([poolId, positions]) => {
      Object.entries(positions).forEach(([type, position]) => {
        if (position?.status === PositionStatus.LP_POSITION_PENDING) {
          const positionType = type as PositionType // TODO: Improve typing
          const previousData = previous.positions[poolId]?.[positionType]?.data;
          const currentData = newPayload.positions[poolId]?.[positionType]?.data;

          // TODO: Preview deep comparison
          if (currentData && JSON.stringify(previousData?.memberDetails) !== JSON.stringify(currentData.memberDetails)) {
            const updatedPositions = { ...previous };
            updatedPositions.positions[poolId][positionType] = {
              ...newPayload.positions[poolId][positionType] || { data: emptyPositionStats() }, // TODO: Improve this default case
              status: currentData.liquidityUnits !== "0" // TODO: Create real logic
                  ? PositionStatus.LP_POSITION_COMPLETE
                  : position.status,
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

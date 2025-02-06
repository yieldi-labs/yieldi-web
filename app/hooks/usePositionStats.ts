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
import { ethers } from "ethers";
import { assetFromString } from "@xchainjs/xchain-util";
import { getChainKeyFromChain } from "@/utils/chain";
import { ChainKey } from "@/utils/wallet/constants";
import { MimirResponse } from "@/thornode";
import { ConnectedWalletsState } from "@/utils/interfaces";

interface UsePositionStatsProps {
  defaultRefetchInterval?: number;
  walletsState: ConnectedWalletsState;
  mimirParameters: MimirResponse | undefined;
  poolsData: PoolDetails | undefined;
}

export function emptyPositionStats(
  asset = "BTC.BTC",
  positionType = PositionType.SYM,
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
  walletsState,
  mimirParameters,
  poolsData,
}: UsePositionStatsProps) {
  const [currentPositionsStats, setCurrentPositionsStats] = useState<
    Positions | undefined
  >();

  const [currentRefetchInterval, setRefetchInterval] = useState<
    number | undefined
  >(defaultRefetchInterval);

  const { isFetching: isPending, error } = useQuery({
    queryKey: ["position-stats", Object.keys(walletsState).length],
    retry: false,
    enabled: Object.keys(walletsState).length > 0 && Boolean(mimirParameters),
    refetchInterval: currentRefetchInterval,
    queryFn: async () => {
      const addresses = [];
      for (const key in walletsState!) {
        if (walletsState!.hasOwnProperty(key)) {
          const address = walletsState![key].address;
          if (ethers.utils.isAddress(address)) {
            const checksummeAddress = ethers.utils.getAddress(address); // Address with checksum
            addresses.push(checksummeAddress);
          }
          addresses.push(address);
        }
      }
      const uniqueAddresses = addresses.filter(
        (address, index, arrayAddresses) =>
          arrayAddresses.indexOf(address) === index,
      );

      if (!poolsData) {
        throw Error("No pools available");
      }

      const genericPositionsDataStructure = await positionsTransformer(
        uniqueAddresses,
        poolsData,
        {
          LIQUIDITYLOCKUPBLOCKS: Number(mimirParameters?.LIQUIDITYLOCKUPBLOCKS),
        },
      );

      // Filter based on connected wallets
      const walletsConnected = Object.keys(walletsState);
      const filteredPositions = Object.keys(
        genericPositionsDataStructure,
      ).reduce((positions: Positions, key: string) => {
        const chain = assetFromString(key)?.chain;
        if (!chain) {
          throw Error("Invalid chain");
        }
        const chainKey = getChainKeyFromChain(chain);
        if (walletsConnected.includes(chainKey)) {
          positions[key] = genericPositionsDataStructure[key];
        } else if (walletsConnected.includes(ChainKey.THORCHAIN)) {
          // Symmetrical positions can be managed from THORChain wallet
          positions[key] = {
            ASYM: null,
            SYM: genericPositionsDataStructure[key].SYM,
          };
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
            position?.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING,
        ),
    );

    if (hasPendingPositions) {
      setRefetchInterval(defaultRefetchInterval);
    } else {
      setRefetchInterval(undefined);
    }
  }, [currentPositionsStats, defaultRefetchInterval]);

  const cleanPositions = useCallback(
    () => setCurrentPositionsStats(undefined),
    [],
  );

  const markPositionAsPending = useCallback(
    (pooldId: string, positionType: PositionType, status: PositionStatus) => {
      setCurrentPositionsStats((prev) => {
        const updatedPositions = { ...prev };

        if (!updatedPositions.positions) {
          throw Error("Pool or positions does not exist");
        }

        if (!updatedPositions[pooldId]) {
          updatedPositions[pooldId] = { SYM: null, ASYM: null };
        }

        if (!updatedPositions[pooldId][positionType]) {
          updatedPositions[pooldId][positionType] = emptyPositionStats(
            pooldId,
            positionType,
          );
        } else {
          updatedPositions[pooldId][positionType] = {
            ...updatedPositions[pooldId][positionType],
            status: status,
          };
        }
        setRefetchInterval(defaultRefetchInterval + 1); // Reset refech interval to improve UX
        return updatedPositions;
      });
    },
    [defaultRefetchInterval],
  );

  return {
    positions: currentPositionsStats,
    markPositionAsPending,
    cleanPositions,
    isPending,
    error,
  };
}

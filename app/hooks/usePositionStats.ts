import { useQuery } from "@tanstack/react-query";
import { getMemberDetail, getPools, PoolDetail, MemberPool } from "@/midgard";
import BigNumber from "bignumber.js";
import {
  assetAmount,
  AssetAmount,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import { PositionType } from "@/app/dashboard/types";

export interface PositionStats {
  assetId: string;
  type: PositionType;
  deposit: {
    usd: number;
    asset: number;
    assetAdded: number;
    runeAdded: number;
  };
  gain: {
    usd: number;
    asset: number;
    percentage: string;
  };
  pool?: PoolDetail;
  liquidityUnits?: string;
  memberDetails?: MemberPool;
}

interface UsePositionStatsProps {
  addresses: string[];
  specificPool?: PoolDetail;
  refetchInterval?: number;
}

export function emptyPositionStats(): PositionStats {
  return {
    assetId: "",
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
  refetchInterval = 30000,
}: UsePositionStatsProps) {
  const {
    data,
    isFetching: isPending,
    error,
  } = useQuery({
    queryKey: ["position-stats", addresses, specificPool?.asset],
    enabled: addresses.length > 0,
    refetchInterval,
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

      const positions = result.data?.pools
        .filter(
          (memberDetail) =>
            !specificPool || memberDetail.pool === specificPool.asset,
        )
        .map((memberDetail) => {
          const pool = pools?.find(
            (p) => p.asset === memberDetail.pool.replace("/", "."),
          );
          if (!pool) throw Error("Position on invalid liquidity pool");

          let totalAddedValueInUsd: AssetAmount = assetAmount(0);
          let totalAddedValueInAsset: AssetAmount = assetAmount(0);
          let gainInUsd: AssetAmount = assetAmount(0);
          let gainInAsset: AssetAmount = assetAmount(0);
          let assetAdded = 0;
          let runeAdded = 0;

          if (memberDetail.pool.includes("/")) {
            // Savers calculations
            const userSaversPercentage = BigNumber(
              memberDetail.liquidityUnits,
            ).div(pool.saversUnits);
            const assetSaverToRedeem = baseAmount(
              BigNumber(pool.saversDepth).times(userSaversPercentage),
            );
            const totalRedeemValueInUsd = baseToAsset(assetSaverToRedeem).times(
              pool.assetPriceUSD,
            );

            const depositSaverValueAsset = baseToAsset(
              baseAmount(memberDetail.assetAdded).minus(
                memberDetail.assetWithdrawn,
              ),
            );
            totalAddedValueInUsd = depositSaverValueAsset.times(
              pool.assetPriceUSD,
            );
            gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);

            totalAddedValueInAsset = depositSaverValueAsset;
            gainInAsset = baseToAsset(assetSaverToRedeem).minus(
              depositSaverValueAsset,
            );
            assetAdded = depositSaverValueAsset.amount().toNumber();
          } else {
            // Liquidity Provider calculations
            const userPoolPercentage = BigNumber(
              memberDetail.liquidityUnits,
            ).div(pool.units);
            const assetToRedeem = baseAmount(
              BigNumber(pool.assetDepth).times(userPoolPercentage),
            );
            const runeToRedeem = baseAmount(
              BigNumber(pool.runeDepth).times(userPoolPercentage),
            );

            const redeemValueAssetInUsd = baseToAsset(assetToRedeem).times(
              pool.assetPriceUSD,
            );
            const redeemValueRuneInUsd = baseToAsset(runeToRedeem)
              .div(pool.assetPrice)
              .times(pool.assetPriceUSD);
            const totalRedeemValueInUsd =
              redeemValueAssetInUsd.plus(redeemValueRuneInUsd);

            const depositValueAsset = baseToAsset(
              baseAmount(memberDetail.assetAdded).minus(
                memberDetail.assetWithdrawn,
              ),
            );
            const depositValueRune = baseToAsset(
              baseAmount(memberDetail.runeAdded).minus(
                memberDetail.runeWithdrawn,
              ),
            );

            totalAddedValueInUsd = depositValueAsset
              .times(pool.assetPriceUSD)
              .plus(
                depositValueRune.div(pool.assetPrice).times(pool.assetPriceUSD),
              );
            gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);

            totalAddedValueInAsset = depositValueAsset.plus(
              depositValueRune.div(pool.assetPrice),
            );
            gainInAsset = baseToAsset(assetToRedeem)
              .plus(baseToAsset(runeToRedeem).div(pool.assetPrice))
              .minus(totalAddedValueInAsset);

            assetAdded = depositValueAsset.amount().toNumber();
            runeAdded = depositValueRune.amount().toNumber();
          }

          const isDlp =
            memberDetail.runeAdded !== "0" && memberDetail.assetDeposit !== "0";

          return {
            assetId: memberDetail.pool,
            type: memberDetail.pool.includes("/")
              ? PositionType.SAVER
              : isDlp
                ? PositionType.DLP
                : PositionType.SLP,
            deposit: {
              usd: totalAddedValueInUsd.amount().toNumber(),
              asset: totalAddedValueInAsset.amount().toNumber(),
              assetAdded,
              runeAdded,
            },
            gain: {
              usd: gainInUsd.amount().toNumber(),
              asset: gainInAsset.amount().toNumber(),
              percentage: gainInUsd
                .div(totalAddedValueInUsd)
                .times(100)
                .amount()
                .toFixed(4),
            },
            pool,
            liquidityUnits: memberDetail.liquidityUnits,
            memberDetails: memberDetail,
          };
        });

      return { positions, pools };
    },
  });

  return {
    positions: data?.positions || [],
    pools: data?.pools,
    isPending,
    error,
  };
}

import { useQuery } from "@tanstack/react-query";
import { getMemberDetail, getPools } from "@/midgard";
import BigNumber from "bignumber.js";
import {
  assetAmount,
  AssetAmount,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import { PositionType } from "@/app/dashboard/types"

export function usePositionStats(addresses: string[]) {
  const { data, isFetching: isPending } = useQuery({
    queryKey: ["position-stats", addresses],
    enabled: addresses.length > 0,
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

      const positions = result.data?.pools.map((memberDetail) => {
        const pool = pools?.find(
          (pool) => pool.asset === memberDetail.pool.replace("/", "."),
        ); // For parsing also Savers positions properly
        if (!pool) {
          throw Error("Position on invalid liquidity pool");
        }

        let totalAddedValueInUsd: AssetAmount = assetAmount(0);
        let totalAddedValueInAsset: AssetAmount = assetAmount(0);
        let gainInUsd: AssetAmount = assetAmount(0);
        let gainInAsset: AssetAmount = assetAmount(0);

        if (memberDetail.pool.includes("/")) {
          // Savers
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
          totalAddedValueInUsd = depositSaverValueAsset.times(pool.assetPriceUSD);
          gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);

          totalAddedValueInAsset = depositSaverValueAsset;
          gainInAsset = baseToAsset(assetSaverToRedeem).minus(depositSaverValueAsset);
        } else {
          // Liquidity providers
          const userPoolPercentage = BigNumber(memberDetail.liquidityUnits).div(
            pool.units,
          );
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
          const totalRedeemValueInUsd = redeemValueAssetInUsd.plus(
            redeemValueRuneInUsd,
          );

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
            .plus(depositValueRune.div(pool.assetPrice).times(pool.assetPriceUSD));
          gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);

          totalAddedValueInAsset = depositValueAsset.plus(
            depositValueRune.div(pool.assetPrice),
          );
          gainInAsset = baseToAsset(assetToRedeem)
            .plus(baseToAsset(runeToRedeem).div(pool.assetPrice))
            .minus(totalAddedValueInAsset);
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
        };
      });

      return { positions };
    },
  });

  return {
    positions: data?.positions,
    isPending,
  };
}
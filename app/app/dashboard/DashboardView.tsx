"use client";

import { useQuery } from "@tanstack/react-query";
import { addDollarSignAndSuffix } from "../utils";
import DashboardHighlightsCard from "./components/DashboardHighlightsCards";
import PositionsList from "./components/PositionsList";
import { getMemberDetail, getPools, PoolDetail } from "@/midgard";
import { useWalletConnection } from "@/hooks";
import BigNumber from "bignumber.js";
import {
  assetAmount,
  AssetAmount,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import { PositionType } from "./types";
import { useAppState } from "@/utils/context";
import PositionsPlaceholder from "./components/PositionsPlaceholder";
import AddLiquidityModal from "../explore/components/AddLiquidityModal";
import { useState } from "react";

export default function DashboardView() {
  const { wallet } = useAppState();
  const { getAllNetworkAddressesFromLocalStorage } = useWalletConnection();
  const [selectedPool, setSelectedPool] = useState<PoolDetail>();
  const { isPending, data } = useQuery({
    queryKey: ["dashboard-info"],
    enabled: !!wallet,
    queryFn: async () => {
      const resultPools = await getPools();
      const pools = resultPools.data;
      const addresses = getAllNetworkAddressesFromLocalStorage();
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
        let gainInUsd: AssetAmount = assetAmount(0);

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

          const depositSaverValueAssetInUsd = baseToAsset(
            baseAmount(memberDetail.assetAdded).minus(
              memberDetail.assetWithdrawn,
            ),
          ).times(pool.assetPriceUSD);

          totalAddedValueInUsd = depositSaverValueAssetInUsd;
          gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);
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
          const redeemValueAssetInRune = baseToAsset(runeToRedeem)
            .div(pool.assetPrice)
            .times(pool.assetPriceUSD);
          const totalRedeemValueInUsd = redeemValueAssetInUsd.plus(
            redeemValueAssetInRune,
          );

          const depositValueAssetInUsd = baseToAsset(
            baseAmount(memberDetail.assetAdded).minus(
              memberDetail.assetWithdrawn,
            ),
          ).times(pool.assetPriceUSD);
          const depositValueRuneInUsd = baseToAsset(
            baseAmount(memberDetail.runeAdded).minus(
              memberDetail.runeWithdrawn,
            ),
          )
            .div(pool.assetPrice)
            .times(pool.assetPriceUSD);
          totalAddedValueInUsd = depositValueAssetInUsd.plus(
            depositValueRuneInUsd,
          );
          gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);
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
          },
          gain: {
            usd: gainInUsd.amount().toNumber(),
            percentage: gainInUsd
              .div(totalAddedValueInUsd)
              .times(100)
              .amount()
              .toFixed(4),
          },
        };
      });
      return { pools, positions };
    },
  });

  const totalValue = data?.positions?.reduce((total, position) => {
    return total + position.deposit.usd + position.gain.usd;
  }, 0);

  const totalGain = data?.positions?.reduce((total, position) => {
    return total + position.gain.usd;
  }, 0);

  const titleStyle =
    "my-2 md:mb-4 md:mt-0 md:text-2xl font-medium md:mb-6 text-neutral-900 md:text-neutral font-gt-america-ext uppercase";
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
        <h2 className={titleStyle}>Your positions</h2>
        <div className="w-2/3 text-neutral-800 text-sm font-normal leading-tight mb-7">
          Manage your active positions and track your earnings.
        </div>
        {data?.positions ? (
          isPending ? (
            "Loading..."
          ) : (
            <PositionsList
              positions={data?.positions}
              onAdd={(assetId) => {
                setSelectedPool(
                  data?.pools?.find(
                    (pool) => pool.asset === assetId,
                  ),
                );
              }}
              onRemove={() => {}}
            />
          )
        ) : (
          <PositionsPlaceholder />
        )}
      </div>
      {selectedPool && (
        <AddLiquidityModal
          pool={selectedPool}
          runePriceUSD={0}
          onClose={() => {
            setSelectedPool(undefined);
          }}
        />
      )}
    </main>
  );
}

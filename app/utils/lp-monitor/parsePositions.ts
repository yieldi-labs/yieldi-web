import {
  getMemberDetail,
  MemberPool,
  PoolDetail,
  PoolDetails,
} from "@/midgard";
import {
  assetAmount,
  AssetAmount,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import BigNumber from "bignumber.js";
import {
  ActionData,
  ActionStatus,
  actionsTransformer,
  ActionType,
} from "./parseActions";

export enum PositionStatus {
  LP_POSITION_DEPOSIT_PENDING = "LP_POSITION_DEPOSIT_PENDING",
  LP_POSITION_WITHDRAWAL_PENDING = "LP_POSITION_WITHDRAWAL_PENDING",
  LP_POSITION_INCOMPLETE = "LP_POSITION_INCOMPLETE",
  LP_POSITION_COMPLETE = "LP_POSITION_COMPLETE",
}

export enum PositionType {
  SLP = "SLP",
  DLP = "DLP",
}

export interface PositionStats {
  assetId: string;
  type: PositionType;
  status: PositionStatus;
  deposit: {
    usd: number;
    totalInAsset: number;
    assetAdded: number;
    runeAdded: number;
  };
  gain: {
    usd: number;
    asset: number;
    percentage: string;
  };
  pendingActions: ActionData[];
  pool: PoolDetail;
  memberDetails?: MemberPool;
}

export interface Positions {
  [pool: string]: {
    DLP: PositionStats | null;
    SLP: PositionStats | null;
  };
}

export const positionsTransformer = async (
  addresses: string[],
  pools: PoolDetails,
) => {
  const result: Positions = {};

  const memberPoolsResult = await getMemberDetail({
    path: {
      address: addresses.join(","),
    },
  });

  const actions = await actionsTransformer(addresses);

  const memberPools = memberPoolsResult.data?.pools;

  memberPools?.forEach((memberPool) => {
    const type = determinePositionType(memberPool);

    const key = memberPool.pool.replace("/", ".");

    if (!result[key]) {
      result[key] = { DLP: null, SLP: null };
    }

    const pool = pools?.find(
      (p) => p.asset === memberPool.pool.replace("/", "."),
    );
    if (!pool) throw Error("Position on invalid liquidity pool");

    let totalAddedValueInUsd: AssetAmount = assetAmount(0);
    let totalAddedValueInAsset: AssetAmount = assetAmount(0);
    let gainInUsd: AssetAmount = assetAmount(0);
    let gainInAsset: AssetAmount = assetAmount(0);
    let assetAdded = 0;
    let runeAdded = 0;

    const userPoolPercentage = BigNumber(memberPool.liquidityUnits).div(
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
    const totalRedeemValueInUsd =
      redeemValueAssetInUsd.plus(redeemValueRuneInUsd);

    const depositValueAsset = baseToAsset(
      baseAmount(memberPool.assetAdded).minus(memberPool.assetWithdrawn),
    );
    const depositValueRune = baseToAsset(
      baseAmount(memberPool.runeAdded).minus(memberPool.runeWithdrawn),
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

    assetAdded = depositValueAsset.amount().toNumber();
    runeAdded = depositValueRune.amount().toNumber();

    const pendingActions = actions.filter((action) => {
      const isPending =
        action.pool === memberPool.pool &&
        action.status === ActionStatus.PENDING;
      const isThorchainTx = Boolean(action.chain === "THOR");
      if (type === PositionType.DLP) {
        return isThorchainTx && isPending;
      } else {
        return !isThorchainTx && isPending;
      }
    });

    result[key][type] = {
      assetId: memberPool.pool,
      type: determinePositionType(memberPool),
      status: determinePositionStatus(pendingActions, memberPool),
      deposit: {
        usd: totalAddedValueInUsd.amount().toNumber(),
        totalInAsset: totalAddedValueInAsset.amount().toNumber(),
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
      pendingActions,
      memberDetails: memberPool,
    };
  });

  const allPendingActions = actions.filter(
    (action) => action.status === ActionStatus.PENDING,
  );

  allPendingActions.forEach((action) => {
    const pool = pools?.find((p) => p.asset === action.pool);
    if (!pool) throw Error("Position on invalid liquidity pool");
    if (!result[action.pool]) {
      result[action.pool] = { DLP: null, SLP: null };
    }
    const pendingActionType =
      action.chain === "THOR" ? PositionType.DLP : PositionType.SLP;
    result[action.pool][pendingActionType] = {
      assetId: action.pool,
      type: pendingActionType,
      status: determinePositionStatus([action]),
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
      pool,
      pendingActions: [action],
    };
  });

  return result;
};

const determinePositionType = (memberPool: MemberPool): PositionType => {
  if (
    (memberPool.runeAdded !== "0" && memberPool.assetAdded !== "0") ||
    memberPool.runePending !== "0" ||
    memberPool.assetPending !== "0"
  )
    return PositionType.DLP;
  return PositionType.SLP;
};

const determinePositionStatus = (
  actionsPending: ActionData[],
  memberPool?: MemberPool,
) => {
  if (actionsPending.length > 0) {
    if (actionsPending[0].type === ActionType.ADD_LIQUIDITY) {
      return PositionStatus.LP_POSITION_DEPOSIT_PENDING;
    } else {
      return PositionStatus.LP_POSITION_WITHDRAWAL_PENDING;
    }
  }
  if (
    Number(memberPool?.assetPending) > 0 ||
    Number(memberPool?.runePending) > 0
  )
    return PositionStatus.LP_POSITION_INCOMPLETE;
  return PositionStatus.LP_POSITION_COMPLETE;
};

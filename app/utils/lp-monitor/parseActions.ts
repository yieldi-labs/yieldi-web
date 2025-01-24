import { getActions } from "@/midgard";
import { txStatus } from "@/thornode";

export enum ActionType {
  ADD_LIQUIDITY = "ADD_LIQUIDITY",
  REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
}

export enum ActionStatus {
  COMPLETE = "COMPLETE",
  PENDING = "PENDING",
}

export interface ActionData {
  date: string;
  type: ActionType;
  status: ActionStatus;
  thorchainTxId: string;
  pendingDelayInSeconds: number;
  pool: string;
  chain: string;
}

export const actionsTransformer = async (
  addresses: string[],
  onlyPending = true,
): Promise<ActionData[]> => {
  const resultActions = await getActions({
    query: {
      type: "withdraw,addLiquidity",
      address: addresses.join(","),
    },
  });

  const actionsData = resultActions.data;

  if (!actionsData) {
    throw Error("No actions data");
  }

  const filterActions = onlyPending
    ? actionsData?.actions.filter((action) => action.status === "pending")
    : actionsData?.actions;

  const parseActionsPromises = filterActions.map(async (action) => {
    let status = null;
    if (action.status === "pending") {
      status = await txStatus({
        path: {
          hash: action.in[0].txID,
        },
      });
    }
    return {
      date: new Date(Number(action.date) / 1000).toDateString(),
      type:
        action.date === "addLiquidity"
          ? ActionType.ADD_LIQUIDITY
          : ActionType.REMOVE_LIQUIDITY,
      status:
        action.status === "pending"
          ? ActionStatus.PENDING
          : ActionStatus.COMPLETE,
      thorchainTxId: action.in[0].txID,
      chain: status?.data?.tx?.chain || "-",
      pendingDelayInSeconds:
        status?.data?.stages.outbound_delay?.remaining_delay_seconds || 0,
      pool: action.pools[0],
    };
  });

  const parseActions = await Promise.all(parseActionsPromises);

  return parseActions;
};

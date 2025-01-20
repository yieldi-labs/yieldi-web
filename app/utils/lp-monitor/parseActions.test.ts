import { getActions } from "@/midgard";
import { txStages } from "@/thornode";
import { ActionStatus, actionsTransformer, ActionType } from "./parseActions";
import { actionsResponse } from "@/__mocks__/responses/actionsResponse";
import { stagesResponse } from "@/__mocks__/responses/stagesResponse";

jest.mock("@/midgard", () => ({
  getActions: jest.fn(),
}));

jest.mock("@/thornode", () => ({
  txStages: jest.fn(),
}));

const addresses = ["bc1qsnt7kf7k0ncrayul4g57s7n6q33adull7egcx0", "0xf8788d3e247953733f1f3247ab814c5cbb2876d1"]

describe("actionsTransformer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should transform midgard actions to the expected structure", async () => {
    (getActions as jest.Mock).mockResolvedValueOnce(actionsResponse);
    (txStages as jest.Mock).mockResolvedValue(stagesResponse);

    const result = await actionsTransformer(addresses);

    expect(getActions).toHaveBeenCalledWith({
      query: {
        address: "bc1qsnt7kf7k0ncrayul4g57s7n6q33adull7egcx0,0xf8788d3e247953733f1f3247ab814c5cbb2876d1",
        type: "withdraw,addLiquidity",
      },
    });

    expect(result).toEqual([
      {
        date: "Wed Apr 04 56998",
        type: ActionType.REMOVE_LIQUIDITY,
        status: ActionStatus.PENDING,
        thorchainTxId: "10D27CEBA9A44898E3AC4FA7F80F607A6A954226EE821C68EA9B8D2370917FF0",
        pendingDelayInSeconds: 30,
        pool: "AVAX.AVAX",
      },
    ]);
  });
});

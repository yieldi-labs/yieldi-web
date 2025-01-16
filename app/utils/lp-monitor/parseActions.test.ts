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
      path: {
        address: "bc1qsnt7kf7k0ncrayul4g57s7n6q33adull7egcx0,0xf8788d3e247953733f1f3247ab814c5cbb2876d1",
        type: "withdraw,addLiquidity",
      },
    });

    expect(result).toEqual([
      {
        date: expect.any(Date),
        type: ActionType.REMOVE_LIQUIDITY,
        status: ActionStatus.PENDING,
        thorchainTxId: "EE9264C9668968FCE9BF01B68710B242F05258FEBFC6D95A37B4A3AB813C1883",
        pendingDelayInSeconds: 30,
        pool: "BTC.BTC",
      },
    ]);
  });
});

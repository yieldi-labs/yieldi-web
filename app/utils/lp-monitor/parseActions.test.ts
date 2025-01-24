import { getActions } from "@/midgard";
import { txStatus } from "@/thornode";
import { ActionStatus, actionsTransformer, ActionType } from "./parseActions";
import { actionsResponse } from "@/__mocks__/responses/actionsResponse";
import { statusResponse } from "@/__mocks__/responses/statusResponse";

jest.mock("@/midgard", () => ({
  getActions: jest.fn(),
}));

jest.mock("@/thornode", () => ({
  txStatus: jest.fn(),
}));

const addresses = [
  "bc1qsnt7kf7k0ncrayul4g57s7n6q33adull7egcx0",
  "0xf8788d3e247953733f1f3247ab814c5cbb2876d1",
];

describe("actionsTransformer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should transform midgard actions to the expected structure - Symm and confirmed", async () => {
    (getActions as jest.Mock).mockResolvedValueOnce(actionsResponse);
    (txStatus as jest.Mock).mockResolvedValue(statusResponse);

    const result = await actionsTransformer(addresses);

    expect(getActions).toHaveBeenCalledWith({
      query: {
        address:
          "bc1qsnt7kf7k0ncrayul4g57s7n6q33adull7egcx0,0xf8788d3e247953733f1f3247ab814c5cbb2876d1",
        type: "withdraw,addLiquidity",
      },
    });

    expect(result).toEqual([
      {
        date: "Wed Apr 04 56998",
        chain: "AVAX",
        type: ActionType.REMOVE_LIQUIDITY,
        status: ActionStatus.PENDING,
        thorchainTxId:
          "10D27CEBA9A44898E3AC4FA7F80F607A6A954226EE821C68EA9B8D2370917FF0",
        pendingDelayInSeconds: 30,
        pool: "AVAX.AVAX",
      },
    ]);
  });
});

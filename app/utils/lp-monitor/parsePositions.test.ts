import { getActions, getMemberDetail, PoolDetails } from "@/midgard";
import { positionsTransformer, PositionType, PositionStatus } from "./parsePositions";
import { memberDetailsResponse } from "@/__mocks__/responses/memberDetailsResponse";
import { actionsResponse } from "@/__mocks__/responses/actionsResponse";
import { stagesResponse } from "@/__mocks__/responses/stagesResponse";
import { txStages } from "@/thornode";
import { ActionStatus, ActionType } from "./parseActions";

jest.mock("@/midgard", () => ({
  getActions: jest.fn(),
  getMemberDetail: jest.fn()
}));

jest.mock("@/thornode", () => ({
  txStages: jest.fn(),
}));

const addresses = ["bc1qsnt7kf7k0ncrayul4g57s7n6q33adull7egcx0", "0xf8788d3e247953733f1f3247ab814c5cbb2876d1"]

const mockPools: PoolDetails = [
    {
        annualPercentageRate: "0.23874239535919983",
        asset: "AVAX.AVAX",
        assetDepth: "10070913447288",
        assetPrice: "11.480441797564149",
        assetPriceUSD: "39.759658800358",
        earnings: "953360076608",
        earningsAnnualAsPercentOfDepth: "0.2149781520235865",
        liquidityUnits: "67236336181860",
        lpLuvi: "-0.6911498558377018",
        nativeDecimal: "18",
        poolAPY: "0.23874239535919983",
        runeDepth: "115618535679896",
        saversAPR: "0.049538356857741044",
        saversDepth: "4483560877340",
        saversUnits: "3914381586128",
        saversYieldShare: "0.44351447690915763",
        status: "available",
        synthSupply: "4487668560324",
        synthUnits: "19275031308102",
        totalCollateral: "0",
        totalDebtTor: "0",
        units: "86511367489962",
        volume24h: "63150852732173",
    },
];

describe("parsePositions", () => {
  it("should transform member pools and pool details into the expected structure", async () => {
    (getActions as jest.Mock).mockResolvedValueOnce(actionsResponse);
    (getMemberDetail as jest.Mock).mockResolvedValueOnce(memberDetailsResponse);
    (txStages as jest.Mock).mockResolvedValue(stagesResponse);

    const result = await positionsTransformer(addresses, mockPools);

    expect(result["AVAX.AVAX"].DLP).toEqual({
      assetId: "AVAX.AVAX",
      type: PositionType.DLP,
      status: PositionStatus.LP_POSITION_COMPLETE,
      deposit: {
        usd: expect.any(Number),
        totalInAsset: expect.any(Number),
        assetAdded: 0.12999999,
        runeAdded: 0.6,
      },
      pendingActions: [{
        date: expect.any(String),
        pendingDelayInSeconds: 30,
        pool: "AVAX.AVAX",
        status: ActionStatus.PENDING,
        thorchainTxId: "10D27CEBA9A44898E3AC4FA7F80F607A6A954226EE821C68EA9B8D2370917FF0",
        type: ActionType.REMOVE_LIQUIDITY,
      }],
      gain: {
        usd: expect.any(Number),
        asset: expect.any(Number),
        percentage: expect.any(String),
      },
      pool: mockPools[0],
      memberDetails: memberDetailsResponse.data.pools[0],
    });
  });

  it("should handle empty inputs gracefully", () => {
    const result = positionsTransformer([], []);
    expect(result).toEqual({});
  });
});

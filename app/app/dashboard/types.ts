export enum PositionType {
  SAVER = "SAVER",
  SLP = "SLP",
  DLP = "DLP",
}

export interface Position {
  assetId: string;
  type: PositionType;
  deposit: {
    usd: number;
  };
  gain: {
    usd: number;
    percentage: string;
  };
}

export type PositionsPerAsset = Position[];

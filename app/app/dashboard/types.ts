export enum PositionType {
  SLP = "SLP",
  DLP = "DLP",
}

export interface Position {
  assetId: string;
  type: PositionType;
  deposit: {
    usd: number;
    asset: number;
  };
  gain: {
    usd: number;
    percentage: string;
  };
}

export type PositionsPerAsset = Position[];

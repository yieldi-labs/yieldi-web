export interface Position {
    assetId: string;
    type: 'SAVER' | 'LP'
    deposit: {
      asset: number;
      usd: number;
    };
    gain: {
      asset: number;
      usd: number;
    };
    apy: number
}
  
export type PositionsPerAsset = Position[];
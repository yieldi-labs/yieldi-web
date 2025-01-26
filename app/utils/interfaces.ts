import {
  ChainKey,
  ProviderKey,
  ThorchainIdentifiers,
  WalletKey,
} from "@/utils/wallet/constants";
import { SVGProps } from "react";

export type TokenData = {
  asset: string;
  name?: string;
  balance: number;
  formattedBalance?: number;
  decimals?: number;
  symbol?: string;
  chainName?: string;
  tokenAddress: string;
  chainKey: ChainKey;
};
export type TokenRecord = Record<string, TokenData>;
export type WalletTokensData = Record<ChainKey, TokenRecord>;

export interface WalletState {
  provider: any;
  address: string;
  providerType: ProviderKey;
  ChainInfo: ChainKey;
  walletId: WalletKey;
}

export interface ConnectedWalletsState {
  [key: string]: WalletState;
}

export interface WalletType {
  id: WalletKey;
  name: string;
  chains: ChainKey[];
  icon: JSX.Element;
  isAvailable: boolean;
  isHardware: boolean;
  hasSupportMultichain: boolean;
  hasSupportToAddConectionToExistingConnection: boolean;
  hasSupportToSelectChains: boolean;
  downloadUrl: string;
  chainConnect: {
    [key in ProviderKey]?: () => Promise<{ provider: any; address: string }>;
  };
}

export interface AddChainRequestPayload {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  iconUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
}

export enum ChainType {
  EVM = "EVM",
  UTXO = "UTXO",
  BFT = "BFT",
}

export interface ChainInfo {
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  name: ChainKey;
  providerType: ProviderKey;
  chainId?: string;
  thorchainIdentifier: ThorchainIdentifiers;
  nativeAsset: string;
  nativeDecimals: number;
  addressUrl: string;
  ctrlChainId: string;
  type: ChainType;
  addChainRequestPayload?: AddChainRequestPayload;
}

import { ChainKey, ProviderKey, WalletKey } from "@/utils/wallet/constants";
import { GetConnectorsReturnType } from "@wagmi/core";
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

export interface WalletOption {
  id: string;
  name: string;
  icon: JSX.Element;
  connect?: any;
  downloadUrl?: string;
  disabled?: boolean;
}

export interface ChainConfig {
  id: string;
  chainId?: number;
  name: string;
  icon: JSX.Element;
  wallets: WalletOption[];
}

export interface LiquidityProvider {
  rune_address?: string;
  asset_address?: string;
  last_add_height: number;
  last_withdraw_height?: number;
  units: string;
  pending_rune: string;
  pending_asset: string;
  rune_deposit_value: string;
  asset_deposit_value: string;
}

export interface WalletState {
  provider: any;
  address: string;
  providerType: ProviderKey;
  chainType: ChainKey;
  walletId: WalletKey;
  chainId?: string;
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
  downloadUrl?: string;
  chainConnect: {
    [key in ProviderKey]?: (
      connectors?: GetConnectorsReturnType,
    ) => Promise<{ provider: any; address: string }>;
  };
}

export interface ChainType {
  icon: SVGProps<SVGSVGElement>;
  name: ChainKey;
  providerType: ProviderKey;
  chainId?: string;
  thorchainIdentifier: string;
  nativeAsset: string;
  addressUrl: string;
}

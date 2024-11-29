import { ChainKey, ProviderKey, WalletKey } from "@/utils/wallet/constants";
import { GetConnectorsReturnType } from "@wagmi/core";
import { SVGProps } from "react";

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

export interface WalletType {
  id: WalletKey;
  name: string;
  chains: ChainKey[];
  icon: JSX.Element;
  isAvailable: boolean;
  downloadUrl?: string;
  chainConnect: {
    [key in ProviderKey]?: (
      ethConnectors?: GetConnectorsReturnType
    ) => Promise<{ provider: any; address: string }>;
  };
}

export interface ChainType {
  icon: SVGProps<SVGSVGElement>;
  name: ChainKey;
  providerType: ProviderKey;
  chainId?: string;
}

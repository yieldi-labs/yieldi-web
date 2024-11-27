import { ChainKey, WalletKey } from "@/utils/wallet/constants";

interface WalletOption {
  id: string;
  name: string;
  icon: JSX.Element;
  connect?: any;
  downloadUrl?: string;
  disabled?: boolean;
}

interface ChainConfig {
  id: string;
  chainId?: number;
  name: string;
  icon: JSX.Element;
  wallets: WalletOption[];
}

interface LiquidityProvider {
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

interface WalletType {
  id: WalletKey;
  name: string;
  chains: ChainKey[];
  icon: JSX.Element;
  // isDetected?: any;
  isAvailable: boolean;
  downloadUrl?: string;
  chainConnect: {
    [key in ProviderKey]?: (
      ethConnectors?: GetConnectorsReturnType
    ) => Promise<any>;
  };
}

interface ChainType {
  icon: SVGProps<SVGSVGElement>;
  name: ChainKey;
  providerType: ProviderKey;
  chainId?: number;
}

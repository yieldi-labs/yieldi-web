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
  thorchainIdentifier?: string;
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

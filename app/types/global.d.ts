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
  /**
   * The asset identifier in the format CHAIN.SYMBOL-ADDRESS
   */
  asset: string;

  /**
   * The Thor/RUNE address of the liquidity provider (optional)
   */
  rune_address?: string;

  /**
   * The asset chain address of the liquidity provider (optional)
   */
  asset_address?: string;

  /**
   * Block height of the last add liquidity transaction
   */
  last_add_height: number;

  /**
   * Block height of the last withdraw transaction (optional)
   */
  last_withdraw_height?: number;

  /**
   * Number of pool units owned by the liquidity provider
   */
  units: string;

  /**
   * Amount of RUNE pending deposit
   */
  pending_rune: string;

  /**
   * Amount of asset pending deposit
   */
  pending_asset: string;

  /**
   * Value of RUNE deposited (in base units)
   */
  rune_deposit_value: string;

  /**
   * Value of asset deposited (in base units)
   */
  asset_deposit_value: string;
}

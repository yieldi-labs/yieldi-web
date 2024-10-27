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
  name: string;
  icon: JSX.Element;
  wallets: WalletOption[];
}

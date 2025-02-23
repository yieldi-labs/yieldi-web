declare global {
  interface Window {
    xfi?: {
      bitcoin?: any;
      bitcoincash?: any;
      ethereum?: any;
      thorchain?: any;
      solana?: any;
      litecoin?: any;
      cosmos?: any;
      dogecoin?: any;
      mayachain?: any;
      keplr?: any;
    };
    phantom?: any;
    okxwallet?: any;
    keplr?: any;
    vultisig?: {
      ethereum?: any;
      thorchain?: any;
      cosmos?: any;
    };
    thorchain?: any;
    ctrlEthProviders?: Record<string, any>;
    ctrlKeplrProviders?: Record<string, any>;
  }
}

export {};

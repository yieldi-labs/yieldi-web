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
    vultisig?: any;
  }
}

export {};

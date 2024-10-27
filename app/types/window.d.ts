declare global {
  interface Window {
    xfi?: {
      bitcoin?: any;
      ethereum?: any;
    };
    phantom?: any;
    okxwallet?: any;
    vultisig?: any;
  }
}

export {};

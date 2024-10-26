declare global {
  interface Window {
    xfi?: {
      bitcoin?: any; // You can replace `any` with a more specific type if available
      ethereum?: any; // If XDEFI or other wallets support Ethereum as well
      // Add other supported chains (e.g., litecoin, thorchain, etc.) here
    };
    phantom?: any; // UTXO wallet for Bitcoin
  }
}

export {};

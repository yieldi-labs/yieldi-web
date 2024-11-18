import { GetConnectorsReturnType } from "wagmi/actions";
import {
  connectEVMWallet,
  connectUTXOWallet,
  connectWalletConnect,
} from "./walletConnect";

export interface Wallet {
  id: string;
  name: string;
  connect: () => Promise<string | void>;
}

export const detectWallets = (
  ethConnectors: GetConnectorsReturnType,
): Wallet[] => {
  const wallets: Wallet[] = [];

  // Check for MetaMask
  if (window.ethereum?.isMetaMask) {
    const connector = ethConnectors.find((c) => c.id === "metaMask");
    if (connector) {
      wallets.push({
        id: "metamask",
        name: "MetaMask",
        connect: async () => connectEVMWallet(connector),
      });
    }
  }

  // Check for OKX
  if (window.okxwallet) {
    const connector = ethConnectors.find((c) => c.id === "okx");
    if (connector) {
      wallets.push({
        id: "okx",
        name: "OKX Wallet",
        connect: async () => connectEVMWallet(connector),
      });
    }
  }

  // Check for Trust Wallet
  if (window.ethereum?.isTrust) {
    const connector = ethConnectors.find((c) => c.id === "trust");
    if (connector) {
      wallets.push({
        id: "trust",
        name: "Trust Wallet",
        connect: async () => connectEVMWallet(connector),
      });
    }
  }

  // Check for XDEFI/CTRL
  if (window.xfi) {
    const connector = ethConnectors.find((c) => c.id === "xdefi");
    if (connector) {
      wallets.push({
        id: "xdefi",
        name: "CTRL Wallet",
        connect: async () => connectEVMWallet(connector),
      });
    }
  }

  // Check for Phantom
  if (window.phantom?.ethereum) {
    const connector = ethConnectors.find((c) => c.id === "phantom");
    if (connector) {
      wallets.push({
        id: "phantom",
        name: "Phantom Wallet",
        connect: async () => connectEVMWallet(connector),
      });
    }
  }

  // Add WalletConnect as fallback
  const walletConnectConnector = ethConnectors.find((c) => c.id === "walletConnect");
  if (walletConnectConnector) {
    wallets.push({
      id: "walletconnect",
      name: "WalletConnect",
      connect: async () => connectWalletConnect() as any,
    });
  }

  const seen = new Set();
  const walletsFiltered = wallets.filter((wallet) => {
    const duplicate = seen.has(wallet.id);
    seen.add(wallet.id);
    return !duplicate;
  });

  return walletsFiltered;
};

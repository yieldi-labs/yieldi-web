import { getConnectors } from "@wagmi/core";
import { wagmiConfig } from "./wagmiConfig";
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

const ethConnectors = getConnectors(wagmiConfig);

export const detectWallets = (): Wallet[] => {
  const wallets: Wallet[] = [];

  ethConnectors.forEach((wallet) => {
    const id = wallet.id;
    if (id) {
      switch (id) {
        case "metaMask":
          wallets.push({
            id: "metamask",
            name: "MetaMask",
            connect: async () => connectEVMWallet(wallet),
          });
          break;
        case "walletConnect":
          wallets.push({
            id: "walletconnect",
            name: "WalletConnect",
            connect: async () => connectWalletConnect() as any,
          });
          break;
        case "okx":
          wallets.push({
            id: "okx",
            name: "OKX Wallet",
            connect: async () => connectEVMWallet(wallet),
          });
          break;
        case "trust":
          wallets.push({
            id: "trust",
            name: "Trust Wallet",
            connect: async () => connectEVMWallet(wallet),
          });
          break;
        case "xdefi":
          wallets.push({
            id: "xdefi",
            name: "CTRL Wallet",
            connect: async () => connectEVMWallet(wallet),
          });
          break;
        default:
          break;
      }
    }
  });

  if (window.okxwallet) {
    wallets.push({
      id: "okx-utxo",
      name: "OKX (UTXO)",
      connect: async () =>
        connectUTXOWallet({
          id: "okx-utxo",
          name: "OKX Wallet (UTXO)",
          provider: window.okxwallet.bitcoin,
        }),
    });
  }

  if (window.xfi?.bitcoin)
    wallets.push({
      id: "xdefi-utxo",
      name: "CTRL Wallet (UTXO)",
      connect: async () =>
        connectUTXOWallet({
          id: "xdefi-utxo",
          name: "CTRL Wallet (UTXO)",
          provider: window?.xfi?.bitcoin,
        }),
    });

  if (window.phantom) {
    wallets.push({
      id: "phantom-utxo",
      name: "Phantom Wallet (UTXO)",
      connect: async () =>
        connectUTXOWallet({
          id: "phantom-utxo",
          name: "Phantom Wallet (UTXO)",
          provider: window.phantom,
        }),
    });
  }

  // Filter duplicates
  const seen = new Set();
  const walletsFiltered = wallets.filter((wallet) => {
    const duplicate = seen.has(wallet.id);
    seen.add(wallet.id);
    return !duplicate;
  });

  return walletsFiltered;
};

export const filterWalletsByChain = (
  wallets: Wallet[],
  selectedChain: string
): Wallet[] => {
  switch (selectedChain) {
    case "ethereum":
      return wallets.filter((wallet) =>
        [
          "metamask",
          "trust",
          "okx",
          "phantom",
          "walletconnect",
          "xdefi",
        ].includes(wallet.id)
      );

    case "arbitrum":
    case "avalanche":
    case "bsc":
      return wallets.filter((wallet) =>
        ["metamask", "trust", "okx", "walletconnect", "xdefi"].includes(
          wallet.id
        )
      );

    case "dogechain":
      return wallets.filter((wallet) => ["xdefi"].includes(wallet.id));

    case "bitcoin":
      return wallets.filter((wallet) =>
        ["xdefi-utxo", "phantom-utxo", "okx-utxo"].includes(wallet.id)
      );

    default:
      return [];
  }
};

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
        case "phantom":
          wallets.push({
            id: "phantom",
            name: "Phantom Wallet",
            connect: async () => connectEVMWallet(wallet),
          });
          break;
        default:
          break;
      }
    }
  });

  if (window.vultisig) {
    wallets.push({
      id: "vultisig",
      name: "Vultisig",
      connect: async () => connectEVMWallet(window.vultisig),
    });
  }

  if (window.okxwallet) {
    if (window.okxwallet.bitcoin) {
      wallets.push({
        id: "okx-utxo",
        name: "OKX",
        connect: async () =>
          connectUTXOWallet({
            id: "okx-utxo",
            name: "OKX Wallet",
            provider: window.okxwallet.bitcoin,
          }),
      });
    }
  }

  if (window.phantom) {
    if (window.phantom.bitcoin) {
      wallets.push({
        id: "phantom-utxo",
        name: "Phantom Wallet",
        connect: async () =>
          connectUTXOWallet({
            id: "phantom-utxo",
            name: "Phantom Wallet",
            provider: window.phantom.bitcoin,
          }),
      });
    }

    if (window.phantom.solana) {
      wallets.push({
        id: "phantom-solana",
        name: "Phantom Wallet",
        connect: async () =>
          connectUTXOWallet({
            id: "phantom-solana",
            name: "Phantom Wallet",
            provider: window.phantom.solana,
          }),
      });
    }
  }

  if (window.xfi) {
    if (window.xfi.bitcoincash) {
      wallets.push({
        id: "xdefi-bch",
        name: "CTRL",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-bch",
            name: "CTRL Wallet",
            provider: window?.xfi?.bitcoincash,
          }),
      });
    }

    if (window.xfi.bitcoin) {
      wallets.push({
        id: "xdefi-utxo",
        name: "CTRL",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-utxo",
            name: "CTRL Wallet",
            provider: window?.xfi?.bitcoin,
          }),
      });
    }

    if (window.xfi.dogecoin) {
      wallets.push({
        id: "xdefi-doge",
        name: "CTRL",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-doge",
            name: "CTRL Wallet",
            provider: window?.xfi?.dogecoin,
          }),
      });
    }

    if (window.xfi.litecoin) {
      wallets.push({
        id: "xdefi-ltc",
        name: "CTRL",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-ltc",
            name: "CTRL Wallet",
            provider: window?.xfi?.litecoin,
          }),
      });
    }

    if (window.xfi.mayachain) {
      wallets.push({
        id: "xdefi-maya",
        name: "CTRL Wallet",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-maya",
            name: "CTRL Wallet",
            provider: window?.xfi?.mayachain,
          }),
      });
    }

    if (window.xfi.thorchain) {
      wallets.push({
        id: "xdefi-thorchain",
        name: "CTRL Wallet",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-thorchain",
            name: "CTRL Wallet",
            provider: window?.xfi?.thorchain,
          }),
      });
    }

    // if (window.xfi.solana) {
    //   wallets.push({
    //     id: "xdefi-solana",
    //     name: "CTRL Wallet",
    //     connect: async () =>
    //       connectUTXOWallet({
    //         id: "xdefi-solana",
    //         name: "CTRL Wallet",
    //         provider: window?.xfi?.solana,
    //       }),
    //   });
    // }

    if (window.xfi.keplr) {
      wallets.push({
        id: "xdefi-cosmos",
        name: "CTRL Wallet",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-cosmos",
            name: "CTRL Wallet",
            subchain: "cosmoshub-4",
            provider: window?.xfi?.keplr,
          }),
      });

      wallets.push({
        id: "xdefi-kujira",
        name: "CTRL Wallet",
        connect: async () =>
          connectUTXOWallet({
            id: "xdefi-kujira",
            name: "CTRL Wallet",
            subchain: "kaiyo-1",
            provider: window?.xfi?.keplr,
          }),
      });
    }
  }

  const seen = new Set();
  const walletsFiltered = wallets.filter((wallet) => {
    const duplicate = seen.has(wallet.id);
    seen.add(wallet.id);
    return !duplicate;
  });

  return walletsFiltered;
};

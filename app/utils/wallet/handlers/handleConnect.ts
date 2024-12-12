import { AppKit } from "@reown/appkit/react";

export const connectWallet = async (wallet: any): Promise<any> => {
  try {
    let accounts: any;
    let address = "";

    switch (wallet.id) {
      case "vultisig-thorchain":
      case "vultisig-utxo":
      case "vultisig-bch":
      case "vultisig-doge":
      case "vultisig-ltc":
      case "vultisig-cosmos":
        accounts = [];
        accounts = await wallet.provider.request({
          method: "get_accounts",
        });
        if (accounts.length <= 0) {
          const connectedAcount = await wallet.provider.request({
            method: "request_accounts",
          });
          accounts.push(connectedAcount);
        }
        return {
          provider: wallet.provider,
          address: accounts[0],
        };
      case "xdefi-kujira":
      case "xdefi-cosmos":
        try {
          const chainId = wallet.subchain || "cosmoshub-4";

          if (!window.xfi?.keplr) {
            throw new Error("XDEFI Keplr provider not found");
          }

          // Enable the chain
          await window.xfi.keplr.enable(chainId);

          // Get the offline signer
          const offlineSigner = window.xfi.keplr.getOfflineSigner(chainId);
          const accounts = await offlineSigner.getAccounts();

          if (!accounts || accounts.length === 0) {
            throw new Error("No Cosmos accounts found");
          }

          return {
            provider: window.xfi.keplr,
            address: accounts[0].address,
            offlineSigner,
          };
        } catch (e) {
          console.error("Cosmos connection error:", e);
          throw e;
        }
      case "xdefi-thorchain":
      case "xdefi-maya":
      case "xdefi-bch":
      case "xdefi-doge":
      case "xdefi-ltc":
        address = await new Promise((resolve, reject) => {
          wallet.provider.request(
            { method: "request_accounts", params: [] },
            (error: any, accounts: string[]) => {
              if (error) reject(error);
              else resolve(accounts[0]);
            },
          );
        });

        return {
          provider: wallet.provider,
          address,
        };
      case "xdefi-utxo":
        address = await wallet.provider.getAccounts();
        return {
          provider: wallet.provider,
          address: address[0],
        };
      case "xdefi-solana": {
        const resp = await wallet.provider.connect();

        return {
          provider: wallet.provider,
          address: resp.publicKey.toString(),
        };
      }
      case "phantom-utxo":
        accounts = await wallet.provider.requestAccounts();
        return {
          provider: wallet.provider,
          address: accounts[0].address,
        };
      case "phantom-solana":
        const resp = await wallet.provider.connect();

        return {
          provider: wallet.provider,
          address: resp.publicKey.toString(),
        };
      case "okx-utxo":
        accounts = await wallet.provider.connect();
        return {
          provider: wallet.provider,
          address: accounts.address,
        };
      case "okx-cosmos":
        try {
          const chainId = wallet.subchain || "cosmoshub-4";
          const keplr = window.okxwallet.keplr;

          if (!keplr) {
            throw new Error("OKX Keplr provider not found");
          }

          // Enable the chain
          await keplr.enable(chainId);

          // Get the offline signer
          const offlineSigner = keplr.getOfflineSigner(chainId);
          const accounts = await offlineSigner.getAccounts();

          if (!accounts || accounts.length === 0) {
            throw new Error("No Cosmos accounts found");
          }

          return {
            provider: keplr,
            address: accounts[0].address,
            offlineSigner,
          };
        } catch (e) {
          console.error("Cosmos connection error with OKX:", e);
          throw e;
        }
      default:
        console.warn(`Unknown UTXO wallet: ${wallet.name}`);
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return "";
  }
};

export const connectEVMWallet = async (wallet: any): Promise<any> => {
  try {
    let address = "";

    if (!wallet.connect || wallet.isConnected()) {
      let accounts = [];
      accounts = await wallet.request({ method: "eth_accounts" });
      if (accounts.length <= 0) {
        accounts = await wallet.request({ method: "eth_requestAccounts" });
      }
      address = accounts[0];
    } else {
      const { accounts } = await wallet.connect();
      address = accounts[0];
    }

    return {
      provider: wallet,
      address,
    };
  } catch (error) {
    console.error(`Error connecting to wallet:`, error);
  }
};

export const connectWalletConnect = async (modal: AppKit) => {
  try {
    await modal.open({ view: "Connect" });
    return {};
  } catch (error) {
    console.error("Error connecting with WalletConnect:", error);
    return "";
  }
};

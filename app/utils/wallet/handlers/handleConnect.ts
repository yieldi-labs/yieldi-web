import { getLedgerClient } from "../utxoClients/ledgerClients";
import { ChainKey, WalletKey } from "../constants";
import { getBftLedgerClient } from "../bftClients/ledgerClients";
import { getEvmLedgerClient } from "../evmClients/ledgerClients";
import { getChainInfoFromChainString, switchEvmChain } from "@/utils/chain";

export const connectWallet = async (wallet: {
  id: string;
  provider: any;
  subchain?: string;
  walletId: WalletKey;
}): Promise<any> => {
  let accounts: any;
  let address = "";

  switch (wallet.id) {
    case "vultisig-thorchain":
    case "vultisig-utxo":
    case "vultisig-bch":
    case "vultisig-doge":
    case "vultisig-ltc": {
      accounts = [];
      const requestedAccounts = await wallet.provider.request({
        method: "get_accounts",
      });
      if (requestedAccounts && requestedAccounts.length > 0) {
        accounts = requestedAccounts.filter((account: string | null) => account !== null);
      }
      if (!accounts || accounts.length <= 0) {
        const connectedAcount = await wallet.provider.request({
          method: "request_accounts",
        });
        accounts.push(connectedAcount[0]);
      }
      return {
        provider: wallet.provider,
        address: accounts[0],
      };
    }
    case "vultisig-cosmos": {
      let account = await wallet.provider.request({
        method: "get_accounts",
      });
      if (!account) {
        const connectedAcount = await wallet.provider.request({
          method: "request_accounts",
        });
        account = connectedAcount[0].address;
      }
      return {
        provider: wallet.provider,
        address: account,
      };
    }
    case "xdefi-kujira":
    case "xdefi-cosmos": {
      const chainId = wallet.subchain || "cosmoshub-4";

      if (!wallet.provider) {
        throw new Error("XDEFI Keplr provider not found");
      }

      // Enable the chain
      await wallet.provider.enable(chainId);

      // Get the offline signer
      const offlineSigner = wallet.provider.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("No Cosmos accounts found");
      }

      return {
        provider: window.keplr, // Before conenct important Xdefi can overwrite the provider depends on user preferences so return window.ethereum
        address: accounts[0].address,
        offlineSigner,
      };
    }
    case "okx-cosmos": {
      const chainId = wallet.subchain || "cosmoshub-4";

      if (!wallet.provider) {
        throw new Error("XDEFI Keplr provider not found");
      }

      // Enable the chain
      await wallet.provider.enable(chainId);

      // Get the offline signer
      const offlineSigner = wallet.provider.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("No Cosmos accounts found");
      }

      return {
        provider: window.keplr,
        address: accounts[0].address,
        offlineSigner,
      };
    }
    case "xdefi-thorchain":
    case "xdefi-maya":
    case "xdefi-bch":
    case "xdefi-doge":
    case "xdefi-ltc":
    case "xdefi-utxo":
      address = await new Promise((resolve, reject) => {
        wallet.provider.request(
          { method: "request_accounts", params: [] },
          (error: any, accounts: string[]) => {
            if (error) {
              reject(error);
            } else {
              resolve(accounts[0]);
            }
          },
        );
      });

      return {
        provider: wallet.provider,
        address,
      };
    case "phantom-utxo":
      accounts = await wallet.provider.requestAccounts();
      return {
        provider: wallet.provider,
        address: accounts[0].address,
      };
    case "okx-utxo":
      accounts = await wallet.provider.connect();
      return {
        provider: wallet.provider,
        address: accounts.address,
      };
    case "xdefi-avax":
    case "xdefi-bsc":
    case "xdefi-eth":
    case "xdefi-base":
      const [, chainIdentifier] = wallet.id.split("-");
      const chain = getChainInfoFromChainString(chainIdentifier);

      if (!chain) {
        throw new Error(`Chain not found: ${chainIdentifier}`);
      }

      await switchEvmChain(wallet, chain.chainId as string);

      const currentChainId = await wallet.provider.request({
        method: "eth_chainId",
      });

      // Security measure to avoid sending a transaction through the wrong network
      if (currentChainId.toLowerCase() !== chain.chainId?.toLowerCase()) {
        throw new Error("Incorrect chain conection attempt");
      }
      if (!wallet.provider.connect || wallet.provider.isConnected()) {
        let accounts = [];
        accounts = await wallet.provider.request({ method: "eth_accounts" });
        if (accounts.length <= 0) {
          accounts = await wallet.provider.request({
            method: "eth_requestAccounts",
          });
        }
        address = accounts[0];
      } else {
        const { accounts } = await wallet.provider.connect();
        address = accounts[0];
      }
      return {
        provider: window.ethereum, // Before conenct important Xdefi can overwrite the provider depends on user preferences so return window.ethereum
        address,
      };
    case "metamask-avax":
    case "metamask-bsc":
    case "metamask-eth":
    case "metamask-base":
    case "phantom-avax":
    case "phantom-bsc":
    case "phantom-eth":
    case "okx-avax":
    case "okx-bsc":
    case "okx-eth":
    case "vultisig-avax":
    case "vultisig-bsc":
    case "vultisig-eth":
    case "vultisig-base": {
      const [, chainIdentifier] = wallet.id.split("-");
      const chain = getChainInfoFromChainString(chainIdentifier);

      if (!chain) {
        throw new Error(`Chain not found: ${chainIdentifier}`);
      }

      await switchEvmChain(wallet, chain.chainId as string);

      const currentChainId = await wallet.provider.request({
        method: "eth_chainId",
      });

      // Security measure to avoid sending a transaction through the wrong network
      if (currentChainId.toLowerCase() !== chain.chainId?.toLowerCase()) {
        throw new Error("Incorrect chain conection attempt");
      }
      if (!wallet.provider.connect || wallet.provider.isConnected()) {
        let accounts = [];
        accounts = await wallet.provider.request({ method: "eth_accounts" });
        if (accounts.length <= 0) {
          accounts = await wallet.provider.request({
            method: "eth_requestAccounts",
          });
        }
        address = accounts[0];
      } else {
        const { accounts } = await wallet.provider.connect();
        address = accounts[0];
      }
      return {
        provider: wallet.provider, // Before conenct important Xdefi can overwrite the provider depends on user preferences so return window.ethereum
        address,
      };
    }
    case "walletconnect-avax":
    case "walletconnect-bsc":
    case "walletconnect-eth":
      await wallet.provider.open({ view: "Connect" });
      return {
        provider: wallet.provider,
        address: "",
      };
    case "ledger-eth":
      const clientEth = getEvmLedgerClient(ChainKey.ETHEREUM, wallet.provider);
      const addressEth = await clientEth.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressEth,
      };
    case "ledger-avax":
      const clientAvax = getEvmLedgerClient(
        ChainKey.AVALANCHE,
        wallet.provider,
      );
      const addressAvax = await clientAvax.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressAvax,
      };
    case "ledger-bsc":
      const clientBsc = getEvmLedgerClient(ChainKey.BSCCHAIN, wallet.provider);
      const addressBsc = await clientBsc.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressBsc,
      };
    case "ledger-btc":
      const clientBtc = getLedgerClient(ChainKey.BITCOIN, wallet.provider);
      const addressBtc = await clientBtc.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressBtc,
      };
    case "ledger-bch":
      const clientBch = getLedgerClient(ChainKey.BITCOINCASH, wallet.provider);
      const addressBch = await clientBch.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressBch,
      };
    case "ledger-doge":
      const clientDoge = getLedgerClient(ChainKey.DOGECOIN, wallet.provider);
      const addressDoge = await clientDoge.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressDoge,
      };
    case "ledger-ltc":
      const clientLtc = getLedgerClient(ChainKey.LITECOIN, wallet.provider);
      const addressLtc = await clientLtc.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressLtc,
      };
    case "ledger-thorchain":
      const clientThorchain = getBftLedgerClient(
        ChainKey.THORCHAIN,
        wallet.provider,
      );
      const addressThorchain = await clientThorchain.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressThorchain,
      };
    case "ledger-cosmos":
      const clientCosmos = getBftLedgerClient(
        ChainKey.GAIACHAIN,
        wallet.provider,
      );
      const addressCosmos = await clientCosmos.getAddressAsync();
      return {
        provider: wallet.provider,
        address: addressCosmos,
      };
    default:
      console.error(`Unknown UTXO wallet: ${wallet.id}`);
  }
};

import Eth from "@ledgerhq/hw-app-eth";
import Cosmos from "@ledgerhq/hw-app-cosmos";
import { getLedgerClient } from "../utxoClients/ledgerClients";
import { ChainKey } from "../constants";

export const connectWallet = async (wallet: any): Promise<any> => {
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
        provider: wallet.provider,
        address: accounts[0].address,
        offlineSigner,
      };
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
          }
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
    case "xdefi-solana":
    case "phantom-solana": {
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
    case "okx-utxo":
      accounts = await wallet.provider.connect();
      return {
        provider: wallet.provider,
        address: accounts.address,
      };
    case "xdefi-evm":
    case "metamask-evm":
    case "vultisig-evm":
    case "phantom-evm":
    case "okx-evm":
      address = "";

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
        provider: wallet.provider,
        address,
      };
    case "walletconnect-evm":
      await wallet.provider.open({ view: "Connect" });
      return {
        provider: wallet.provider,
        address: "",
      };
    case "ledger-evm":
      const eth = new Eth(wallet.provider);
      const result = await eth.getAddress("44'/60'/0'/0/0"); // TODO: Use chain ID
      return {
        provider: wallet.provider,
        address: result.address,
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
      const thor = new Cosmos(wallet.provider);
      const { address: thorchainAddress } = await thor.getAddress(
        "44'/931'/0'/0/0",
        "thor"
      );
      return {
        provider: wallet.provider,
        address: thorchainAddress,
      };
    case "ledger-cosmos":
      const cosmos = new Cosmos(wallet.provider);
      const { address: cosmosAddress } = await cosmos.getAddress(
        "44'/118'/0'/0",
        "cosmos",
      );
      return {
        provider: wallet.provider,
        address: cosmosAddress,
      };
    default:
      console.warn(`Unknown UTXO wallet: ${wallet.id}`);
  }
};

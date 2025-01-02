import Btc from "@ledgerhq/hw-app-btc/lib-es/Btc";
import Eth from "@ledgerhq/hw-app-eth";
import Cosmos from "@ledgerhq/hw-app-cosmos";

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
            accounts = await wallet.provider.request({ method: "eth_requestAccounts" });
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
          address: ""
        };
      case "ledger-evm": 
        const eth = new Eth(wallet.provider);
        const result = await eth.getAddress("44'/60'/0'/0/0"); // TODO: Use chain ID
        return {
          provider: wallet.provider,
          address: result.address
        };
      case "ledger-btc": 
        const btc = new Btc({ transport: wallet.provider });
        const { bitcoinAddress } =
        await btc.getWalletPublicKey("84'/0'/0'/0/1", { format: 'bech32', verify: true });
        return {
          provider: wallet.provider,
          address: bitcoinAddress
        };
      case "ledger-bch": 
        const bch = new Btc({ transport: wallet.provider, currency: 'bitcoin_cash' });
        const { bitcoinAddress: bchAddress } =
        await bch.getWalletPublicKey("44'/145'/0'/0/0", { verify: true });
        return {
          provider: wallet.provider,
          address: bchAddress
        };
      case "ledger-doge": 
        const doge = new Btc({ transport: wallet.provider, currency: 'dogecoin' });
        const { bitcoinAddress: dogeAddress } =
        await doge.getWalletPublicKey("44'/3'/0'/0/0", { verify: true });
        return {
          provider: wallet.provider,
          address: dogeAddress
        };
      case "ledger-ltc": 
        const ltc = new Btc({ transport: wallet.provider, currency: 'litecoin' });
        const { bitcoinAddress: ltcAddress } =
        await ltc.getWalletPublicKey("44'/2'/0'/0/0", { verify: true });
        return {
          provider: wallet.provider,
          address: ltcAddress
        };
      case "ledger-thorchain": 
        const cosmos = new Cosmos(wallet.provider);
        const { address: thorchainAddress } = await cosmos.getAddress(
          "44'/931'/0'/0/0",
          "thor",
        );
        address = thorchainAddress;
        return {
          provider: wallet.provider,
          address: thorchainAddress
        };
      default:
        console.warn(`Unknown UTXO wallet: ${wallet.id}`);
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return "";
  }
};

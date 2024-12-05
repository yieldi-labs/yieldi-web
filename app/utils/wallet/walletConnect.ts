import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { Web3Provider } from "@ethersproject/providers";

export const connectUTXOWallet = async (wallet: any): Promise<any> => {
  try {
    let accounts: any;
    let address = "";

    switch (wallet.id) {
      case "vultisig-thorchain":
        accounts = await wallet.provider.request({
          method: "request_accounts",
        });
        return {
          provider: wallet.provider,
          address: accounts,
        };
      case "xdefi-kujira":
      case "xdefi-cosmos":
        await wallet.provider.enable(wallet.subchain);
        const offlineSigner = wallet.provider.getOfflineSigner(wallet.subchain);
        accounts = await offlineSigner.getAccounts();

        return {
          provider: wallet.provider,
          address: accounts[0].address,
        };
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
      default:
        console.warn(`Unknown UTXO wallet: ${wallet.name}`);
    }
  } catch (error) {
    console.error("Error connecting UTXO wallet:", error);
    return "";
  }
};

export const connectEVMWallet = async (wallet: any): Promise<any> => {
  try {
    let address = "";

    if (!wallet.connect) {
      const accounts = await wallet.request({ method: "eth_requestAccounts" });
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

export const connectWalletConnect = async () => {
  try {
    const provider = await EthereumProvider.init({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID as string,
      chains: [1, 42161, 43114, 56],
      showQrModal: true,
    });

    await provider.enable();

    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    return {
      provider: web3Provider,
      address,
    };
  } catch (error) {
    console.error("Error connecting with WalletConnect:", error);
    return "";
  }
};

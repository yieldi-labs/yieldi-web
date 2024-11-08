import { useState, useCallback } from 'react';
import { Chain, WalletOption, createSwapKit, SwapKit, ChainWallet, AssetValue } from '@swapkit/sdk';
import { ThorchainPlugin } from '@swapkit/thorchain';
type SwapKitType = typeof SwapKit;

interface SwapKitWalletState {
  client: SwapKitType | null;
  isConnecting: boolean;
  error: string | null;
}

interface ConnectWalletResult {
  success: boolean;
  address?: string;
  provider?: any;
  error?: string;
  swapKitClient?: SwapKitType;
  allBalances: AssetValue[];
}

export function useSwapKit() {
  const [state, setState] = useState<SwapKitWalletState>({
    client: null,
    isConnecting: false,
    error: null,
  });

  const initializeSwapKit = useCallback(() => {
    if (!state.client) {
      try {
        const swapKitClient = createSwapKit({
          config: {
            stagenet: false,
            covalentApiKey: process.env.NEXT_PUBLIC_COVALENT_API_KEY,
            ethplorerApiKey: process.env.NEXT_PUBLIC_ETHPLORER_API_KEY,
            walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID,
          },
          plugins: {
            ...ThorchainPlugin,
          },
        });
        
        setState(prev => ({ ...prev, client: swapKitClient }));
        return swapKitClient;
      } catch (error) {
        console.error('Failed to initialize SwapKit:', error);
        return null;
      }
    }
    return state.client;
  }, [state.client]);

  const getChainsByWalletType = useCallback((walletType: WalletOption): Chain[] => {
    const chainMappings: Record<WalletOption, Chain[]> = {
      [WalletOption.METAMASK]: [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain],
      [WalletOption.XDEFI]: [Chain.Bitcoin, Chain.Ethereum, Chain.THORChain, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Solana],
      [WalletOption.PHANTOM]: [Chain.Solana, Chain.Ethereum],
      [WalletOption.WALLETCONNECT]: [Chain.Ethereum],
      [WalletOption.LEDGER]: [Chain.Bitcoin, Chain.Ethereum],
      [WalletOption.TREZOR]: [Chain.Bitcoin, Chain.Ethereum],
      [WalletOption.KEYSTORE]: [Chain.Bitcoin, Chain.Ethereum, Chain.THORChain],
      [WalletOption.BRAVE]: [],
      [WalletOption.COINBASE_MOBILE]: [],
      [WalletOption.COINBASE_WEB]: [],
      [WalletOption.EIP6963]: [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain],
      [WalletOption.EXODUS]: [],
      [WalletOption.KEEPKEY]: [],
      [WalletOption.KEEPKEY_BEX]: [],
      [WalletOption.KEPLR]: [],
      [WalletOption.LEAP]: [],
      [WalletOption.LEDGER_LIVE]: [],
      [WalletOption.OKX]: [],
      [WalletOption.OKX_MOBILE]: [],
      [WalletOption.POLKADOT_JS]: [],
      [WalletOption.RADIX_WALLET]: [],
      [WalletOption.TALISMAN]: [],
      [WalletOption.TRUSTWALLET_WEB]: []
    };

    return chainMappings[walletType] || [];
  }, []);

  const connectWallet = useCallback(async (
    walletType: WalletOption,
    provider?: any
  ): Promise<ConnectWalletResult> => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      const client = initializeSwapKit();
      
      if (!client) {
        throw new Error('Failed to initialize SwapKit client');
      }

      const connectChains = getChainsByWalletType(walletType);

      if (connectChains.length === 0) {
        throw new Error('Unsupported wallet type, no chains to connect');
      }

      let result;
      switch (walletType) {
        case WalletOption.METAMASK:
        case WalletOption.EIP6963:
          result = await client.connectEVMWallet(connectChains, walletType, provider);
          break;

        case WalletOption.XDEFI:
          result = await client.connectXDEFI(connectChains);
          break;

        case WalletOption.WALLETCONNECT:
          result = await client.connectWalletconnect(connectChains);
          break;

        case WalletOption.KEYSTORE:
          throw new Error('Keystore connection requires a phrase');

        case WalletOption.LEDGER:
          result = await client.connectLedger(connectChains);
          break;

        case WalletOption.TREZOR:
          result = await client.connectTrezor(connectChains);
          break;

        case WalletOption.PHANTOM:
          if (window.phantom?.solana) {
            throw new Error('Phantom connection not implemented');
          }
          throw new Error('Phantom wallet not detected');

        default:
          console.log(`Unsupported wallet type: ${walletType}`);
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      const connectedWallets = await Promise.all(
        connectChains.map(chain => client.getWalletWithBalance(chain))
      );

      // Get all balances by iterating over connected wallets and getting the wallet.balance array and concatenating them
      const allBalances: AssetValue[] = [];
      for (const wallet of connectedWallets) {
        allBalances.push(...wallet.balance);
      }
      const primaryWallet = connectedWallets[0];

      return {
        success: true,
        address: primaryWallet?.address,
        provider: result,
        swapKitClient: client,
        allBalances: allBalances,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({ ...prev, error: errorMessage }));
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [initializeSwapKit, getChainsByWalletType]);

  const disconnectWallet = useCallback(async () => {
    if (state.client) {
      setState(prev => ({ ...prev, client: null, error: null }));
    }
  }, [state.client]);

  return {
    connectWallet,
    disconnectWallet,
    isConnecting: state.isConnecting,
    error: state.error,
    client: state.client,
  };
}
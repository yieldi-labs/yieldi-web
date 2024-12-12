import { formatUnits, encodeFunctionData, decodeFunctionResult } from "viem";
import ERC20_ABI from "@/hooks/erc20.json";
import { ChainKey, EVM_CHAINS } from "./constants";
import { WalletTokensData } from "../interfaces";
import * as viemChains from "viem/chains";

export const initialWalletTokensData: WalletTokensData = {
    [ChainKey.ARBITRUM]: {},
    [ChainKey.AVALANCHE]: {},
    [ChainKey.BASE]: {},
    [ChainKey.BITCOIN]: {},
    [ChainKey.BITCOINCASH]: {},
    [ChainKey.BLAST]: {},
    [ChainKey.BSCCHAIN]: {},
    [ChainKey.CRONOSCHAIN]: {},
    [ChainKey.DASH]: {},
    [ChainKey.DOGECOIN]: {},
    [ChainKey.DYDX]: {},
    [ChainKey.ETHEREUM]: {},
    [ChainKey.GAIACHAIN]: {},
    [ChainKey.KUJIRA]: {},
    [ChainKey.LITECOIN]: {},
    [ChainKey.MAYACHAIN]: {},
    [ChainKey.OPTIMISM]: {},
    [ChainKey.POLKADOT]: {},
    [ChainKey.POLYGON]: {},
    [ChainKey.SOLANA]: {},
    [ChainKey.SUI]: {},
    [ChainKey.THORCHAIN]: {},
    [ChainKey.TON]: {},
    [ChainKey.ZKSYNC]: {},
  };

export const getERC20TokenInfo = async (
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`,
  ) => {
    try {
      if (tokenAddress === "0x") {
        // Native Balance
        const balanceHex = await provider.request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        });
        const balanceBigInt = BigInt(balanceHex);
        const balance = Number(formatUnits(balanceBigInt, 18));
        return { balance };
      } else {
        // Encode function calls
        const nameData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "name",
        });

        const symbolData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "symbol",
        });

        const decimalsData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "decimals",
        });

        const balanceData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [walletAddress],
        });

        // Make parallel RPC calls
        const [nameHex, symbolHex, decimalsHex, balanceHex] = await Promise.all(
          [
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: nameData }, "latest"],
            }),
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: symbolData }, "latest"],
            }),
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: decimalsData }, "latest"],
            }),
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: balanceData }, "latest"],
            }),
          ],
        );
        // Decode results
        const name = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "name",
          data: nameHex,
        }) as string;

        const symbol = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "symbol",
          data: symbolHex,
        }) as string;

        const decimals = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "decimals",
          data: decimalsHex,
        }) as number;

        const balanceBigInt = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          data: balanceHex,
        }) as bigint;
        const balance = Number(formatUnits(balanceBigInt, Number(decimals)));

        return { name, symbol, decimals, balance };
      }
    } catch (err) {
      console.error(err);
    }
  };

export const checkAndSwitchChain = async (
    chainKey: ChainKey,
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`,
  ): Promise<
    | {
        balance: number;
        name?: undefined;
        symbol?: undefined;
        decimals?: undefined;
      }
    | {
        name: string;
        symbol: string;
        decimals: number;
        balance: number;
      }
  > => {
    let providerChainId = await provider.request({
      method: "eth_chainId",
    });
    const currentChain = EVM_CHAINS.find(
      ({ chainId }) => chainId == providerChainId,
    );
    if (currentChain?.name !== chainKey) {
      try {
        providerChainId = await provider.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: EVM_CHAINS.find(({ name }) => name == chainKey)?.chainId,
            },
          ],
        });
        if (providerChainId) {
          checkAndSwitchChain(chainKey, walletAddress, provider, tokenAddress);
        }
      } catch (err) {
        // need to add chain

        if ((err as { code: number }).code === 4902) {
          const chainId = EVM_CHAINS.find(
            ({ name }) => name == chainKey,
          )?.chainId;
          const config = getChainConfigById(chainId!);
          const addRequest = {
            chainId: chainId,
            chainName: config?.name,
            rpcUrls: config?.rpcUrls.default.http,
            iconUrls: [],
            nativeCurrency: config?.nativeCurrency,
            blockExplorerUrls: config?.blockExplorers?.default.url,
          };

          if (chainId) {
            providerChainId = await provider.request({
              method: "wallet_addEthereumChain",
              params: [addRequest],
            });
            if (providerChainId) {
              checkAndSwitchChain(
                chainKey,
                walletAddress,
                provider,
                tokenAddress,
              );
            }
          }
        }
      }
    }

    const tokenInfo = await getERC20TokenInfo(
      walletAddress,
      provider,
      tokenAddress,
    );
    if (!tokenInfo) {
      throw new Error("Failed to fetch token info");
    }
    return tokenInfo;
  };

const getChainConfigById = (chainId: string) => {
    return Object.values(viemChains).find(
      (chain) => chain.id === Number(chainId),
    );
  };

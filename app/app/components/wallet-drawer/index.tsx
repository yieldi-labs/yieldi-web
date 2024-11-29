"use client";
import {
  cloneElement,
  FC,
  useEffect,
  useState,
} from "react";
import { formatNumber } from "@/app/utils";
import Image from "next/image";
import {
  Copy,
  Exit,
  Eye,
  LinkExternal,
  Plus,
  QRCode,
  Synchronize,
} from "@/svg/icons";
import MiddleTruncate from "@/app/components/middle-truncate";
import { useAppState } from "@/utils/context";
import ERC20_ABI from "@/hooks/erc20.json";
import {
  ChainKey,
  EVM_CHAINS,
  SUPPORTED_WALLETS,
} from "@/utils/wallet/constants";
import {
  getAssetSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
} from "@/app/utils";
import {
  decodeFunctionResult,
  encodeFunctionData,
  formatUnits,
} from "viem";
import { getPools } from "@/midgard";
import { Network } from "@xchainjs/xchain-client";
import {
  Client as BitcoinClient,
  defaultBTCParams,
} from "@xchainjs/xchain-bitcoin";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";

type TokenData = {
  asset: string;
  name?: string;
  balance: number;
  formattedBalance?: number;
  decimals?: number;
  symbol?: string;
  chainName?: string;
};

type WalletTokensData = Record<ChainKey, TokenData[]>;

const Component: FC = () => {
  const {
    walletsState,
    isWalletDrawerOpen,
    toggleWalletDrawer,
    toggleWalletModal,
    getChainKeyFromChain,
  } = useAppState();

  const initialWalletTokensData: WalletTokensData = {
    [ChainKey.ETHEREUM]: [],
    [ChainKey.BITCOIN]: [],
    [ChainKey.DOGECOIN]: [],
    [ChainKey.ARBITRUM]: [],
    [ChainKey.AVALANCHE]: [],
    [ChainKey.BASE]: [],
    [ChainKey.BITCOINCASH]: [],
    [ChainKey.BLAST]: [],
    [ChainKey.BSCCHAIN]: [],
    [ChainKey.CRONOSCHAIN]: [],
    [ChainKey.DASH]: [],
    [ChainKey.DYDX]: [],
    [ChainKey.GAIACHAIN]: [],
    [ChainKey.KUJIRA]: [],
    [ChainKey.LITECOIN]: [],
    [ChainKey.MAYACHAIN]: [],
    [ChainKey.OPTIMISM]: [],
    [ChainKey.POLKADOT]: [],
    [ChainKey.POLYGON]: [],
    [ChainKey.SOLANA]: [],
    [ChainKey.SUI]: [],
    [ChainKey.THORCHAIN]: [],
    [ChainKey.TON]: [],
    [ChainKey.ZKSYNC]: [],
  };

  const [walletTokensData, setWalletTokensData] = useState<WalletTokensData>(
    initialWalletTokensData
  );

  const handleAddWallet = () => {
    toggleWalletModal();
    toggleWalletDrawer();
  };

  useEffect(() => {
    if (!walletsState) return;

    const fetchWalletBalances = async () => {
      try {
        const updatedTokensData: WalletTokensData = {
          ...initialWalletTokensData,
        };

        const addTokenData = (chainKey: ChainKey, tokenData: TokenData) => {
          updatedTokensData[chainKey] = [
            ...(updatedTokensData[chainKey] || []),
            tokenData,
          ];
        };

        const fetchNativeBalances = async (poolAsset: string) => {
          const chainKey = getChainKeyFromChain(poolAsset.split(".")[0]);

          const wallet = walletsState[chainKey as ChainKey];
          if (wallet?.address && wallet?.provider) {
            try {
              const info = await getERC20TokenInfo(
                chainKey,
                walletsState[chainKey].address,
                walletsState[chainKey].provider
              );
              if (info) {
                addTokenData(chainKey as ChainKey, {
                  name: chainKey,
                  symbol: poolAsset.split(".")[0],
                  decimals: 18,
                  balance: parseFloat(info.balance.toString()),
                  asset: poolAsset,
                  chainName: "Native",
                });
              }
            } catch (error) {
              console.error(
                `Error fetching native balance for ${chainKey}:`,
                error
              );
            }
          }
        };

        const fetchPoolTokens = async () => {
          const { data: pools } = await getPools({
            query: { period: "30d", status: "available" },
          });

          if (!pools) return;

          const fetchPromises = pools.map(async (pool: any) => {
            const assetType = pool.asset.split(".")[0].toLowerCase();

            if (isERC20(pool.asset)) {
              const poolViemAddress = pool.asset.split(".")[1].split("-")[1];
              const chainKey = getChainKeyFromChain(pool.asset.split(".")[0]);
              const tokenAddress = normalizeAddress(poolViemAddress!);

              if (
                tokenAddress &&
                walletsState[chainKey]?.address &&
                walletsState[chainKey]?.provider
              ) {
                const info = await getERC20TokenInfo(
                  chainKey,
                  walletsState[chainKey].address,
                  walletsState[chainKey].provider,
                  tokenAddress
                );
                if (info && info.balance > 0) {
                  addTokenData(chainKey, {
                    ...info,
                    asset: pool.asset,
                    balance: info.balance,
                    chainName: pool.asset.split(".")[0],
                  });
                }
              }
            } else if (assetType === "btc" || assetType === "doge") {
              const chainKey =
                assetType === "btc" ? ChainKey.BITCOIN : ChainKey.DOGECOIN;
              if (walletsState[chainKey]?.address) {
                const info = await getUTXOInfo(
                  chainKey,
                  walletsState[chainKey].address
                );
                if (info) {
                  addTokenData(chainKey, {
                    ...info,
                    asset: pool.asset,
                    symbol: chainKey,
                    chainName: pool.asset.split(".")[0],
                    balance: info.formattedBalance,
                    formattedBalance: info.formattedBalance,
                  });
                }
              }
            } else if (walletsState[getChainKeyFromChain(assetType)]) {
              await fetchNativeBalances(pool.asset);
            }
          });

          await Promise.all(fetchPromises);
        };
        await fetchPoolTokens();
        setWalletTokensData({ ...updatedTokensData });
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
      }
    };

    fetchWalletBalances();
  }, [walletsState]);

  const getERC20TokenInfo = async (
    chainKey: ChainKey,
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`
  ) => {
    try {
      let providerChainId = await provider.request({
        method: "eth_chainId",
      });
      const currentChain = EVM_CHAINS.find(
        ({ chainId }) => chainId == providerChainId
      );
      if (currentChain?.name != chainKey) {
        providerChainId = await provider.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: EVM_CHAINS.find(({ name }) => name == chainKey)?.chainId,
            },
          ],
        });
        return getERC20TokenInfo(
          chainKey,
          walletAddress,
          provider,
          tokenAddress
        );
      }
      if (!tokenAddress) {
        // Fetch native ETH balance
        const balanceHex = await provider.request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        });
        const balanceBigInt = BigInt(balanceHex);
        const balance = Number(formatUnits(balanceBigInt, 18));
        return { name: "Ethereum", symbol: "ETH", decimals: 18, balance };
      }

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
      const [nameHex, symbolHex, decimalsHex, balanceHex] = await Promise.all([
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
      ]);
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
    } catch (err) {
      console.log(err);
    }
    return null;
  };

  const getUXTOClient = (chainKey: ChainKey) => {
    try {
      const commonConfig = {
        network: Network.Mainnet,
        phrase: "",
      };

      switch (chainKey) {
        case ChainKey.BITCOIN:
          return new BitcoinClient({
            ...defaultBTCParams,
            ...commonConfig,
          });
        case ChainKey.DOGECOIN:
          return new DogeClient({
            ...defaultDogeParams,
            ...commonConfig,
          });
        default:
          throw new Error(`Unsupported UTXO chain: ${chainKey}`);
      }
    } catch (err) {
      console.error(`Error initializing ${chainKey} client:`, err);
      return null;
    }
  };

  const getUTXOInfo = async (chainKey: ChainKey, walletAddress: string) => {
    if (!walletsState) return;
    if (!walletsState[chainKey]?.provider) return null;
    const client = getUXTOClient(chainKey);
    const getBalance = async (address: string) => {
      if (!client) throw new Error(`${chainKey} client not initialized`);
      try {
        const res = await client.getBalance(address);
        const balance = res[0];
        const balanceAmount = balance.amount.amount();
        const balanceBigInt = BigInt(balanceAmount.toString());
        const formattedBalance = Number(formatUnits(balanceBigInt, 8));
        return { balanceAmount, balanceBigInt, formattedBalance };
      } catch (err) {
        console.error(`Error getting ${chainKey} balance:`, err);
        throw err;
      }
    };
    return await getBalance(walletAddress);
  };

  return (
    isWalletDrawerOpen && (
      <>
        <div
          className="bg-[rgba(0,0,0,0.5)] fixed h-full inset-0 z-20"
          onClick={toggleWalletDrawer}
        />
        <div className="bg-secondary border-b-4 border-l-4 border-t-4 border-white fixed h-full right-0 rounded-l-large top-0 w-[360px] z-20">
          <div className="border-b flex py-4">
            <span className="flex-1 font-bold leading-6 px-4 text-2xl">
              Wallet
            </span>
            <span className="border-r cursor-pointer px-2">
              <Eye strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="border-r cursor-pointer px-2">
              <Synchronize strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span
              className="border-r cursor-pointer px-2"
              onClick={handleAddWallet}
            >
              <Plus strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="cursor-pointer px-2">
              <Exit strokeColor="#ff6656" strokeWidth={1.5} />
            </span>
          </div>
          {Object.keys(walletsState!).map((key) => {
            const wallet = walletsState![key];
            return (
              <div key={wallet.walletId} className="p-4">
                <div className="bg-white flex gap-2 rounded-lg p-4">
                  <span className="leading-6">
                    {cloneElement(SUPPORTED_WALLETS[wallet.walletId].icon, {
                      className: "icon",
                    })}
                  </span>
                  <span className="flex-1 leading-6 px-2">
                    <MiddleTruncate text={wallet.address} />
                  </span>
                  <span className="cursor-pointer">
                    <Copy strokeColor="#627eea" />
                  </span>
                  <span className="cursor-pointer">
                    <QRCode strokeColor="#627eea" />
                  </span>
                  <span className="cursor-pointer">
                    <LinkExternal strokeColor="#627eea" />
                  </span>
                  <span className="cursor-pointer -mr-1">
                    <Exit strokeColor="#ff6656" />
                  </span>
                </div>
                {walletTokensData &&
                  walletTokensData[key as ChainKey].map((token: TokenData) => (
                    <div
                      key={token.chainName + token.asset}
                      className="px-2 py-4"
                    >
                      <div className="flex gap-2 items-center">
                        <Image
                          src={getLogoPath(token.asset)}
                          alt={`${getAssetSymbol(token.asset)} logo`}
                          width={26}
                          height={26}
                          className="rounded-full"
                        />
                        <div className="flex flex-1 flex-col">
                          <span className="font-bold leading-5">
                            {token.symbol}
                          </span>
                          <span className="leading-4 text-gray-500">
                            {token.chainName}
                          </span>
                        </div>
                        <span className="font-bold">
                          {formatNumber(token.balance, 6) ||
                            formatNumber(token.formattedBalance!, 6)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </>
    )
  );
};

export default Component;

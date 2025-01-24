import { useState, useCallback, useMemo } from "react";
import { useAppState } from "@/utils/contexts/context";
import type { PoolDetail } from "@/midgard";
import { normalizeAddress } from "@/app/utils";
import { Address, parseUnits } from "viem";
import { useContracts } from "./useContracts";
import { useUTXO } from "./useUTXO";
import { useThorchain } from "./useThorchain";
import {
  validateInboundAddress,
  switchEvmChain,
  getSupportedChainByAssetChain,
  getMinAmountByChain,
  getLiquidityMemo,
  getChainKeyFromChain,
  isChainType,
} from "@/utils/chain";
import { ChainKey } from "@/utils/wallet/constants";
import { useCosmos } from "./useCosmos";
import {
  Asset,
  assetAmount,
  assetFromString,
  assetToBase,
} from "@xchainjs/xchain-util";
import { inboundAddresses } from "@/thornode";
import { ChainType } from "@/utils/interfaces";

interface AddLiquidityParams {
  asset: string;
  assetDecimals: number;
  amount: number;
  runeAmount?: number;
  pairedAddress?: string;
  affiliate?: string;
  feeBps?: number;
}

interface RemoveLiquidityParams {
  asset: string;
  assetDecimals: number;
  percentage: number;
  address: string;
  withdrawAsset?: string;
}

interface UseLiquidityPositionProps {
  pool: PoolDetail;
}

const affiliate = "yi";
const feeBps = 0;

export function useLiquidityPosition({ pool }: UseLiquidityPositionProps) {
  const { walletsState } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thorChainClient = useThorchain({
    wallet: walletsState![ChainKey.THORCHAIN],
  });
  const { transfer: cosmosTransfer } = useCosmos({
    wallet: walletsState![ChainKey.GAIACHAIN],
  });

  const parsedAsset = assetFromString(pool.asset);

  if (!parsedAsset) {
    throw new Error("Invalid asset");
  }

  // Check if it's a native asset
  const isNativeAsset = useMemo(
    () => parsedAsset.symbol.indexOf("-") === -1,
    [parsedAsset],
  );

  // Get token address for non-native assets
  const tokenAddress = useMemo(() => {
    if (isNativeAsset) return undefined;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, addressPart] = parsedAsset.symbol.split("-");
      return addressPart
        ? (normalizeAddress(addressPart) as Address)
        : undefined;
    } catch (err) {
      console.error("Failed to parse token address:", err);
      return undefined;
    }
  }, [parsedAsset, isNativeAsset]);

  const getAssetWallet = useCallback(
    (asset: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const parsedAsset = assetFromString(asset);
      return walletsState![getChainKeyFromChain((parsedAsset as Asset).chain)];
    },
    [walletsState],
  );

  const { approveSpending, getAllowance, depositWithExpiry } = useContracts({
    wallet: getAssetWallet(pool.asset),
    tokenAddress: tokenAddress as Address | undefined,
    assetId: pool.asset,
  });

  // Initialize UTXO hooks if needed
  const {
    addLiquidity: addUTXOLiquidity,
    removeLiquidity: removeUTXOLiquidity,
  } = useUTXO({
    chain: isChainType(ChainType.UTXO, parsedAsset),
    wallet: isChainType(ChainType.UTXO, parsedAsset)
      ? getAssetWallet(pool.asset)
      : null,
  });

  const addLiquidity = useCallback(
    async ({
      asset,
      assetDecimals,
      amount,
      pairedAddress,
      runeAmount,
    }: AddLiquidityParams) => {
      if (!getAssetWallet(asset)?.address) {
        throw new Error("Wallet not connected");
      }
      const parsedAsset = assetFromString(asset);
      if (!parsedAsset) {
        throw new Error("Invalid asset");
      }
      try {
        setLoading(true);
        setError(null);

        const wallet = getAssetWallet(asset);
        const memo = getLiquidityMemo(
          "add",
          pool.asset,
          pairedAddress,
          affiliate,
          feeBps,
        );

        // Handle Thorchain deposits
        if (wallet.ChainInfo === ChainKey.THORCHAIN) {
          if (amount === 0 && runeAmount && runeAmount > 0) {
            const result = await thorChainClient.deposit({
              pool,
              recipient: "",
              amount: runeAmount,
              memo: memo,
            });
            return result;
          }
        }

        const inboundAddressesResponse = await inboundAddresses();
        const inbound = inboundAddressesResponse.data?.find(
          (i) => i.chain === parsedAsset.chain.toUpperCase(),
        );
        if (!inbound?.address) {
          throw new Error(`No inbound address found for ${parsedAsset.chain}`);
        } else if (inbound) {
          validateInboundAddress(inbound);
        }

        // Handle Cosmos chain transactions
        if (wallet.ChainInfo === ChainKey.GAIACHAIN) {
          const cosmosAmount = assetToBase(
            assetAmount(amount, parseInt(pool.nativeDecimal)),
          )
            .amount()
            .toNumber();
          return await cosmosTransfer(inbound.address, cosmosAmount, memo);
        }

        // Handle UTXO chain transactions
        if (isChainType(ChainType.UTXO, parsedAsset)) {
          return await addUTXOLiquidity({
            pool,
            vault: inbound.address,
            amount: amount,
            memo: memo,
          });
        }

        // Handle EVM chain transactions
        await switchEvmChain(wallet, parsedAsset?.chain || "");

        const routerAddress = inbound.router
          ? normalizeAddress(inbound.router)
          : undefined;
        if (!routerAddress) throw new Error("Router address not found");
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes

        // Handle token or native asset deposit
        let txHash;

        if (isChainType(ChainType.EVM, parsedAsset)) {
          if (!isNativeAsset && tokenAddress) {
            // Handle ERC20 token deposit

            const parsedAmount = BigInt(
              assetToBase(assetAmount(amount, assetDecimals))
                .amount()
                .toNumber(),
            );

            // Check and handle allowance
            const currentAllowance = await getAllowance(routerAddress);
            if (currentAllowance < parsedAmount) {
              await approveSpending(
                routerAddress,
                tokenAddress,
                assetDecimals,
                parsedAmount,
              );
            }

            txHash = await depositWithExpiry(
              routerAddress,
              vaultAddress,
              tokenAddress,
              assetDecimals,
              parsedAmount,
              memo,
              expiry,
            );
          } else {
            const parsedAmount = parseUnits(amount.toString(), 18);
            txHash = await depositWithExpiry(
              routerAddress,
              vaultAddress,
              "0x0000000000000000000000000000000000000000",
              assetDecimals,
              parsedAmount,
              memo,
              expiry,
            );
          }
        }

        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      getAssetWallet,
      pool,
      thorChainClient,
      cosmosTransfer,
      addUTXOLiquidity,
      isNativeAsset,
      tokenAddress,
      getAllowance,
      depositWithExpiry,
      approveSpending,
    ],
  );

  const removeLiquidity = useCallback(
    async ({
      asset,
      assetDecimals,
      percentage,
      withdrawAsset,
    }: RemoveLiquidityParams) => {
      const wallet = getAssetWallet(asset);
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }
      const parsedAsset = assetFromString(asset);
      if (!parsedAsset) {
        throw new Error("Invalid asset");
      }
      try {
        setLoading(true);
        setError(null);

        const inboundAddressesData = await inboundAddresses();

        const supportedChain = getSupportedChainByAssetChain(
          parsedAsset?.chain || "",
        );
        if (!supportedChain) {
          throw new Error(`Chain not supported: ${parsedAsset?.chain}`);
        }
        const memo = getLiquidityMemo(
          "remove",
          pool.asset,
          undefined,
          undefined,
          undefined,
          percentage,
          withdrawAsset,
        );

        // Handle Thorchain withdrawals
        if (wallet.ChainInfo === ChainKey.THORCHAIN) {
          const amount = getMinAmountByChain(supportedChain);
          return await thorChainClient.deposit({
            pool,
            recipient: "",
            amount: amount,
            memo: memo,
          });
        }

        const inbound = inboundAddressesData.data?.find(
          (i) => i.chain === parsedAsset.chain.toUpperCase(),
        );
        if (!inbound?.address) {
          throw new Error(`No inbound address found for ${parsedAsset?.chain}`);
        } else if (inbound) {
          validateInboundAddress(inbound);
        }

        // Handle Cosmos chain withdrawals
        if (wallet.ChainInfo === ChainKey.GAIACHAIN) {
          const cosmosAmount = assetToBase(
            assetAmount(
              getMinAmountByChain(supportedChain),
              parseInt(pool.nativeDecimal),
            ),
          )
            .amount()
            .toNumber();

          return await cosmosTransfer(inbound.address, cosmosAmount, memo);
        }

        // Handle UTXO chain withdrawals
        if (isChainType(ChainType.UTXO, parsedAsset)) {
          return await removeUTXOLiquidity({
            pool,
            vault: inbound.address,
            amount: getMinAmountByChain(supportedChain),
            memo: memo,
          });
        }

        await switchEvmChain(wallet, parsedAsset.chain || "");

        const routerAddress = inbound.router
          ? normalizeAddress(inbound.router)
          : undefined;
        if (!routerAddress) throw new Error("Router address not found");
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300);

        // Use base unit amount for withdrawal transaction
        const decimals = parseInt(pool.nativeDecimal);
        const minAmountByChain =
          getMinAmountByChain(supportedChain) * 10 ** decimals;
        const txHash = await depositWithExpiry(
          routerAddress,
          vaultAddress,
          "0x0000000000000000000000000000000000000000",
          assetDecimals,
          BigInt(minAmountByChain),
          memo,
          expiry,
        );

        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      getAssetWallet,
      pool,
      depositWithExpiry,
      thorChainClient,
      cosmosTransfer,
      removeUTXOLiquidity,
    ],
  );

  return {
    loading,
    error,
    pool,
    addLiquidity,
    removeLiquidity,
    getAssetWallet,
  };
}

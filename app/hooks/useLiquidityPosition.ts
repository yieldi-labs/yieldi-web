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
  getChainInfoFromChainString,
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
import { ChainType } from "@/utils/interfaces";

export enum LpSubstepsAddLiquidity {
  APRROVE_DEPOSIT_ASSET = "APRROVE_DEPOSIT_ASSET",
  BROADCAST_DEPOSIT_ASSET = "BROADCAST_DEPOSIT_ASSET",
  BROADCAST_DEPOSIT_RUNE = "BROADCAST_DEPOSIT_RUNE",
}

interface AddLiquidityParams {
  asset: string;
  assetDecimals: number;
  amount: number;
  runeAmount?: number;
  pairedAddress?: string;
  affiliate?: string;
  feeBps?: number;
  emitNewHash: (txHash: string, step: LpSubstepsAddLiquidity) => void;
  emitError: (error: string) => void;
}

interface RemoveLiquidityParams {
  assetIdToStartAction: string;
  percentage: number;
  address: string;
  withdrawAsset?: string;
}

interface UseLiquidityPositionProps {
  pool: PoolDetail;
}

let affiliate = "yi";
if (process.env.NEXT_PUBLIC_IS_STAGENET) {
  affiliate = ""; // TODO: Register affiliate on stagenet
}
const feeBps = 0;

export function useLiquidityPosition({ pool }: UseLiquidityPositionProps) {
  const { walletsState, inboundAddresses } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thorChainClient = useThorchain({
    wallet: walletsState![ChainKey.THORCHAIN],
  });
  const { transfer: cosmosTransfer } = useCosmos({
    wallet: walletsState![ChainKey.GAIACHAIN],
  });

  const parsedAsset = assetFromString(pool.asset); // TODO: Remove duplicity between parameters in removeliquidity addliquidity functions and hook parameters

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
      emitNewHash,
      emitError,
    }: AddLiquidityParams) => {
      if (!getAssetWallet(asset)?.address) {
        emitError("Wallet not connected");
        throw new Error("Wallet not connected");
      }
      const parsedAsset = assetFromString(asset);
      if (!parsedAsset) {
        emitError("Invalid asset");
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
              amount: runeAmount,
              memo: memo,
            });
            if (!result) {
              emitError("Failed to add liquidity to Thorchain");
              throw new Error("Failed to add liquidity to Thorchain");
            }
            emitNewHash(result, LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_RUNE);
            return result;
          }
        }

        const inbound = inboundAddresses?.find(
          (i) => i.chain === parsedAsset.chain.toUpperCase(),
        );
        if (!inbound?.address) {
          emitError(`No inbound address found for ${parsedAsset.chain}`);
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
          const bftHash = await cosmosTransfer(
            inbound.address,
            cosmosAmount,
            memo,
          );
          if (!bftHash) {
            emitError("Failed to add liquidity to Cosmos chain");
            throw new Error("Failed to add liquidity to Cosmos chain");
          }
          emitNewHash(bftHash, LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET);
          return bftHash;
        }

        // Handle UTXO chain transactions
        if (isChainType(ChainType.UTXO, parsedAsset)) {
          const utxoHash = await addUTXOLiquidity({
            asset: assetFromString(asset) as Asset,
            assetDecimals,
            vault: inbound.address,
            amount: amount,
            memo: memo,
          });
          if (!utxoHash) {
            emitError("Failed to add liquidity to UTXO chain");
            throw new Error("Failed to add liquidity to UTXO chain");
          }
          emitNewHash(utxoHash, LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET);
          return utxoHash;
        }

        const routerAddress = inbound.router
          ? normalizeAddress(inbound.router)
          : undefined;
        if (!routerAddress) {
          emitError("Router address not found no router adddress");
          throw new Error("Router address not found no router adddress");
        }
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes

        // Handle token or native asset deposit
        let txHash;

        const chainInfo = getChainInfoFromChainString(parsedAsset.chain);
        const chainId = chainInfo?.chainId as string;

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
              const resultApproveHash = await approveSpending(
                routerAddress,
                tokenAddress,
                assetDecimals,
                chainId,
                parsedAmount,
              );
              if (!resultApproveHash) {
                emitError("Failed to approve");
                throw new Error("Failed to approve");
              }
              emitNewHash(
                resultApproveHash,
                LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET,
              );
            }
            emitNewHash("-", LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET);
            txHash = await depositWithExpiry(
              routerAddress,
              vaultAddress,
              tokenAddress,
              assetDecimals,
              parsedAmount,
              memo,
              expiry,
              chainId,
            );
            if (!txHash) {
              emitError("Failed to add liquidity to EVM chain");
              throw new Error("Failed to add liquidity to EVM chain");
            }
            emitNewHash(txHash, LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET);
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
              chainId,
            );
            if (!txHash) {
              emitError("Failed to add liquidity to EVM chain");
              throw new Error("Failed to add liquidity to EVM chain");
            }
            emitNewHash(txHash, LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET);
          }
        }

        return txHash;
      } catch (err) {
        console.error("Failed to add liquidity:", err);
      } finally {
        setLoading(false);
      }
    },
    [getAssetWallet, pool, inboundAddresses, thorChainClient, cosmosTransfer, addUTXOLiquidity, isNativeAsset, tokenAddress, getAllowance, depositWithExpiry, approveSpending],
  );

  const removeLiquidity = useCallback(
    async ({
      assetIdToStartAction, // Rune or assets depends on position type
      percentage,
      withdrawAsset,
    }: RemoveLiquidityParams) => {
      try {
        const wallet = getAssetWallet(assetIdToStartAction);
        if (!wallet?.address) {
          throw new Error("Wallet not connected");
        }
        const assetIdToStartActionParsed =
          assetFromString(assetIdToStartAction);
        if (!assetIdToStartActionParsed) {
          throw new Error("Invalid asset");
        }

        setLoading(true);
        setError(null);

        const selectedChainToStartAction = getChainInfoFromChainString(
          assetIdToStartActionParsed?.chain || "",
        );
        if (!selectedChainToStartAction) {
          throw new Error(
            `Chain not supported: ${assetIdToStartActionParsed?.chain}`,
          );
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
          const amount = getMinAmountByChain(
            selectedChainToStartAction.thorchainIdentifier,
            inboundAddresses
          ); // TODO: Handle decimals
          return await thorChainClient.deposit({
            amount: amount,
            memo: memo,
          });
        }

        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetIdToStartActionParsed.chain.toUpperCase(),
        );

        if (!inbound?.address) {
          throw new Error(
            `No inbound address found for ${assetIdToStartActionParsed.chain}`,
          );
        }

        validateInboundAddress(inbound);

        // Handle Cosmos chain withdrawals
        if (wallet.ChainInfo === ChainKey.GAIACHAIN) {
          const cosmosAmount = assetToBase(
            assetAmount(
              getMinAmountByChain(
                selectedChainToStartAction.thorchainIdentifier,
                inboundAddresses
              ),
              selectedChainToStartAction.nativeDecimals,
            ),
          )
            .amount()
            .toNumber();

          return await cosmosTransfer(inbound.address, cosmosAmount, memo);
        }

        // Handle UTXO chain withdrawals
        if (isChainType(ChainType.UTXO, assetIdToStartActionParsed)) {
          return await removeUTXOLiquidity({
            asset: assetIdToStartActionParsed as Asset,
            assetDecimals: selectedChainToStartAction.nativeDecimals,
            vault: inbound.address,
            amount: getMinAmountByChain(
              selectedChainToStartAction.thorchainIdentifier,
              inboundAddresses
            ), // TODO: Handle decimals
            memo: memo,
          });
        }

        const routerAddress = inbound.router
          ? normalizeAddress(inbound.router)
          : undefined;
        if (!routerAddress) throw new Error("Router address not found");
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300);

        // Use base unit amount for withdrawal transaction
        const decimals = selectedChainToStartAction.nativeDecimals;
        const minAmountByChain = getMinAmountByChain(selectedChainToStartAction.thorchainIdentifier, inboundAddresses)
        const minAmountInBase = assetToBase(assetAmount(minAmountByChain, decimals)).amount().toNumber();
        const txHash = await depositWithExpiry(
          routerAddress,
          vaultAddress,
          "0x0000000000000000000000000000000000000000",
          decimals,
          BigInt(minAmountInBase),
          memo,
          expiry,
          selectedChainToStartAction.chainId as string,
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
    [getAssetWallet, pool.asset, inboundAddresses, depositWithExpiry, thorChainClient, cosmosTransfer, removeUTXOLiquidity],
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

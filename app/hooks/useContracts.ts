import { useState, useCallback } from "react";
import { encodeFunctionData, Address, decodeFunctionResult } from "viem";
import ERC20_ABI from "./erc20.json";
import ROUTER_ABI from "./routerABI.json";
import { useAppState } from "@/utils/contexts/context";
import { assetFromString, baseAmount } from "@xchainjs/xchain-util";
import { getChainKeyFromChain } from "@/utils/chain";
import {
  TransactionEvmParams,
  transferEvm,
} from "@/utils/wallet/handlers/handleTransfer";
import { WalletState } from "@/utils/interfaces";
import { constants } from "ethers";
import { infuraRequest } from "@/infura/client";

interface UseContractProps {
  wallet: WalletState;
  tokenAddress?: Address;
  assetId: string;
}

async function waitForTransaction(
  wallet: WalletState,
  txHash: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await infuraRequest(
          wallet.chainType,
          "eth_getTransactionReceipt",
          [txHash],
        );

        if (receipt) {
          if (receipt.status === "0x1" || receipt.status === 1) {
            // TODO: Clarify this discrepancies between wallets (Crtl / Vulticonnect)
            resolve(txHash);
          }
        } else {
          setTimeout(checkReceipt, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };
    checkReceipt();
  });
}

export function useContracts({
  wallet,
  tokenAddress,
  assetId,
}: UseContractProps) {
  const [error, setError] = useState<string>();

  const { walletsState, balanceList } = useAppState();
  const asset = assetFromString(assetId);
  if (!asset) {
    throw Error("Invalid asset");
  }

  const chainKey = getChainKeyFromChain(asset?.chain);
  const walletAddress = walletsState[chainKey]?.address;
  const balance = balanceList?.[chainKey]?.[assetId]?.balance || 0;

  // ERC20 Functions
  const getAllowance = useCallback(
    async (spender: Address): Promise<bigint> => {
      if (!tokenAddress || !walletAddress) return BigInt(0);

      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress, spender],
        });

        const result = await infuraRequest(wallet.chainType, "eth_call", [
          {
            to: tokenAddress,
            data,
          },
          "latest",
        ]);

        const allowance = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "allowance",
          data: result,
        }) as bigint;

        return allowance;
      } catch (err) {
        console.error("Error checking allowance:", err);
        return BigInt(0);
      }
    },
    [tokenAddress, wallet.chainType, walletAddress],
  );

  const approveSpending = useCallback(
    async (
      spender: Address,
      asset: Address,
      assetDecimals: number,
      amount: bigint = BigInt(constants.MaxUint256.toString()),
    ) => {
      if (!tokenAddress || !walletAddress) {
        throw new Error("Token address, wallet or provider not available");
      }

      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, amount],
        });

        const transferParams: TransactionEvmParams = {
          from: walletAddress,
          recipient: tokenAddress,
          amount: baseAmount(amount.toString(), assetDecimals),
          assetAddress: asset,
          data: data,
        };

        const hash = await transferEvm(wallet, transferParams);

        return await waitForTransaction(wallet, hash);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to approve token";
        setError(message);
        throw new Error(message);
      }
    },
    [tokenAddress, wallet, walletAddress],
  );

  const depositWithExpiry = useCallback(
    async (
      router: Address,
      vault: Address,
      asset: Address,
      assetDecimals: number,
      amount: bigint,
      memo: string,
      expiration: bigint,
    ) => {
      if (!walletAddress || !wallet.provider) {
        throw new Error("Wallet or provider not available");
      }

      try {
        const data = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "depositWithExpiry",
          args: [vault, asset, amount, memo, expiration],
        });

        const transferParams: TransactionEvmParams = {
          from: walletAddress,
          recipient: router,
          amount: baseAmount(amount.toString(), assetDecimals),
          assetAddress: asset,
          memo: memo,
          data: data,
        };

        const hash = await transferEvm(wallet, transferParams);

        return await waitForTransaction(wallet, hash);
      } catch (err) {
        console.error("Deposit with expiry error:", err);
        const message =
          err instanceof Error ? err.message : "Failed to deposit with expiry";
        setError(message);
        throw new Error(message);
      }
    },
    [wallet, walletAddress],
  );

  return {
    // Token info
    balance,

    // State
    error,

    // ERC20 Functions
    approveSpending,
    getAllowance,

    // Router Functions
    depositWithExpiry,
  };
}

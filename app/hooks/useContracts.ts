import { useState, useCallback } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  parseUnits,
  formatUnits,
  encodeFunctionData,
  Address,
  decodeEventLog,
  decodeFunctionResult,
} from "viem";
import ERC20_ABI from "./erc20.json";
import ROUTER_ABI from "./routerABI.json";

const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

interface UseContractProps {
  tokenAddress?: Address;
  routerAddress?: Address;
  provider?: any;
}

interface TokenMetadata {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
}

async function waitForTransaction(
  provider: any,
  txHash: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });

        if (receipt) {
          if (receipt.status === "0x1") {
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
  tokenAddress,
  routerAddress,
  provider,
}: UseContractProps) {
  const { address: walletAddress } = useAccount();
  const [error, setError] = useState<string>();
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>({
    name: undefined,
    symbol: undefined,
    decimals: undefined,
  });

  // Get token balance
  const { data: balance } = useBalance({
    address: walletAddress,
    token: tokenAddress,
  });

  // Load token metadata
  const loadMetadata = useCallback(async () => {
    if (!tokenAddress || !provider) return;

    try {
      // Name
      const nameData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "name",
      });

      // Symbol
      const symbolData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "symbol",
      });

      // Decimals
      const decimalsData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "decimals",
      });

      const [nameHex, symbolHex, decimalsHex] = await Promise.all([
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
      ]);

      const name = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "name",
        data: nameHex,
      }) as string | undefined;

      const symbol = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "symbol",
        data: symbolHex,
      }) as string | undefined;

      const decimals = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "decimals",
        data: decimalsHex,
      }) as number | undefined;

      setTokenMetadata({ name, symbol, decimals });
    } catch (err) {
      console.error("Error loading token metadata:", err);
      setError("Failed to load token metadata");
    }
  }, [tokenAddress, provider]);

  // ERC20 Functions
  const getAllowance = useCallback(
    async (spender: Address): Promise<bigint> => {
      if (!tokenAddress || !walletAddress || !provider) return BigInt(0);

      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress, spender],
        });

        const result = await provider.request({
          method: "eth_call",
          params: [
            {
              to: tokenAddress,
              data,
            },
            "latest",
          ],
        });

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
    [tokenAddress, walletAddress, provider]
  );

  const approveSpending = useCallback(
    async (spender: Address, amount: bigint = MAX_UINT256) => {
      if (!tokenAddress || !walletAddress || !provider) {
        throw new Error("Token address, wallet or provider not available");
      }

      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, amount],
        });

        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: walletAddress,
              to: tokenAddress,
              data,
            },
          ],
        });

        return await waitForTransaction(provider, txHash);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to approve token";
        setError(message);
        throw new Error(message);
      }
    },
    [tokenAddress, walletAddress, provider]
  );

  // Router Functions
  const deposit = useCallback(
    async (vault: Address, asset: Address, amount: bigint, memo: string) => {
      if (!routerAddress || !walletAddress || !provider) {
        throw new Error("Router address, wallet or provider not available");
      }

      try {
        const data = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "deposit",
          args: [vault, asset, amount, memo],
        });

        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: walletAddress,
              to: routerAddress,
              data,
              value:
                asset === "0x0000000000000000000000000000000000000000"
                  ? `0x${amount.toString(16)}`
                  : undefined,
            },
          ],
        });

        return await waitForTransaction(provider, txHash);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to deposit";
        setError(message);
        throw new Error(message);
      }
    },
    [routerAddress, walletAddress, provider]
  );

  const depositWithExpiry = useCallback(
    async (
      router: Address,
      vault: Address,
      asset: Address,
      amount: bigint,
      memo: string,
      expiration: bigint
    ) => {
      if (!walletAddress || !provider) {
        throw new Error("Wallet or provider not available");
      }

      try {
        const data = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "depositWithExpiry",
          args: [vault, asset, amount, memo, expiration],
        });

        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: walletAddress,
              to: router,
              data,
              value:
                asset === "0x0000000000000000000000000000000000000000"
                  ? `0x${amount.toString(16)}`
                  : undefined,
            },
          ],
        });

        return await waitForTransaction(provider, txHash);
      } catch (err) {
        console.error("Deposit with expiry error:", err);
        const message =
          err instanceof Error ? err.message : "Failed to deposit with expiry";
        setError(message);
        throw new Error(message);
      }
    },
    [walletAddress, provider]
  );

  // Utility functions
  const formatAmount = useCallback(
    (amount: bigint): string => {
      return formatUnits(amount, tokenMetadata.decimals || 18);
    },
    [tokenMetadata.decimals]
  );

  const parseAmount = useCallback(
    (amount: string): bigint => {
      return parseUnits(amount, tokenMetadata.decimals || 18);
    },
    [tokenMetadata.decimals]
  );

  return {
    // Token info
    tokenName: tokenMetadata.name,
    tokenSymbol: tokenMetadata.symbol,
    decimals: tokenMetadata.decimals,
    balance,

    // State
    error,

    // ERC20 Functions
    loadMetadata,
    approveSpending,
    getAllowance,

    // Router Functions
    deposit,
    depositWithExpiry,

    // Utils
    formatAmount,
    parseAmount,
  };
}

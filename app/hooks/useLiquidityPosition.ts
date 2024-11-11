import { useState, useCallback } from "react";
import { useAppState } from "@/utils/context";
import { client, getMemberDetail, getPool } from "@/midgard";
import type { MemberPool, PoolDetail } from "@/midgard";
import { hex } from "@scure/base";
import { parseUnits } from "viem";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

interface InboundAddress {
  chain: string;
  pub_key: string;
  address: string;
  router?: string;
  halted: boolean;
  global_trading_paused: boolean;
  chain_trading_paused: boolean;
  chain_lp_actions_paused: boolean;
  gas_rate: string;
  gas_rate_units: string;
  outbound_tx_size: string;
  outbound_fee: string;
  dust_threshold: string;
}

interface MidgardResponse<T> {
  data?: T;
  error?: string;
}

interface AddLiquidityParams {
  asset: string;
  amount: number;
  runeAmount?: number;
  address: string;
}

interface RemoveLiquidityParams {
  asset: string;
  percentage: number; // 1-100
  address: string;
}

async function getTokenDecimals(provider: any, tokenAddress: string): Promise<number> {
  try {
    const decimalsSelector = "0x313ce567";
    const result = await provider.request({
      method: "eth_call",
      params: [
        {
          to: tokenAddress,
          data: decimalsSelector
        },
        "latest"
      ]
    });
    return parseInt(result, 16);
  } catch (error) {
    console.error(`Error fetching decimals for token ${tokenAddress}:`, error);
    return 18;
  }
}

async function checkAndApproveToken(
  provider: any,
  params: {
    tokenAddress: string;
    spenderAddress: string;
    amount: bigint;
    fromAddress: string;
  }
) {
  const { tokenAddress, spenderAddress, amount, fromAddress } = params;

  // Check allowance
  const allowanceSelector = "0xdd62ed3e" + 
    fromAddress.slice(2).padStart(64, '0') +
    spenderAddress.slice(2).padStart(64, '0');

  const allowanceResult = await provider.request({
    method: "eth_call",
    params: [
      {
        to: tokenAddress,
        data: allowanceSelector
      },
      "latest"
    ]
  });

  const currentAllowance = BigInt(allowanceResult);
  if (currentAllowance >= amount) {
    return true;
  }

  // Approve if needed
  const approveSelector = "0x095ea7b3" + 
    spenderAddress.slice(2).padStart(64, '0') +
    amount.toString(16).padStart(64, '0');

  const approveTx = {
    from: fromAddress,
    to: tokenAddress,
    data: approveSelector
  };

  const approveTxHash = await provider.request({
    method: "eth_sendTransaction",
    params: [approveTx]
  });

  // Wait for approval transaction
  return await waitForTransaction(provider, approveTxHash);
}

async function waitForTransaction(provider: any, txHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash]
        });
        
        if (receipt) {
          resolve(receipt.status === "0x1");
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

export function useLiquidityPosition() {
  const { wallet } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<MemberPool | null>(null);
  const [pool, setPool] = useState<PoolDetail | null>(null);

  const getInboundAddresses = async (): Promise<InboundAddress[]> => {
    const response = await fetch(
      "https://thornode.ninerealms.com/thorchain/inbound_addresses"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const getMemberDetails = useCallback(
    async (address: string, asset: string) => {
      if (!address || !asset) {
        setError("Address and asset are required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const [memberResponse, poolResponse] = await Promise.all([
          getMemberDetail({
            client: client,
            path: {
              address: address,
            },
          }) as Promise<MidgardResponse<{ pools: MemberPool[] }>>,
          getPool({
            client: client,
            path: { asset },
          }) as Promise<MidgardResponse<PoolDetail>>,
        ]);

        if (!memberResponse.data) {
          throw new Error("No member data returned from Midgard");
        }

        const poolPosition = memberResponse.data.pools.find(
          (p) => p.pool === asset
        );

        if (poolPosition) {
          setPosition(poolPosition);
        }

        if (poolResponse.data) {
          setPool(poolResponse.data);
        }

        return {
          position: poolPosition,
          pool: poolResponse.data,
        };
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch position details"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addLiquidity = useCallback(
    async ({ asset, amount, runeAmount, address }: AddLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();

        const [assetChain, assetAddress] = asset.split(".");
        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetChain.toUpperCase()
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        // single sided liquidity memo
        const memo = `+:${asset}`;

        const supportedChains = ['ethereum', 'avalanche', 'bsc'];
        const chainLower = assetChain.toLowerCase();
        
        if (!supportedChains.includes(chainLower)) {
          throw new Error(`Unsupported chain: ${assetChain}. Only EVM chains are supported.`);
        }

        const chainIdMap: Record<string, number> = {
          ethereum: 1,
          avalanche: 43114,
          bsc: 56
        };

        // Switch chain if needed
        const currentChainId = await wallet.provider.request({ method: "eth_chainId" });
        const targetChainId = chainIdMap[chainLower];
        if (parseInt(currentChainId, 16) !== targetChainId) {
          await wallet.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        }

        // Ensure router address has 0x prefix
        const routerAddress = inbound.router?.startsWith('0x') 
          ? inbound.router 
          : `0x${inbound.router}`;

        // Check if the asset is a token (has contract address) or native
        const isToken = assetAddress && assetAddress !== assetChain.toUpperCase();

        let txHash;

        if (isToken && routerAddress) {
          // Format token address correctly
          const formattedTokenAddress = asset.split("-")[1];

          // Get decimals and parse amount
          const decimals = await getTokenDecimals(wallet.provider, formattedTokenAddress);
          const parsedAmount = parseUnits(amount.toString(), decimals);

          // Check and approve if needed
          const approved = await checkAndApproveToken(wallet.provider, {
            tokenAddress: formattedTokenAddress,
            spenderAddress: routerAddress,
            amount: parsedAmount,
            fromAddress: wallet.address
          });

          if (!approved) {
            throw new Error("Token approval failed");
          }

          // Generate the deposit transaction data
          const depositSelector = "0x44bc937b"; // Function selector for depositWithExpiry
          // Use ABCI call
          const depositData = depositSelector +
            routerAddress.slice(2).padStart(64, '0') +                    // router address
            formattedTokenAddress.slice(2).padStart(64, '0') +            // token address 
            parsedAmount.toString(16).padStart(64, '0') +                 // amount
            "00000000000000000000000000000000000000000000000000000000000000a0" + // memo offset
            ((Math.floor(Date.now() / 1000) + 300).toString(16)).padStart(64, '0') + // expiry (current time + 5 min)
            memo.length.toString(16).padStart(64, '0') +                  // memo length
            hex.encode(Buffer.from(memo, 'utf-8')).padEnd(64, '0');      // memo data

          const depositTx = {
            from: wallet.address,
            to: routerAddress,
            data: depositData,
            value: "0x0" // No native token value for ERC20 deposits
          };

          txHash = await wallet.provider.request({
            method: "eth_sendTransaction",
            params: [depositTx]
          });
        } else {
          // Handle native token
          const parsedAmount = parseUnits(amount.toString(), 18);
          const memoBytes = Buffer.from(memo, "utf-8");
          const encodedMemo = hex.encode(memoBytes);
          
          const tx = {
            from: wallet.address,
            to: routerAddress,
            value: `0x${parsedAmount.toString(16)}`,
            data: `0x${encodedMemo}`
          };

          txHash = await wallet.provider.request({
            method: "eth_sendTransaction",
            params: [tx]
          });
        }

        await getMemberDetails(address, asset);
        return txHash;

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [wallet, getMemberDetails]
  );

  const removeLiquidity = useCallback(
    async ({ asset, percentage, address }: RemoveLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();

        const [assetChain] = asset.split(".");
        const inbound = inboundAddresses.find(
          (i) => i.chain === assetChain.toUpperCase()
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        const basisPoints = percentage * 100;
        const memo = `-:${asset}:${basisPoints}`;

        const memoBytes = Buffer.from(memo, "utf-8");
        const encodedMemo = hex.encode(memoBytes);

        const tx = {
          from: wallet.address,
          to: inbound.router,
          value: "0x0",
          data: `0x${encodedMemo}`
        };

        const txHash = await wallet.provider.request({
          method: "eth_sendTransaction",
          params: [tx]
        });

        await getMemberDetails(address, asset);
        return txHash;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [wallet, getMemberDetails]
  );

  return {
    loading,
    error,
    position,
    pool,
    getMemberDetails,
    addLiquidity,
    removeLiquidity,
  };
}
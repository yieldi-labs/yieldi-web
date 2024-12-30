import { TokenData } from "@/utils/interfaces";
import { checkAndSwitchChain } from "../balances";
import { ChainKey } from "../constants";
import { baseAmount, baseToAsset } from "@xchainjs/xchain-util";
import { SigningStargateClient } from "@cosmjs/stargate";
import { formatNumber } from "@/app/utils";
import { getBalance } from "@/midgard";
import { getClient, UTXOChain } from "../utxoClients/clients";

export const chainHandlers: Record<any, any> = {
  [ChainKey.AVALANCHE]: async (
    address: string,
    provider: any,
    token: TokenData,
  ) => {
    const info = await checkAndSwitchChain(
      ChainKey.AVALANCHE,
      address,
      provider,
      token.tokenAddress as `0x${string}`,
    );
    return {
      balance: baseToAsset(
        baseAmount(info?.balance.toString() || 0, token.decimals),
      )
        .amount()
        .toNumber(),
    };
  },
  [ChainKey.BSCCHAIN]: async (
    address: string,
    provider: any,
    token: TokenData,
  ) => {
    const info = await checkAndSwitchChain(
      ChainKey.BSCCHAIN,
      address,
      provider,
      token.tokenAddress as `0x${string}`,
    );
    return {
      balance: baseToAsset(
        baseAmount(info?.balance.toString() || 0, token.decimals),
      )
        .amount()
        .toNumber(),
    };
  },
  [ChainKey.ETHEREUM]: async (
    address: string,
    provider: any,
    token: TokenData,
  ) => {
    const info = await checkAndSwitchChain(
      ChainKey.ETHEREUM,
      address,
      provider,
      token.tokenAddress as `0x${string}`,
    );
    return {
      balance: baseToAsset(
        baseAmount(info?.balance.toString() || 0, token.decimals),
      )
        .amount()
        .toNumber(),
    };
  },
  [ChainKey.THORCHAIN]: async (address: string) => {
    const info = await getRuneBalance(address);
    const balance =
      info?.coins.find((coin) => coin.asset === "THOR.RUNE")?.amount || 0;
    return { balance: Number(formatNumber(balance, 8)) };
  },
  [ChainKey.BITCOIN]: async (address: string) => {
    const info = await getUTXOInfo("BTC", address);
    return { balance: info?.balance || 0 };
  },
  [ChainKey.LITECOIN]: async (address: string) => {
    const info = await getUTXOInfo("LTC", address);
    return { balance: info?.balance || 0 };
  },
  [ChainKey.BITCOINCASH]: async (address: string) => {
    const info = await getUTXOInfo("BCH", address);
    return { balance: info?.balance || 0 };
  },
  [ChainKey.DOGECOIN]: async (address: string) => {
    const info = await getUTXOInfo("DOGE", address);
    return { balance: info?.balance || 0 };
  },
  [ChainKey.GAIACHAIN]: async (address: string) => {
    const info = await getCosmosBalance(address);
    return { balance: info?.balance || 0 };
  },
};

const getUTXOInfo = async (chainKey: UTXOChain, walletAddress: string) => {
  const balance = await getClient(chainKey).getBalance(walletAddress);
  return {
    balance: baseToAsset(balance[0].amount).amount().toNumber(),
    formattedBalance: baseToAsset(balance[0].amount).amount().toString(),
  };
};

const getCosmosBalance = async (walletAddress: string) => {
  try {
    const client = await SigningStargateClient.connect(
      process.env.NEXT_PUBLIC_COSMOS_DIRECTORY_URL || "",
    );
    const atomDecimals = 6;
    const balance = await client.getBalance(walletAddress, "uatom");
    const baseAssetAmount = baseToAsset(
      baseAmount(balance.amount, atomDecimals),
    )
      .amount()
      .toNumber();
    return {
      balance: baseAssetAmount,
      formattedBalance: formatNumber(baseAssetAmount, atomDecimals),
    };
  } catch (err) {
    console.error("Error getting ATOM balance:", err);
    return null;
  }
};

const getRuneBalance = async (walletAddress: string) => {
  try {
    const { data: runeBalance } = await getBalance({
      path: {
        address: walletAddress,
      },
    });
    return runeBalance;
  } catch {
    return undefined;
  }
};

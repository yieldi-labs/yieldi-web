import { useState, useEffect } from "react";
import { hex, base64 } from "@scure/base";
import * as btc from "@scure/btc-signer";
import SatsConnect, { AddressPurpose } from "sats-connect";
import * as viem from "viem";
import { mainnet } from "viem/chains";
import { getAccount } from "wagmi/actions";
import { wagmiConfig } from "@/utils/wallet/wagmiConfig";
import { Saver } from "@/app/explore/types";
import { getPool, PoolDetail } from "@/midgard";
import { liquidityProvider } from "@/thornode";

export const ONE = BigInt("1000000000000000000");
export const ONE6 = BigInt("1000000");
export const ONE12 = BigInt("1000000000000");
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const UINT_MAX = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);
export const UINT128_MAX = BigInt("340282366920938463463374607431768211455");

export interface Wallet {
  chain: string;
  symbol: string;
  publicKey?: string;
  address: string;
  signPsbt: (tx: btc.Transaction) => void;
  getBalance: () => Promise<number>;
}

export enum SupportedChain {
  // Arbitrum = "ARB",
  Avalanche = "AVAX",
  // Base = "BASE",
  BinanceSmartChain = "BSC",
  Bitcoin = "BTC",
  // BitcoinCash = "BCH",
  // Cosmos = "GAIA",
  // Dash = "DASH",
  Dogecoin = "DOGE",
  Ethereum = "ETH",
  // Kujira = "KUJI",
  // Litecoin = "LTC",
  // Maya = "MAYA",
  // Optimism = "OP",
  // Polkadot = "DOT",
  // Chainflip = "FLIP",
  // Polygon = "MATIC",
  // Radix = "XRD",
  // THORChain = "THOR",
  // Solana = "SOL",
}

export type AtomWallet = {
  ethereum?: Wallet;
  bitcoin?: Wallet;
};
export const atomWallet = newAtom<AtomWallet>({});

if (typeof window !== "undefined") {
  (window as any).atomWallet = atomWallet;
}

export async function ethereumGetWalletClient() {
  const account = getAccount(wagmiConfig);
  if (!account.address) return null;

  return {
    chain: "ethereum",
    symbol: "ETH",
    address: account.address,
    getBalance: async () => {
      if (!account.address) throw new Error("Account address is undefined");
      const b = await publicClient.getBalance({ address: account.address });
      return parseFloat(viem.formatUnits(b, 18));
    },
  };
}

export const BITCOIN_NETWORK = {
  bech32: "bc",
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};
/*{
  name: "mainnet",
  bech32: "tb",
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};*/

export function formatAddress(a: undefined | null | string) {
  if (!a) return "-";
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export function formatNumber(
  amount: string | number,
  decimals = 8,
  decimalsShown = 4,
) {
  if (!amount && amount != 0) return "-";
  if (typeof amount !== "number") {
    amount = parseFloat(amount) / 10 ** decimals;
  }
  return Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: decimalsShown,
    maximumFractionDigits: decimalsShown,
  }).format(amount);
}

export async function fetchJson(url: string, options?: object) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(
      "fetchJson: http error: " + res.status + ": " + (await res.text()),
    );
  }
  return await res.json();
}

interface Atom<V> {
  v: V;
  l: Array<() => void>;
}

function newAtom<V>(v: V): Atom<V> {
  return { v, l: [] };
}
function getAtom<V>(a: Atom<V>) {
  return a.v;
}
export function setAtom<V>(
  a: Atom<V>,
  b: ((prev: V) => V) | Partial<V> | string,
  c?: any,
): void {
  if (typeof b === "function") {
    a.v = (b as (prev: V) => V)(a.v);
  } else if (typeof b === "object") {
    a.v = { ...a.v, ...b };
  } else if (typeof b === "string" && typeof a.v === "object") {
    a.v = { ...a.v, [b]: c };
  } else {
    a.v = b as V;
  }
  a.l.forEach((l: () => void) => l());
}
export function useAtom<V>(a: Atom<V>): [V, (b: any, c?: any) => void] {
  const [v, setV] = useState(getAtom<V>(a));
  useEffect(() => {
    const l = () => setV(getAtom<V>(a));
    a.l.push(l);
    return () => {
      a.l.splice(a.l.indexOf(l), 1);
    };
  }, [a]);
  return [v, (b, c) => setAtom(a, b, c)];
}
export function onAtom<V>(a: Atom<V>, fn: (v: V) => void) {
  const h = () => fn(a.v);
  a.l.push(h);
  return () => a.l.splice(a.l.indexOf(h), 1);
}

export const publicClient = viem.createPublicClient({
  chain: mainnet,
  transport: viem.http(),
  batch: { multicall: true },
});

declare global {
  interface Window {
    atomWallet?: Atom<AtomWallet>;
  }
}

export const walletClient = viem.createWalletClient({
  chain: mainnet,
  transport: viem.custom(
    typeof window === "undefined" || !window.ethereum
      ? { request: async () => undefined }
      : window.ethereum,
  ),
});

export async function ethereumConnectInjected() {
  try {
    if (!window.ethereum) throw new Error("No web wallet installed");
    const accounts = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0];
    const chainId = await window.ethereum!.request({ method: "eth_chainId" });
    if (chainId != "0x1") {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
    }
    return {
      chain: "ethereum",
      symbol: "ETH",
      address: address,
      getBalance: async () => {
        const b = await publicClient.getBalance({ address });
        return parseFloat(viem.formatUnits(b, 18));
      },
    };
  } catch (e: Error | any) {
    console.error(e);
    alert("Error connecting wallet: " + e?.message);
  }
}

export async function bitcoinConnectInjected() {
  await SatsConnect.request("wallet_requestPermissions", undefined);

  let addresses;
  try {
    const result = await SatsConnect.request("getAddresses", {
      purposes: [AddressPurpose.Payment],
    });
    if (result.status === "success") {
      addresses = result.result.addresses;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Method not supported")
    ) {
      const result = await SatsConnect.request("getAccounts", {
        purposes: [AddressPurpose.Payment],
      });
      if (result.status === "success") {
        addresses = result.result;
      } else {
        throw new Error(result.error.message);
      }
    } else {
      throw error;
    }
  }

  if (!addresses || addresses.length === 0) {
    SatsConnect.request("wallet_renouncePermissions", undefined);
    localStorage["sats-connect_defaultProvider"] = "";
    throw new Error("No addresses returned");
  }

  const address = addresses[0].address;
  return {
    chain: "bitcoin",
    symbol: "BTC",
    address: address,
    publicKey: addresses[0].publicKey,
    getBalance: async () => {
      return await bitcoinBalance(address);
    },
    signPsbt: async (tx: btc.Transaction) => {
      const signInputs: { [key: string]: Array<number> } = { [address]: [] };
      for (let i = 0; i < tx.inputsLength; i++) {
        signInputs[address].push(i);
      }

      const response = await SatsConnect.request("signPsbt", {
        psbt: base64.encode(tx.toPSBT()),
        signInputs: signInputs,
        broadcast: true,
      });
      if (response.status === "error") {
        throw new Error(response.error.message);
      }
      console.log(response);
      return response.result.txid;
    },
  };
}

const mempoolUrl = "https://mempool.space/api";

export async function bitcoinFees() {
  return await fetchJson(mempoolUrl + "/v1/fees/recommended");
}

export async function bitcoinBalance(address: string) {
  const data = await fetchJson(mempoolUrl + "/address/" + address);
  return (
    (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 1e8
  );
}

interface Utxo {
  txid: string;
  vout: number;
  value: number;
  status: { confirmed: boolean };
}

export async function bitcoinUtxos(address: string) {
  if (!address) throw new Error("Wallet not connected");
  const utxos: [Utxo] = await fetchJson(
    `${mempoolUrl}/address/${address}/utxo`,
  );
  const confirmedUTXOs = utxos
    .filter((utxo) => utxo.status.confirmed)
    .sort((a, b) => b.value - a.value);

  let spend;
  const result = [];
  for (let i = 0; i < confirmedUTXOs.length; ++i) {
    if (!spend) {
      if (!getAtom(atomWallet)) throw new Error("Wallet not connected");
      const pubKey = hex.decode(getAtom(atomWallet)?.bitcoin?.publicKey || "");
      spend = address.match(/^(2|3)/)
        ? btc.p2sh(btc.p2wpkh(pubKey, BITCOIN_NETWORK), BITCOIN_NETWORK)
        : address.match(/^(tb1p|bc1p)/)
          ? btc.p2tr(pubKey, undefined, BITCOIN_NETWORK, true)
          : btc.p2wpkh(pubKey, BITCOIN_NETWORK);
    }
    result.push({
      ...spend,
      txid: confirmedUTXOs[i].txid,
      index: confirmedUTXOs[i].vout,
      value: confirmedUTXOs[i].value,
      witnessUtxo: {
        amount: BigInt(confirmedUTXOs[i].value),
        script: spend.script,
      },
    });
  }
  return result;
}

export async function bitcoinSendTx(tx: btc.Transaction) {
  return getAtom(atomWallet)?.bitcoin?.signPsbt(tx);
  /*
  const signedPsbt = await getAtom(atomWallet).signPsbt(tx);
  const signedTx = btc.Transaction.fromPSBT(hex.decode(signedPsbt));
  console.log(signedTx.hex);
  return await bitcoinPushTx(signedTx.hex);
  */
}

export async function bitcoinPushTx(txHex: string) {
  const response = await fetch(mempoolUrl + "/tx", {
    method: "POST",
    body: txHex,
  });
  if (!response.ok) {
    try {
      const mempoolError = await response.text();
      const message = mempoolError.split('"message":"')[1].split('"}')[0];
      if (mempoolError.includes("error") || mempoolError.includes("message")) {
        throw new Error(message);
      } else {
        throw new Error("Error broadcasting transaction. Please try again");
      }
    } catch (e: Error | any) {
      throw new Error(e?.message || e);
    }
  } else {
    return await response.text();
  }
}

export const addDollarSignAndSuffix = (value: number) => {
  if (value >= 1e6) {
    return `$${formatNumber(value / 1e6, 2, 2)}M`;
  } else if (value >= 1e3) {
    return `$${formatNumber(value / 1e3, 2, 2)}K`;
  } else {
    return `$${formatNumber(value, 2, 2)}`;
  }
};

export const calculateSaverTVL = (saver: Saver) => {
  return (
    (parseFloat(saver.saversDepth) * parseFloat(saver.assetPriceUSD)) / 1e8
  );
};

export const getFormattedSaverTVL = (saver: Saver) => {
  return addDollarSignAndSuffix(calculateSaverTVL(saver));
};

export const calculatePoolTVL = (pool: PoolDetail, runePriceUSD: number) => {
  const assetValueInUSD =
    (parseFloat(pool.assetDepth) * parseFloat(pool.assetPriceUSD)) / 1e8;
  const runeValueInUSD = (parseFloat(pool.runeDepth) * runePriceUSD) / 1e8;
  return assetValueInUSD + runeValueInUSD;
};

export const getFormattedPoolTVL = (pool: PoolDetail, runePriceUSD: number) => {
  return addDollarSignAndSuffix(calculatePoolTVL(pool, runePriceUSD));
};

export const calculateVolumeUSD = (pool: PoolDetail, runePriceUSD: number) => {
  const volumeInRune = parseFloat(pool.volume24h) / 1e8;
  return volumeInRune * runePriceUSD;
};

export const calculateVolumeDepthRatio = (
  pool: PoolDetail,
  runePriceUSD: number,
) => {
  const volumeUSD = calculateVolumeUSD(pool, runePriceUSD);
  const tvlUSD = calculatePoolTVL(pool, runePriceUSD);
  return volumeUSD / tvlUSD;
};

export const getAssetSymbol = (asset: string): string => {
  return asset.split("-")[0] || asset;
};

export const getLogoPath = (asset: string): string => {
  const assetLower = asset.toLowerCase();
  return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
};

export const getAssetCanonicalSymbol = (asset: string) => {
  return asset.split("-")[0] || asset;
};

export const getAssetShortSymbol = (asset: string) => {
  return getAssetCanonicalSymbol(asset).split(".")[1] || asset;
};

export const normalizeAddress = (address: string) => {
  const cleanAddr = address.toLowerCase().replace("0x", "");
  return `0x${cleanAddr}` as `0x${string}`;
};

export const isERC20 = (asset: string) => {
  return asset.includes("-");
};

export const getPercentage = (amount: number, max: number): number => {
  return max > 0 ? (amount / max) * 100 : 0;
};

/**
 * Extracts the symbol from a pool asset identifier
 * @param asset Pool asset identifier (e.g. "BTC.BTC" or "ETH.USDT-0x...")
 * @returns The asset symbol (e.g. "BTC" or "USDT")
 */
export const getAssetSimpleSymbol = (asset: string): string => {
  return asset.split(".")[1]?.split("-")[0] || asset;
};

export interface MemberStats {
  deposit: {
    asset: number;
    usd: number;
  };
  gain: {
    asset: number;
    usd: number;
  };
}

/**
 * Calculate the gains of a liquidity provider.
 *
 * @param poolAsset Pool asset identifier (e.g. "BTC.BTC" or "ETH.USDT-0x...")
 * @param walletAddress Wallet address of the liquidity provider
 * @param runePriceUSD Current price of RUNE in USD
 * @returns MemberStats object with deposit and gain values.
 */
export const calculateGain = async (
  poolAsset: string,
  walletAddress: string,
  runePriceUSD: number,
) => {
  const DECIMALS = 1e8;

  try {
    const [poolResponse, lpResponse] = await Promise.all([
      getPool({ path: { asset: poolAsset } }),
      liquidityProvider({ path: { asset: poolAsset, address: walletAddress } }),
    ]);

    const poolData = poolResponse.data;
    const lpData = lpResponse.data;
    if (!poolData || !lpData) return null;

    // Get pool ratio
    const poolRuneAmount = parseFloat(poolData.runeDepth);
    const poolAssetAmount = parseFloat(poolData.assetDepth);
    const runePerAsset = poolRuneAmount / poolAssetAmount;

    // Initial deposit values
    const initialAssetDeposit =
      parseFloat(lpData.asset_deposit_value) / DECIMALS;
    const initialRuneDeposit = parseFloat(lpData.rune_deposit_value) / DECIMALS;
    const initialDepositInAsset =
      initialAssetDeposit + initialRuneDeposit / runePerAsset;

    // Current redemption values
    const currentAssetValue = parseFloat(lpData.asset_redeem_value!) / DECIMALS;
    const currentRuneValue = parseFloat(lpData.rune_redeem_value!) / DECIMALS;
    const currentValueInAsset =
      currentAssetValue + currentRuneValue / runePerAsset;

    // Calculate USD values using assetPrice
    const assetPrice = runePerAsset * runePriceUSD;
    const initialDepositUSD = initialDepositInAsset * assetPrice;

    // Calculate gains
    const gainInAsset = currentValueInAsset - initialDepositInAsset;
    const gainUSD = gainInAsset * assetPrice;

    return {
      deposit: {
        asset: initialDepositInAsset,
        usd: initialDepositUSD,
      },
      gain: {
        asset: gainInAsset,
        usd: gainUSD,
      },
    } as MemberStats;
  } catch (err) {
    console.error("Failed to calculate gains:", err);
    return null;
  }
};

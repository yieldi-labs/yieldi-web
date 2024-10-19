import { useState, useEffect } from "react";
import { hex, base64 } from "@scure/base";
import * as btc from "@scure/btc-signer";
import SatsConnect from "sats-connect";
import * as viem from "viem";
import { mainnet } from "viem/chains";
import { getAccount } from "@wagmi/core";
import wagmiConfig from "./wagmiConfig";

export const parseUnits = viem.parseUnits;
export const formatUnits = viem.formatUnits;

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

export type AtomWallet = {
  ethereum?: Wallet;
  bitcoin?: Wallet;
};
export const atomWallet = newAtom<AtomWallet>({});

if (typeof window !== "undefined") {
  window.atomWallet = atomWallet;
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
      return parseFloat(formatUnits(b, 18));
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
export function setAtom(a, b, c) {
  if (typeof b === "function") {
    a.v = b(a.v);
  } else if (typeof b === "object") {
    a.v = { ...a.v, ...b };
  } else if (typeof b === "string" && typeof a.v === "object") {
    a.v = { ...a.v, [b]: c };
  } else {
    a.v = b;
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
    ethereum: undefined | { request: (a: any) => Promise<any> };
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

interface ABI {
  name: string;
  stateMutability: string;
}

export async function call(
  address: string,
  fn: string | ABI,
  ...args: Array<string | number | bigint>
): Promise<any> {
  let abi;
  let fnName;
  let isView;
  let isPayable;
  if (typeof fn === "object") {
    abi = [fn];
    fnName = fn.name;
    isView = fn.stateMutability === "view";
  } else {
    const [name, params, returns] = fn.split("-");
    let rname = name[0] === "+" ? name.slice(1) : name;
    if (rname[0] === "$") rname = rname.slice(1);
    let efn = `function ${rname}(${params}) external`;
    if (name[0] !== "+") efn += " view";
    if (returns) efn += ` returns (${returns})`;
    abi = viem.parseAbi([efn]);
    fnName = rname;
    isView = name[0] !== "+";
    isPayable = name[1] === "$";
  }
  if (isView) {
    return publicClient.readContract({
      address: address as viem.Address,
      abi,
      args,
      functionName: fnName,
    });
  } else {
    const account = getAtom(atomWallet)?.address;
    if (!account) throw new Error("Wallet not connected");
    const { request } = await publicClient.simulateContract({
      address: address as viem.Address,
      abi,
      value: BigInt(isPayable ? args[0] : 0),
      args: isPayable ? args.slice(1) : args,
      functionName: fnName,
      account: account as viem.Address,
    });
    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("tx hash", hash);
    return hash;
  }
}

export async function checkAllowance(
  owner: string,
  asset: string,
  target: string,
  amount: bigint,
) {
  const allowance: bigint = await call(
    asset,
    "allowance-address,address-uint256",
    owner,
    target,
  );
  if ((amount = UINT_MAX)) {
    amount = UINT128_MAX;
  }
  if (allowance < amount) {
    await call(
      owner,
      "+approve-address,address,uint256",
      asset,
      target,
      amount,
    );
  }
}

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
        return parseFloat(formatUnits(b, 18));
      },
    };
  } catch (e: Error | any) {
    console.error(e);
    alert("Error connecting wallet: " + e?.message);
  }
}

export async function bitcoinConnectInjected() {
  await SatsConnect.request("wallet_requestPermissions", undefined);
  //if (result0.status == "error") throw new Error(result.error.message);
  let result = await SatsConnect.request("getAddresses", {
    purposes: ["payment"], // eslint-disable-line
  });
  if (
    result.status == "error" &&
    result.error.message.includes("Method not supported")
  ) {
    result = await SatsConnect.request("getAccounts", {
      purposes: ["payment"],
    });
  }
  if (result.status == "error") {
    SatsConnect.request("wallet_renouncePermissions", undefined);
    localStorage["sats-connect_defaultProvider"] = "";
    throw new Error(result.error.message);
  }
  const addresses = result.result.addresses;
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
      //return hex.encode(base64.decode(response.result.psbt));
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
      const pubKey = hex.decode(getAtom(atomWallet)?.publicKey || "");
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
  return await getAtom(atomWallet)?.signPsbt(tx);
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

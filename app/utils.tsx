import { useState, useEffect } from "react";
import { hex, base64 } from "@scure/base";
import * as btc from "@scure/btc-signer";
import SatsConnect from "sats-connect";

export const atomBitcoinWallet = newAtom(null);

if (typeof window !== "undefined") {
  window.bitcoinWallet = atomBitcoinWallet;
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

function newAtom<V>(v: V) {
  return { v, l: [] };
}
function getAtom<V>(a: { v: V }) {
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
  a.l.forEach((l) => l());
}
export function useAtom<V>(a: { v: V }) {
  const [v, setV] = useState(getAtom<V>(a));
  useEffect(() => {
    const l = () => setV(getAtom<V>(a));
    a.l.push(l);
    return () => a.l.splice(a.l.indexOf(l), 1);
  }, [a]);
  return [v, (b, c) => setAtom(a, b, c)];
}
export function onAtom(a, fn) {
  const h = () => fn(a.v);
  a.l.push(h);
  return () => a.l.splice(a.l.indexOf(h), 1);
}

export async function bitcoinConnectInjected() {
  let result = await SatsConnect.request(
    "wallet_requestPermissions",
    undefined,
  );
  //if (result.status == "error") throw new Error(result.error.message);
  result = await SatsConnect.request("getAddresses", {
    purposes: ["payment"],
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
    SatsConnect.request("wallet_renouncePermissions");
    localStorage["sats-connect_defaultProvider"] = "";
    throw new Error(result.error.message);
  }
  const addresses = result.result.addresses;
  const address = addresses[0].address;
  return {
    address: address,
    publicKey: addresses[0].publicKey,
    signPsbt: async (tx: btc.Transaction) => {
      const signInputs = { [address]: [] };
      for (const i in tx.inputs) {
        signInputs[address].push(parseInt(i));
      }
      console.log(signInputs);

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

export async function bitcoinUtxos(address: string) {
  if (!address) throw new Error("Wallet not connected");
  const utxos = await fetchJson(`${mempoolUrl}/address/${address}/utxo`);
  const confirmedUTXOs = utxos
    .filter((utxo) => utxo.status.confirmed)
    .sort((a, b) => b.value - a.value);

  let spend;
  const result = [];
  for (let i = 0; i < confirmedUTXOs.length; ++i) {
    if (!spend) {
      if (!getAtom(atomBitcoinWallet)) throw new Error("Wallet not connected");
      const pubKey = hex.decode(getAtom(atomBitcoinWallet).publicKey);
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
  return await getAtom(atomBitcoinWallet).signPsbt(tx);
  /*
  const signedPsbt = await getAtom(atomBitcoinWallet).signPsbt(tx);
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
    } catch (e) {
      throw new Error(e?.message || e);
    }
  } else {
    return await response.text();
  }
}

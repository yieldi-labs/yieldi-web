import { ChainKey } from "@/utils/wallet/constants";

const INFURA_ENDPOINTS: Partial<Record<ChainKey, string>> = {
  [ChainKey.AVALANCHE]: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL as string,
  [ChainKey.ETHEREUM]: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL as string,
  [ChainKey.BSCCHAIN]: process.env.NEXT_PUBLIC_BSCCHAIN_RPC_URL as string,
}

export async function infuraRequest(chainKey: ChainKey, method: string, params: any[]): Promise<any> {

  if (!INFURA_ENDPOINTS[chainKey]) {
    throw Error('URL not defined')
  }

  const response = await fetch(INFURA_ENDPOINTS[chainKey], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const { result, error } = await response.json();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

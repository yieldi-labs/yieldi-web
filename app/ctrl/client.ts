const GRAPHQL_ENDPOINT = "https://gql-router.xdefi.services/graphql";

type CtrlBalance = {
  asset: {
    contract: null | string
  },
  amount: {
    value: string
  }
}

export type CtrlBalances = { balances: Array<CtrlBalance> }

type CtrlBalanceResponse = {
  data: Record<string, CtrlBalances>
}

export async function getBalancePerChainAndAddress(chain: string, address: string) {

    const query = `query GetBalances($address: String!) {
        ${chain} {
          balances(address: $address) {
            asset {
              contract
            }
            amount {
              value
            }
          }
        }
    }`;

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apollographql-client-version": "v1.0",
        },
        body: JSON.stringify({
          query,
          variables: {
            address: address,
          },
        }),
    })

    const balances: CtrlBalanceResponse = await response.json()

    return balances.data[chain].balances
}

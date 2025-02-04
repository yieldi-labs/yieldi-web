export const statusResponse = {
  data: {
    tx: {
      id: "10D27CEBA9A44898E3AC4FA7F80F607A6A954226EE821C68EA9B8D2370917FF0",
      chain: "AVAX",
      from_address: "0x38019bc40f504be4546f24083ccaf0c8553c408a",
      to_address: "0xDBBa7E68311292f9570e15DbfA7e2Cfe8B80A430",
      coins: [
        {
          asset: "AVAX.AVAX",
          amount: "1",
        },
      ],
      gas: [
        {
          asset: "AVAX.AVAX",
          amount: "4931",
        },
      ],
      memo: "-:AVAX.AVAX:10000:THOR.RUNE",
    },
    planned_out_txs: [
      {
        chain: "AVAX",
        to_address: "0x38019bc40f504be4546f24083ccaf0c8553c408a",
        coin: {
          asset: "AVAX.AVAX",
          amount: "14425583",
        },
        refund: false,
      },
    ],
    out_txs: [
      {
        id: "622D97764ABF0D072EBB57BE5A5550B683CBF592D59425D1C9DABC84E33BF6C5",
        chain: "AVAX",
        from_address: "0xb20718f36526a46e0ff2608c311db0d7507abcf8",
        to_address: "0x38019bC40f504BE4546F24083Ccaf0c8553C408A",
        coins: [
          {
            asset: "AVAX.AVAX",
            amount: "14425583",
          },
        ],
        gas: [
          {
            asset: "AVAX.AVAX",
            amount: "212840",
          },
        ],
        memo: "OUT:10D27CEBA9A44898E3AC4FA7F80F607A6A954226EE821C68EA9B8D2370917FF0",
      },
    ],
    stages: {
      inbound_observed: {
        started: false,
        pre_confirmation_count: 80,
        final_count: 80,
        completed: false,
      },
      inbound_confirmation_counted: {
        counting_start_height: 1234,
        chain: "AVAX",
        external_observed_height: 16042625,
        external_confirmation_delay_height: 16042626,
        remaining_confirmation_seconds: 600,
        completed: false,
      },
      inbound_finalised: {
        completed: false,
      },
      swap_status: {
        pending: false,
        streaming: {
          interval: 0,
          quantity: 0,
          count: 0,
        },
      },
      swap_finalised: {
        completed: false,
      },
      outbound_delay: {
        remaining_delay_blocks: 5,
        remaining_delay_seconds: 30,
        completed: false,
      },
      outbound_signed: {
        scheduled_outbound_height: 1234,
        blocks_since_scheduled: 1234,
        completed: false,
      },
    },
  },
};

export const stagesResponse = {
  data: {
    inbound_observed: {
      started: false,
      pre_confirmation_count: 80,
      final_count: 80,
      completed: false,
    },
    inbound_confirmation_counted: {
      counting_start_height: 1234,
      chain: "BTC",
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
    }
  }
}

import { Swapping } from '../index';

export const swapIngressMock = {
  block: {
    header: {
      timestamp: 1670337093000,
    },
  },
  eventContext: {
    kind: 'event',
    event: {
      args: {
        dispatchInfo: {
          class: [null],
          weight: '101978000',
          paysFee: [null],
        },
        ingressAddress: {
          __kind: 'Eth',
          value: '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2',
        },
        swapId: '9876545',
        ingressAmount: '222222222222222222',
      },
      id: '0000012799-000000-c1ea7',
      indexInBlock: 0,
      nodeId: 'WyJldmVudHMiLCIwMDAwMDEyNzk5LTAwMDAwMC1jMWVhNyJd',
      name: Swapping.SwapIngressReceived,
      phase: 'ApplyExtrinsic',
      pos: 2,
      extrinsic: {
        error: null,
        hash: '0xf72d579e0e659b6e287873698da1ffee2f5cbbc1a5165717f0218fca85ba66f4',
        id: '0000012799-000000-c1ea7',
        indexInBlock: 0,
        nodeId: 'WyJleHRyaW5zaWNzIiwiMDAwMDAxMjc5OS0wMDAwMDAtYzFlYTciXQ==',
        pos: 1,
        success: true,
        version: 4,
        call: {
          args: [null],
          error: null,
          id: '0000012799-000000-c1ea7',
          name: 'Timestamp.set',
          nodeId: 'WyJjYWxscyIsIjAwMDAwMTI3OTktMDAwMDAwLWMxZWE3Il0=',
          origin: [null],
          pos: 0,
          success: true,
        },
      },
    },
  },
};

export const swapExecutedMock = {
  block: {
    header: {
      timestamp: 1670337099000,
    },
  },
  eventContext: {
    kind: 'event',
    event: {
      args: {
        dispatchInfo: {
          class: [null],
          weight: '101978000',
          paysFee: [null],
        },
        swapId: '9876545',
      },
      id: '0000012799-000000-c1ea7',
      indexInBlock: 0,
      nodeId: 'WyJldmVudHMiLCIwMDAwMDEyNzk5LTAwMDAwMC1jMWVhNyJd',
      name: Swapping.SwapExecuted,
      phase: 'ApplyExtrinsic',
      pos: 2,
      extrinsic: {
        error: null,
        hash: '0xf72d579e0e659b6e287873698da1ffee2f5cbbc1a5165717f0218fca85ba66f4',
        id: '0000012799-000000-c1ea7',
        indexInBlock: 0,
        nodeId: 'WyJleHRyaW5zaWNzIiwiMDAwMDAxMjc5OS0wMDAwMDAtYzFlYTciXQ==',
        pos: 1,
        success: true,
        version: 4,
        call: {
          args: [null],
          error: null,
          id: '0000012799-000000-c1ea7',
          name: 'Timestamp.set',
          nodeId: 'WyJjYWxscyIsIjAwMDAwMTI3OTktMDAwMDAwLWMxZWE3Il0=',
          origin: [null],
          pos: 0,
          success: true,
        },
      },
    },
  },
};

export const swapEgressScheduledMock = {
  block: {
    header: {
      timestamp: 1670337105000,
    },
  },
  eventContext: {
    kind: 'event',
    event: {
      args: {
        dispatchInfo: {
          class: [null],
          weight: '101978000',
          paysFee: [null],
        },
        swapId: '9876545',
        egressId: [{ __kind: 'Ethereum' }, '1'] as const,
      },
      id: '0000012799-000000-c1ea7',
      indexInBlock: 0,
      nodeId: 'WyJldmVudHMiLCIwMDAwMDEyNzk5LTAwMDAwMC1jMWVhNyJd',
      name: Swapping.SwapEgressScheduled,
      phase: 'ApplyExtrinsic',
      pos: 2,
      extrinsic: {
        error: null,
        hash: '0xf72d579e0e659b6e287873698da1ffee2f5cbbc1a5165717f0218fca85ba66f4',
        id: '0000012799-000000-c1ea7',
        indexInBlock: 0,
        nodeId: 'WyJleHRyaW5zaWNzIiwiMDAwMDAxMjc5OS0wMDAwMDAtYzFlYTciXQ==',
        pos: 1,
        success: true,
        version: 4,
        call: {
          args: [null],
          error: null,
          id: '0000012799-000000-c1ea7',
          name: 'Timestamp.set',
          nodeId: 'WyJjYWxscyIsIjAwMDAwMTI3OTktMDAwMDAwLWMxZWE3Il0=',
          origin: [null],
          pos: 0,
          success: true,
        },
      },
    },
  },
};

export const SwapExpiredMock = {
  block: {
    header: {
      timestamp: 1670337093000,
    },
  },
  eventContext: {
    kind: 'event',
    event: {
      args: {
        dispatchInfo: {
          class: [null],
          weight: '101978000',
          paysFee: [null],
        },
        ingressAddress: {
          __kind: 'Eth',
          value: '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2',
        },
      },
      id: '0000012799-000000-c1ea7',
      indexInBlock: 0,
      nodeId: 'WyJldmVudHMiLCIwMDAwMDEyNzk5LTAwMDAwMC1jMWVhNyJd',
      name: Swapping.SwapIntentExpired,
      phase: 'ApplyExtrinsic',
      pos: 2,
      extrinsic: {
        error: null,
        hash: '0xf72d579e0e659b6e287873698da1ffee2f5cbbc1a5165717f0218fca85ba66f4',
        id: '0000012799-000000-c1ea7',
        indexInBlock: 0,
        nodeId: 'WyJleHRyaW5zaWNzIiwiMDAwMDAxMjc5OS0wMDAwMDAtYzFlYTciXQ==',
        pos: 1,
        success: true,
        version: 4,
        call: {
          args: [null],
          error: null,
          id: '0000012799-000000-c1ea7',
          name: 'Timestamp.set',
          nodeId: 'WyJjYWxscyIsIjAwMDAwMTI3OTktMDAwMDAwLWMxZWE3Il0=',
          origin: [null],
          pos: 0,
          success: true,
        },
      },
    },
  },
};
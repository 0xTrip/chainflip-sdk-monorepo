import { ChainId, TokenSymbol } from '../consts';

export type { SDKOptions } from '../sdk';

export interface Chain {
  id: ChainId;
  name: string;
}

interface ChainTokenMap {
  [ChainId.Ethereum]: 'ETH' | 'USDC' | 'FLIP';
  [ChainId.Goerli]: ChainTokenMap[ChainId.Ethereum];
  [ChainId.Polkadot]: 'DOT';
  [ChainId.Bitcoin]: 'BTC';
}

export type Token = {
  [K in keyof ChainTokenMap]: {
    chainId: K;
    contractAddress: string;
    decimals: number;
    name: string;
    symbol: ChainTokenMap[K];
  };
}[keyof ChainTokenMap];

interface Route {
  srcChainId: ChainId;
  destChainId: ChainId;
  srcTokenSymbol: TokenSymbol;
  destTokenSymbol: TokenSymbol;
  egressAddress: string;
}

export interface RouteRequest extends Route {
  amount: string;
}

export interface RouteResponse extends Route {
  rate: string;
}

export interface SwapResponse {
  id: string;
  ingressAddress: string;
}

export interface SwapStatusRequest {
  swapIntentId: string;
}

export type SwapStatusResponse =
  | { state: 'AWAITING_INGRESS' }
  | {
      state: 'INGRESS_RECEIVED';
      ingressAmount: string;
      ingressReceivedAt: number;
    }
  | {
      state: 'SWAP_EXECUTED';
      ingressAmount: string;
      ingressReceivedAt: number;
      swapExecutedAt: number;
    }
  | {
      state: 'EGRESS_SCHEDULED';
      egressAmount: string;
      egressScheduledAt: number;
      ingressAmount: string;
      ingressReceivedAt: number;
      swapExecutedAt: number;
    }
  | {
      state: 'COMPLETE';
      egressAmount: string;
      egressCompleteAt: number;
      egressScheduledAt: number;
      ingressAmount: string;
      ingressReceivedAt: number;
      swapExecutedAt: number;
    };

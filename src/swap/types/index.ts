import { ChainId, TokenSymbol } from '../consts';

export type { SDKOptions } from '../sdk';

export interface Chain {
  id: ChainId;
  name: string;
}

export interface Token {
  chainId: ChainId;
  contractAddress: string;
  decimals: number;
  name: string;
  symbol: string;
}

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

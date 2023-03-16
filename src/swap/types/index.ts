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
}

export interface RouteRequest extends Route {
  amount: string;
}

export interface RouteResponse extends Route {
  rate: string;
}

export interface SwapRequest extends Route {
  egressAddress: string;
}

export interface SwapResponse {
  id: string;
  ingressAddress: string;
}

import { ChainId } from '../consts';

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

export interface RouteRequest {
  srcChainId: ChainId;
  destChainId: ChainId;
  srcTokenSymbol: string;
  destTokenSymbol: string;
}

// tbd
export interface Route {
  srcChainId: ChainId;
  destChainId: ChainId;
  srcTokenSymbol: string;
  destTokenSymbol: string;
}

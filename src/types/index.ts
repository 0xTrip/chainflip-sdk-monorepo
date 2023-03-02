// eslint-disable-next-line no-shadow
export enum Chains {
  ETHEREUM = 1,
  POLKADOT = 2,
  BITCOIN = 3,
}

export type ChainId = (typeof Chains)[keyof typeof Chains];
export interface Chain {
  id: ChainId;
  name: string;
}

export interface Token {
  chainId: ChainId;
  contractAddress: string;
  decimals: number;
  name: string;
  ticker: string;
}

export interface RouteRequest {
  srcChainId: ChainId;
  destChainId: ChainId;
  srcTokenTicker: string;
  destTokenTicker: string;
}

// tbd
export interface Route {
  srcChainId: ChainId;
  destChainId: ChainId;
  srcTokenTicker: string;
  destTokenTicker: string;
}

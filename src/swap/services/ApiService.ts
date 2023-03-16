/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChainId } from '../consts';
import {
  bitcoin,
  btc$,
  ethereum,
  eth$,
  flip$,
  polkadot,
  dot$,
  usdc$,
} from '../mocks';
import { Chain, Route, RouteRequest, Token } from '../types';

const getChains = async (): Promise<Chain[]> =>
  Promise.resolve([ethereum, polkadot, bitcoin]);

const getPossibleDestinationChains = async (
  chainId: ChainId,
): Promise<Chain[] | undefined> => {
  if (chainId === ChainId.Ethereum) return Promise.resolve([polkadot, bitcoin]);
  if (chainId === ChainId.Polkadot) return Promise.resolve([ethereum, bitcoin]);
  if (chainId === ChainId.Bitcoin) return Promise.resolve([ethereum, polkadot]);
  return undefined;
};

const getTokens = async (chainId: ChainId): Promise<Token[] | undefined> => {
  if (chainId === ChainId.Ethereum)
    return Promise.resolve([eth$, usdc$, flip$]);
  if (chainId === ChainId.Polkadot) return Promise.resolve([dot$]);
  if (chainId === ChainId.Bitcoin) return Promise.resolve([btc$]);
  return undefined;
};

// tbd
const getRoute = async (routeRequest: RouteRequest): Promise<Route> =>
  Promise.resolve({
    srcChainId: ChainId.Ethereum,
    destChainId: ChainId.Polkadot,
    srcTokenSymbol: 'ETH',
    destTokenSymbol: 'DOT',
  });

export default {
  getChains,
  getPossibleDestinationChains,
  getRoute,
  getTokens,
};

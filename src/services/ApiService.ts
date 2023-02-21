/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  bitcoin,
  bitcoin$,
  ethereum,
  ethereum$,
  flip$,
  polkadot,
  polkadot$,
  usdc$,
} from '../mocks';
import { Chain, ChainId, Route, RouteRequest, Token } from '../types';

const getChains = async (): Promise<Chain[]> =>
  Promise.resolve([ethereum, polkadot, bitcoin]);

const getPossibleDestinationChains = async (
  chainId: ChainId,
): Promise<Chain[] | undefined> => {
  if (chainId === 1) return Promise.resolve([polkadot, bitcoin]);
  if (chainId === 2) return Promise.resolve([ethereum, bitcoin]);
  if (chainId === 3) return Promise.resolve([ethereum, polkadot]);
  return undefined;
};

const getTokens = async (chainId: ChainId): Promise<Token[] | undefined> => {
  if (chainId === 1) {
    return Promise.resolve([ethereum$, usdc$, flip$]);
  }
  if (chainId === 2) {
    return Promise.resolve([polkadot$]);
  }
  if (chainId === 3) {
    return Promise.resolve([bitcoin$]);
  }
  return undefined;
};

const getRoute = async (routeRequest: RouteRequest): Promise<Route> =>
  Promise.resolve({
    srcChainId: 1,
    destChainId: 2,
    srcTokenTicker: 'ETH',
    destTokenTicker: 'DOT',
  });

export default {
  getChains,
  getPossibleDestinationChains,
  getRoute,
  getTokens,
};

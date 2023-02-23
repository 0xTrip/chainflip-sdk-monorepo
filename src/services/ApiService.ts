/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  bitcoin,
  bitcoin$,
  ethereum,
  ether$,
  flip$,
  polkadot,
  polkadot$,
  usdc$,
} from '../mocks';
import { Chain, ChainId, Chains, Route, RouteRequest, Token } from '../types';

const getChains = async (): Promise<Chain[]> =>
  Promise.resolve([ethereum, polkadot, bitcoin]);

const getPossibleDestinationChains = async (
  chainId: ChainId,
): Promise<Chain[] | undefined> => {
  if (chainId === Chains.ETHEREUM) return Promise.resolve([polkadot, bitcoin]);
  if (chainId === Chains.POLKADOT) return Promise.resolve([ethereum, bitcoin]);
  if (chainId === Chains.BITCOIN) return Promise.resolve([ethereum, polkadot]);
  return undefined;
};

const getTokens = async (chainId: ChainId): Promise<Token[] | undefined> => {
  if (chainId === Chains.ETHEREUM)
    return Promise.resolve([ether$, usdc$, flip$]);
  if (chainId === Chains.POLKADOT) return Promise.resolve([polkadot$]);
  if (chainId === Chains.BITCOIN) return Promise.resolve([bitcoin$]);
  return undefined;
};

// tbd
const getRoute = async (routeRequest: RouteRequest): Promise<Route> =>
  Promise.resolve({
    srcChainId: Chains.ETHEREUM,
    destChainId: Chains.POLKADOT,
    srcTokenTicker: 'ETH',
    destTokenTicker: 'DOT',
  });

export default {
  getChains,
  getPossibleDestinationChains,
  getRoute,
  getTokens,
};

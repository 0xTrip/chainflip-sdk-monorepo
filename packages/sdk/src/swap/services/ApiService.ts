import type {
  RateQueryParams,
  SwapRequestBody,
} from '@chainflip-io/sdk-shared/schemas';
import axios from 'axios';
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
import {
  Chain,
  RouteRequest,
  RouteResponse,
  SwapResponse,
  SwapStatusRequest,
  SwapStatusResponse,
  Token,
} from '../types';

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

export type RequestOptions = {
  signal?: AbortSignal;
};

type BackendQuery<T, U> = (
  baseUrl: string,
  args: T,
  options: RequestOptions,
) => Promise<U>;

const getRoute: BackendQuery<RouteRequest, RouteResponse> = async (
  baseUrl,
  { amount, ...routeRequest },
  { signal },
): Promise<RouteResponse> => {
  const params: RateQueryParams = {
    amount,
    ingressAsset: routeRequest.srcTokenSymbol,
    egressAsset: routeRequest.destTokenSymbol,
  };

  const queryParams = new URLSearchParams(params);

  const url = new URL(`/rates?${queryParams.toString()}`, baseUrl).toString();

  const { data } = await axios.get<{ rate: string }>(url, { signal });

  return { rate: data.rate, ...routeRequest };
};

const executeRoute: BackendQuery<RouteResponse, SwapResponse> = async (
  baseUrl,
  route,
  { signal },
) => {
  const body: SwapRequestBody = {
    egressAddress: route.egressAddress,
    ingressAsset: route.srcTokenSymbol,
    egressAsset: route.destTokenSymbol,
  };

  const url = new URL('/swaps', baseUrl).toString();

  const { data } = await axios.post<SwapResponse>(url, { signal, body });

  return data;
};

const getStatus: BackendQuery<SwapStatusRequest, SwapStatusResponse> = async (
  baseUrl,
  { swapIntentId },
  { signal },
): Promise<SwapStatusResponse> => {
  const url = new URL(`/swaps?${swapIntentId}`, baseUrl).toString();
  const { data } = await axios.get<SwapStatusResponse>(url, { signal });
  return data;
};

export default {
  getChains,
  getPossibleDestinationChains,
  getRoute,
  getTokens,
  getStatus,
  executeRoute,
};

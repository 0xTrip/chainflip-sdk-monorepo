import axios from 'axios';
import type { RateQueryParams, SwapRequestBody } from '@/shared/schemas';
import { ChainId } from '../consts';
import { bitcoin, btc$, polkadot, dot$, goerli, goerliTokens } from '../mocks';
import {
  Chain,
  RouteRequest,
  RouteResponse,
  SwapResponse,
  SwapStatusRequest,
  SwapStatusResponse,
  Token,
} from '../types';
import { assert, unreachable } from '../utils';

const getChains = async (useTestnets: boolean): Promise<Chain[]> => {
  assert(useTestnets, 'mainnets not supported yet');
  return [goerli, polkadot, bitcoin];
};

const getPossibleDestinationChains = async (
  chainId: ChainId,
  useTestnets: boolean,
): Promise<Chain[]> => {
  assert(useTestnets, 'mainnets not supported yet');
  assert(chainId !== ChainId.Ethereum, 'ethereum not supported yet');
  if (chainId === ChainId.Goerli) return [polkadot, bitcoin];
  if (chainId === ChainId.Polkadot) return [goerli, bitcoin];
  if (chainId === ChainId.Bitcoin) return [goerli, polkadot];
  return unreachable(chainId, 'received unknown chainId');
};

const getTokens = async (
  chainId: ChainId,
  useTestnets: boolean,
): Promise<Token[]> => {
  assert(useTestnets, 'mainnets not supported yet');
  assert(chainId !== ChainId.Ethereum, 'ethereum not supported yet');
  if (chainId === ChainId.Goerli) return goerliTokens;
  if (chainId === ChainId.Polkadot) return [dot$];
  if (chainId === ChainId.Bitcoin) return [btc$];
  return unreachable(chainId, 'received unknown chainId');
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

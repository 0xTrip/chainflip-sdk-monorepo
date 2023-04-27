import axios from 'axios';
import type {
  QuoteQueryParams,
  QuoteResponse,
  SwapRequestBody,
} from '@/shared/schemas';
import { ChainId } from '../consts';
import {
  bitcoin,
  polkadot,
  dot$,
  ethereum,
  btc$,
  ethereumTokens,
  testnetChains,
  testnetTokens,
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

const getChains = async (useTestnets: boolean): Promise<Chain[]> => {
  if (useTestnets) return testnetChains([ethereum, polkadot, bitcoin]);
  return [ethereum, polkadot, bitcoin];
};

const getPossibleDestinationChains = async (
  chainId: ChainId,
  useTestnets: boolean,
): Promise<Chain[]> => {
  if (useTestnets) {
    if (chainId === ChainId.Ethereum) return testnetChains([polkadot, bitcoin]);
    if (chainId === ChainId.Polkadot) return testnetChains([ethereum, bitcoin]);
    if (chainId === ChainId.Bitcoin) return testnetChains([ethereum, polkadot]);
    throw new Error('received testnet flag but mainnet chainId');
  }

  if (chainId === ChainId.Ethereum) return [bitcoin, polkadot];
  if (chainId === ChainId.Polkadot) return [ethereum, bitcoin];
  if (chainId === ChainId.Bitcoin) return [ethereum, polkadot];
  throw new Error('received unknown chainId');
};

const getTokens = async (
  chainId: ChainId,
  useTestnets: boolean,
): Promise<Token[]> => {
  if (useTestnets) {
    if (chainId === ChainId.Ethereum) return testnetTokens(ethereumTokens);
    if (chainId === ChainId.Polkadot) return testnetTokens([dot$]);
    if (chainId === ChainId.Bitcoin) return testnetTokens([btc$]);
    throw new Error('received testnet flag but mainnet chainId');
  }

  if (chainId === ChainId.Ethereum) return ethereumTokens;
  if (chainId === ChainId.Polkadot) return [dot$];
  if (chainId === ChainId.Bitcoin) return [btc$];
  throw new Error('received unknown chainId');
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
  const params: QuoteQueryParams = {
    amount,
    ingressAsset: routeRequest.srcTokenSymbol,
    egressAsset: routeRequest.destTokenSymbol,
  };

  const queryParams = new URLSearchParams(params);

  const url = new URL(`/quote?${queryParams.toString()}`, baseUrl).toString();

  const { data } = await axios.get<QuoteResponse>(url, { signal });

  return { quote: data, ...routeRequest };
};

type RouteWithoutQuote = Omit<RouteResponse, 'quote'>;

const executeRoute: BackendQuery<RouteWithoutQuote, SwapResponse> = async (
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

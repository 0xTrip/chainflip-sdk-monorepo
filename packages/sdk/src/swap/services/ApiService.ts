import axios from 'axios';
import type { RateQueryParams, SwapRequestBody } from '@/shared/schemas';
import { ChainId } from '../consts';
import {
  bitcoin,
  polkadot,
  dot$,
  goerli,
  goerliTokens,
  westend,
  bitcoinTest,
  ethereum,
  wnd$,
  tbtc$,
  btc$,
  ethereumTokens,
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
import { unreachable } from '../utils';

const getChains = async (useTestnets: boolean): Promise<Chain[]> => {
  if (useTestnets) return [goerli, westend, bitcoinTest];
  return [ethereum, polkadot, bitcoin];
};

const getPossibleDestinationChains = async (
  chainId: ChainId,
  useTestnets: boolean,
): Promise<Chain[]> => {
  if (useTestnets) {
    if (chainId === ChainId.Goerli) return [westend, bitcoinTest];
    if (chainId === ChainId.Westend) return [goerli, bitcoinTest];
    if (chainId === ChainId.BitcoinTest) return [goerli, westend];
    return unreachable(
      chainId as never,
      'received testnet flag but mainnet chainId',
    );
  }

  if (chainId === ChainId.Ethereum) return [bitcoin, polkadot];
  if (chainId === ChainId.Polkadot) return [ethereum, bitcoin];
  if (chainId === ChainId.Bitcoin) return [ethereum, polkadot];
  return unreachable(chainId as never, 'received unknown chainId');
};

const getTokens = async (
  chainId: ChainId,
  useTestnets: boolean,
): Promise<Token[]> => {
  if (useTestnets) {
    if (chainId === ChainId.Goerli) return goerliTokens;
    if (chainId === ChainId.Westend) return [wnd$];
    if (chainId === ChainId.BitcoinTest) return [tbtc$];
    return unreachable(
      chainId as never,
      'received testnet flag but mainnet chainId',
    );
  }

  if (chainId === ChainId.Ethereum) return ethereumTokens;
  if (chainId === ChainId.Polkadot) return [dot$];
  if (chainId === ChainId.Bitcoin) return [btc$];
  return unreachable(chainId as never, 'received unknown chainId');
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

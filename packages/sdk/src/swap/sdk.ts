import { BACKEND_SERVICE_URL, ChainId } from './consts';
import ApiService, { RequestOptions } from './services/ApiService';
import type {
  Chain,
  Token,
  RouteRequest,
  SwapResponse,
  RouteResponse,
  SwapStatusRequest,
  SwapStatusResponse,
} from './types';

export { ChainId };
export * from './types';

export type SDKOptions = {
  backendServiceUrl?: string;
};

export class SwapSDK {
  private readonly baseUrl: string;

  private readonly useTestnets = true;

  constructor(options: SDKOptions = {}) {
    this.baseUrl = options.backendServiceUrl ?? BACKEND_SERVICE_URL;
  }

  getChains(): Promise<Chain[]>;
  getChains(chainId: ChainId): Promise<Chain[] | undefined>;
  getChains(chainId?: ChainId): Promise<Chain[] | undefined> {
    if (chainId !== undefined) {
      return ApiService.getPossibleDestinationChains(chainId, this.useTestnets);
    }
    return ApiService.getChains(this.useTestnets);
  }

  getTokens(chainId: ChainId): Promise<Token[] | undefined> {
    return ApiService.getTokens(chainId, this.useTestnets);
  }

  getRoute(
    routeRequest: RouteRequest,
    options: RequestOptions = {},
  ): Promise<RouteResponse> {
    return ApiService.getRoute(this.baseUrl, routeRequest, options);
  }

  executeRoute(
    routeResponse: RouteResponse,
    options: RequestOptions = {},
  ): Promise<SwapResponse> {
    return ApiService.executeRoute(this.baseUrl, routeResponse, options);
  }

  getStatus(
    swapStatusRequest: SwapStatusRequest,
    options: RequestOptions = {},
  ): Promise<SwapStatusResponse> {
    return ApiService.getStatus(this.baseUrl, swapStatusRequest, options);
  }
}

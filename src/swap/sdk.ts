import { BACKEND_SERVICE_URL, ChainId } from './consts';
import ApiService, { RequestOptions } from './services/ApiService';
import type {
  Chain,
  Token,
  RouteRequest,
  SwapRequest,
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

  constructor(options: SDKOptions = {}) {
    this.baseUrl = options.backendServiceUrl ?? BACKEND_SERVICE_URL;
  }

  getChains(): Promise<Chain[]>;
  getChains(chainId: ChainId): Promise<Chain[] | undefined>;
  // eslint-disable-next-line class-methods-use-this
  getChains(chainId?: ChainId): Promise<Chain[] | undefined> {
    if (chainId) {
      return ApiService.getPossibleDestinationChains(chainId);
    }
    return ApiService.getChains();
  }

  // eslint-disable-next-line class-methods-use-this
  getTokens(chainId: ChainId): Promise<Token[] | undefined> {
    return ApiService.getTokens(chainId);
  }

  getRoute(
    routeRequest: RouteRequest,
    options: RequestOptions = {},
  ): Promise<RouteResponse> {
    return ApiService.getRoute(this.baseUrl, routeRequest, options);
  }

  executeRoute(
    swapRequest: SwapRequest,
    options: RequestOptions = {},
  ): Promise<SwapResponse> {
    return ApiService.executeRoute(this.baseUrl, swapRequest, options);
  }

  getStatus(
    swapStatusRequest: SwapStatusRequest,
    options: RequestOptions = {},
  ): Promise<SwapStatusResponse> {
    return ApiService.getStatus(this.baseUrl, swapStatusRequest, options);
  }
}

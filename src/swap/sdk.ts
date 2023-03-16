import { BACKEND_SERVICE_URL, ChainId } from './consts';
import ApiService from './services/ApiService';
import type { Chain, Token, RouteRequest, Route } from './types';

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

  // eslint-disable-next-line class-methods-use-this
  getRoute(routeRequest: RouteRequest): Promise<Route> {
    return ApiService.getRoute(routeRequest);
  }
}

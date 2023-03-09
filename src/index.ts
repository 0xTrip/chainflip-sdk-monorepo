import type { Chain, ChainId, Token, RouteRequest, Route } from './types';
import ApiService from './services/ApiService';

export * from './types';

export default class ChainFlipSDK {
  public async getChains(): Promise<Chain[]> {
    return ApiService.getChains();
  }

  public async getPossibleDestinationChain(
    chainId: ChainId,
  ): Promise<Chain[] | undefined> {
    return ApiService.getPossibleDestinationChains(chainId);
  }

  public async getTokens(chainId: ChainId): Promise<Token[] | undefined> {
    return ApiService.getTokens(chainId);
  }

  public async getRoute(routeRequest: RouteRequest): Promise<Route> {
    return ApiService.getRoute(routeRequest);
  }
}

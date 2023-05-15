import axios from 'axios';
import { ChainId } from '../../consts';
import { RouteRequest } from '../../types';
import ApiService from '../ApiService';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('ApiService', () => {
  const mockRoute = {
    amount: '10000',
    egressAddress: '',
    srcChainId: ChainId.Bitcoin,
    srcTokenSymbol: 'BTC',
    destChainId: ChainId.Ethereum,
    destTokenSymbol: 'ETH',
  } satisfies RouteRequest;

  describe(ApiService.getChains, () => {
    it('gets testnet chains', async () => {
      expect(await ApiService.getChains(true)).toMatchSnapshot();
    });
    it('gets mainnet chains', async () => {
      expect(await ApiService.getChains(false)).toMatchSnapshot();
    });
  });

  describe(ApiService.getTokens, () => {
    it.each([ChainId.Ethereum, ChainId.Bitcoin, ChainId.Polkadot])(
      'gets the correct tokens for testnets (%d)',
      async (chainId) => {
        expect(await ApiService.getTokens(chainId, true)).toMatchSnapshot();
      },
    );

    it.each([ChainId.Ethereum, ChainId.Bitcoin, ChainId.Polkadot])(
      'gets the correct tokens for mainnets (%d)',
      async (chainId) => {
        expect(await ApiService.getTokens(chainId, false)).toMatchSnapshot();
      },
    );
  });

  describe(ApiService.getRoute, () => {
    it('gets a route with a quote', async () => {
      const mockedGet = jest.mocked(axios.get);
      mockedGet.mockResolvedValueOnce({
        data: {
          id: 'string',
          intermediateAmount: '1',
          egressAmount: '2',
        },
      });

      const route = await ApiService.getRoute(
        'https://swapperoo.org',
        {
          amount: '10000',
          egressAddress: '',
          srcChainId: ChainId.Bitcoin,
          srcTokenSymbol: 'BTC',
          destChainId: ChainId.Ethereum,
          destTokenSymbol: 'ETH',
        },
        {},
      );

      expect(route).toMatchSnapshot();
      expect(mockedGet.mock.lastCall).toMatchSnapshot();
    });

    it('passes the signal to axios', async () => {
      const mockedGet = jest.mocked(axios.get);
      mockedGet.mockResolvedValueOnce({
        data: {
          id: 'string',
          intermediateAmount: '1',
          egressAmount: '2',
        },
      });

      await ApiService.getRoute('https://swapperoo.org', mockRoute, {
        signal: new AbortController().signal,
      });

      expect(mockedGet.mock.lastCall?.[1]?.signal).not.toBeUndefined();
    });
  });

  describe(ApiService.executeRoute, () => {
    it('executes the route and returns the data from the service', async () => {
      const mockedPost = jest.mocked(axios.post);
      const response = {
        id: 'new deposit channel id',
        ingressAddress: '0xcafebabe',
      };
      mockedPost.mockResolvedValueOnce({ data: response });

      const depositChannel = await ApiService.executeRoute(
        'https://swapperoo.org',
        {
          ...mockRoute,
          expectedIngressAmount: mockRoute.amount,
        },
        {},
      );
      expect(depositChannel).toEqual(response);
    });

    it('passes on the signal', async () => {
      const mockedPost = jest.mocked(axios.post);
      mockedPost.mockResolvedValueOnce({
        data: { id: 'new deposit channel id', ingressAddress: '0xcafebabe' },
      });

      await ApiService.executeRoute(
        'https://swapperoo.org',
        {
          ...mockRoute,
          expectedIngressAmount: mockRoute.amount,
        },
        {
          signal: new AbortController().signal,
        },
      );
      expect(mockedPost.mock.lastCall?.[2]?.signal).not.toBeUndefined();
    });
  });

  describe(ApiService.getStatus, () => {
    it('forwards whatever response it gets from the swap service', async () => {
      const mockedGet = jest.mocked(axios.get);
      mockedGet.mockResolvedValueOnce({ data: 'hello darkness' });
      mockedGet.mockResolvedValueOnce({ data: 'my old friend' });

      const statusRequest = { swapIntentId: 'the id' };

      const status1 = await ApiService.getStatus(
        'https://swapperoo.org',
        statusRequest,
        {},
      );
      expect(status1).toBe('hello darkness');
      const status2 = await ApiService.getStatus(
        'https://swapperoo.org',
        statusRequest,
        {},
      );
      expect(status2).toBe('my old friend');
    });

    it('passes the signal to axios', async () => {
      const mockedGet = jest.mocked(axios.get);
      mockedGet.mockResolvedValueOnce({ data: null });

      await ApiService.getStatus(
        'https://swapperoo.org',
        { swapIntentId: '' },
        { signal: new AbortController().signal },
      );

      expect(mockedGet.mock.lastCall?.[1]?.signal).not.toBeUndefined();
    });
  });
});
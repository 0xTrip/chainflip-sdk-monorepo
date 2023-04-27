import * as crypto from 'crypto';
import { Subject } from 'rxjs';

describe('quotes', () => {
  let oldEnv: NodeJS.ProcessEnv;
  let collectQuotes: typeof import('../quotes').collectQuotes = jest.fn();
  let findBestQuote: typeof import('../quotes').findBestQuote = jest.fn();
  let buildQuoteRequest: typeof import('../quotes').buildQuoteRequest =
    jest.fn();

  beforeEach(async () => {
    jest.resetModules();
    oldEnv = process.env;
    ({ collectQuotes, findBestQuote, buildQuoteRequest } = await import(
      '../quotes'
    ));
  });

  afterEach(() => {
    process.env = oldEnv;
  });

  describe(collectQuotes, () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const quotes$ = new Subject<{ client: string; quote: any }>();

    it('returns an empty array if expectedQuotes is 0', async () => {
      expect(await collectQuotes('id', 0, quotes$)).toEqual([]);
    });

    it('returns an empty array if no quotes are received', async () => {
      const promise = collectQuotes('id', 1, quotes$);
      jest.advanceTimersByTime(1001);
      expect(await promise).toEqual([]);
    });

    it('returns an array of quotes if expectedQuotes is received', async () => {
      const id = crypto.randomUUID();
      const promise = collectQuotes(id, 1, quotes$);
      quotes$.next({ client: 'client', quote: { id } });
      expect(await promise).toEqual([{ id }]);
    });

    it('accepts only the first quote from each client', async () => {
      const id = crypto.randomUUID();
      const promise = collectQuotes(id, 2, quotes$);
      for (let i = 0; i < 2; i += 1) {
        quotes$.next({ client: 'client', quote: { id, index: i } });
      }
      jest.advanceTimersByTime(1001);
      expect(await promise).toEqual([{ id, index: 0 }]);
    });

    it('can be configured with QUOTE_TIMEOUT', async () => {
      jest.resetModules();
      process.env.QUOTE_TIMEOUT = '100';
      ({ collectQuotes } = await import('../quotes'));
      const id = crypto.randomUUID();
      const promise = collectQuotes(id, 1, quotes$);
      jest.advanceTimersByTime(101);
      quotes$.next({ client: 'client', quote: { id } });
      expect(await promise).toEqual([]);
    });

    it('eagerly returns after all expected quotes are received', async () => {
      const id = crypto.randomUUID();
      const promise = collectQuotes(id, 2, quotes$);
      quotes$.next({ client: 'client', quote: { id, value: 1 } });
      quotes$.next({ client: 'client2', quote: { id, value: 2 } });
      // no need to advance timers because setTimeout is never called
      expect(await promise).toEqual([
        { id, value: 1 },
        { id, value: 2 },
      ]);
    });
  });

  describe(findBestQuote, () => {
    it('returns the quote with the highest egressAmount', () => {
      const a = { egressAmount: '1' };
      const b = { egressAmount: '2' };
      expect(findBestQuote([a, b])).toBe(b);
      expect(findBestQuote([b, a])).toBe(b);
    });

    it('returns the quote with the highest egressAmount if many match', () => {
      const a = { egressAmount: '1' };
      const b = { egressAmount: '2' };
      const c = { egressAmount: '2' };
      expect(findBestQuote([c, a, b])).toBe(c);
      expect(findBestQuote([b, a, c])).toBe(b);
    });

    it('returns undefined if no quotes are provided', () => {
      expect(findBestQuote([])).toBeNull();
    });

    it('returns the only quote if only one is provided', () => {
      const a = { egressAmount: '1' };
      expect(findBestQuote([a])).toBe(a);
    });
  });

  describe(buildQuoteRequest, () => {
    it('returns a QuoteRequest', () => {
      expect(
        buildQuoteRequest({
          ingressAsset: 'FLIP',
          egressAsset: 'ETH',
          amount: '1000000000000000000',
        }),
      ).toEqual({
        id: expect.any(String),
        ingress_asset: 'FLIP',
        intermediate_asset: 'USDC',
        egress_asset: 'ETH',
        ingress_amount: '1000000000000000000',
      });
    });

    it('returns a QuoteRequest with a null intermediate_asset if ingressAsset is USDC', () => {
      expect(
        buildQuoteRequest({
          ingressAsset: 'USDC',
          egressAsset: 'ETH',
          amount: '100000000',
        }),
      ).toEqual({
        id: expect.any(String),
        ingress_asset: 'USDC',
        intermediate_asset: null,
        egress_asset: 'ETH',
        ingress_amount: '100000000',
      });
    });

    it('returns a QuoteRequest with a null intermediate_asset if egressAsset is USDC', () => {
      expect(
        buildQuoteRequest({
          ingressAsset: 'ETH',
          egressAsset: 'USDC',
          amount: '100000000',
        }),
      ).toEqual({
        id: expect.any(String),
        ingress_asset: 'ETH',
        intermediate_asset: null,
        egress_asset: 'USDC',
        ingress_amount: '100000000',
      });
    });
  });
});

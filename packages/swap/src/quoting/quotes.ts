import assert from 'assert';
import * as crypto from 'crypto';
import { Observable, Subscription, filter } from 'rxjs';
import {
  QuoteRequest,
  QuoteResponse,
  QuoteQueryParams,
} from '@/shared/schemas';
import { Comparison, compareNumericStrings } from '../utils/string';

const QUOTE_TIMEOUT = Number.parseInt(process.env.QUOTE_TIMEOUT ?? '1000', 10);

export const collectQuotes = (
  requestId: string,
  expectedQuotes: number,
  quotes$: Observable<{ client: string; quote: QuoteResponse }>,
): Promise<QuoteResponse[]> => {
  if (expectedQuotes === 0) return Promise.resolve([]);

  const clientsReceivedQuotes = new Set<string>();
  const quotes: QuoteResponse[] = [];

  return new Promise((resolve) => {
    let sub: Subscription;

    const complete = () => {
      sub.unsubscribe();
      resolve(quotes);
    };

    sub = quotes$
      .pipe(filter(({ quote }) => quote.id === requestId))
      .subscribe(({ client, quote }) => {
        if (clientsReceivedQuotes.has(client)) return;
        clientsReceivedQuotes.add(client);
        quotes.push(quote);
        if (quotes.length === expectedQuotes) complete();
      });

    setTimeout(complete, QUOTE_TIMEOUT);
  });
};

export const findBestQuote = (
  quotes: QuoteResponse[],
  brokerQuote: QuoteResponse,
): QuoteResponse =>
  quotes.reduce((a, b) => {
    const cmpResult = compareNumericStrings(a.egressAmount, b.egressAmount);
    return cmpResult === Comparison.Less ? b : a;
  }, brokerQuote);

export const buildQuoteRequest = (query: QuoteQueryParams): QuoteRequest => {
  const { ingressAsset, egressAsset, amount } = query;

  if (ingressAsset === 'USDC') {
    assert(egressAsset !== 'USDC');
    return {
      id: crypto.randomUUID(),
      ingress_asset: ingressAsset,
      intermediate_asset: null,
      egress_asset: egressAsset,
      ingress_amount: amount,
    };
  }

  if (egressAsset === 'USDC') {
    return {
      id: crypto.randomUUID(),
      ingress_asset: ingressAsset,
      intermediate_asset: null,
      egress_asset: egressAsset,
      ingress_amount: amount,
    };
  }

  return {
    id: crypto.randomUUID(),
    ingress_asset: ingressAsset,
    intermediate_asset: 'USDC',
    egress_asset: egressAsset,
    ingress_amount: amount,
  };
};

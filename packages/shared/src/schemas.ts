import { z } from 'zod';
import { SupportedAsset, supportedAsset } from './assets';
import { numericString } from './parsers';

export const quoteQuerySchema = z.object({
  ingressAsset: supportedAsset,
  egressAsset: supportedAsset,
  amount: numericString,
});

export type QuoteQueryParams = z.infer<typeof quoteQuerySchema>;

export const newSwapSchema = z.object({
  ingressAsset: supportedAsset,
  egressAsset: supportedAsset,
  egressAddress: z.string(),
});

export type SwapRequestBody = z.infer<typeof newSwapSchema>;

export const quoteResponseSchema = z.union([
  z
    .object({
      id: z.string(),
      intermediate_amount: z.string(),
      egress_amount: z.string(),
    })
    .transform(({ id, ...rest }) => ({
      id,
      intermediateAmount: rest.intermediate_amount,
      egressAmount: rest.egress_amount,
    })),
  z
    .object({
      id: z.string(),
      egress_amount: z.string(),
    })
    .transform(({ id, ...rest }) => ({ id, egressAmount: rest.egress_amount })),
]);

export type QuoteResponse = z.infer<typeof quoteResponseSchema>;

interface BaseRequest {
  id: string; // random UUID
  ingress_amount: string; // base unit of the ingress asset, e.g. wei for ETH
}

interface Intermediate extends BaseRequest {
  ingress_asset: Exclude<SupportedAsset, 'USDC'>;
  intermediate_asset: 'USDC';
  egress_asset: Exclude<SupportedAsset, 'USDC'>;
}

interface USDCIngress extends BaseRequest {
  ingress_asset: 'USDC';
  intermediate_asset: null;
  egress_asset: Exclude<SupportedAsset, 'USDC'>;
}

interface USDCEgress extends BaseRequest {
  ingress_asset: Exclude<SupportedAsset, 'USDC'>;
  intermediate_asset: null;
  egress_asset: 'USDC';
}

export type QuoteRequest = Intermediate | USDCIngress | USDCEgress;

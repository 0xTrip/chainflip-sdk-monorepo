import { z } from 'zod';
import { supportedAsset } from './assets';
import { numericString } from './parsers';

export const rateQuerySchema = z.object({
  ingressAsset: supportedAsset,
  egressAsset: supportedAsset,
  amount: numericString,
});

export type RateQueryParams = z.infer<typeof rateQuerySchema>;

export const newSwapSchema = z.object({
  ingressAsset: supportedAsset,
  egressAsset: supportedAsset,
  egressAddress: z.string(),
});

export type SwapRequestBody = z.infer<typeof newSwapSchema>;

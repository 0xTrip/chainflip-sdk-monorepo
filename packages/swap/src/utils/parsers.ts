import { z } from 'zod';

export const thirdPartySwapSchema = z.object({
  uuid: z.string(),
  routeResponse: z
    .object({
      integration: z.enum(['lifi', 'squid']),
    })
    .passthrough(), // pass through routeResponse objects until we are fully certain of its shape
});

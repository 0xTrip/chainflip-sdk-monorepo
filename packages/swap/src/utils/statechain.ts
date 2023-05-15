import { z } from 'zod';
import { SupportedAsset, supportedAsset } from '@/shared/assets';
import { numericString } from '@/shared/parsers';
import { memoize } from './function';
import RpcClient from './RpcClient';
import { transformAsset } from './string';
import { QuoteResponse, QuoteQueryParams } from '../schemas';

const requestValidators = {
  swap_rate: z.tuple([
    supportedAsset.transform(transformAsset),
    supportedAsset.transform(transformAsset),
    numericString,
  ]),
};

// parse hex encoding or decimal encoding into decimal encoding
const assetAmount = z.string().transform((v) => BigInt(v).toString());

const responseValidators = {
  swap_rate: z.object({
    // TODO: simplify when we know how Rust `Option` is encoded
    intermediary: assetAmount.optional().nullable(),
    output: assetAmount,
  }),
};

const initializeClient = memoize(async () => {
  const rpcClient = await new RpcClient(
    process.env.RPC_NODE_WSS_URL as string,
    requestValidators,
    responseValidators,
    'cf',
  ).connect();

  return rpcClient;
});

const getSwapAmount = async (
  fromAsset: SupportedAsset,
  toAsset: SupportedAsset,
  amount: string,
): Promise<z.infer<(typeof responseValidators)['swap_rate']>> => {
  const client = await initializeClient();

  return client.sendRequest('swap_rate', fromAsset, toAsset, amount);
};

export const getBrokerQuote = async (
  { ingressAsset, egressAsset, amount }: QuoteQueryParams,
  id: string,
): Promise<QuoteResponse> => {
  const { intermediary, output } = await getSwapAmount(
    ingressAsset,
    egressAsset,
    amount,
  );

  return {
    id,
    intermediateAmount: intermediary ?? undefined,
    egressAmount: output,
  };
};

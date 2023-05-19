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
  depositAsset: SupportedAsset,
  destinationAsset: SupportedAsset,
  amount: string,
): Promise<z.infer<(typeof responseValidators)['swap_rate']>> => {
  const client = await initializeClient();

  return client.sendRequest(
    'swap_rate',
    depositAsset,
    destinationAsset,
    amount,
  );
};

export const getBrokerQuote = async (
  { depositAsset, destinationAsset, amount }: QuoteQueryParams,
  id: string,
): Promise<QuoteResponse> => {
  const { intermediary, output } = await getSwapAmount(
    depositAsset,
    destinationAsset,
    amount,
  );

  return {
    id,
    intermediateAmount: intermediary ?? undefined,
    egressAmount: output,
  };
};

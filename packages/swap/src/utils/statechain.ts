import assert from 'assert';
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
const u128Fixed = z.string().transform((v) => BigInt(v).toString());

const validators = {
  swap_rate: u128Fixed,
};

const initializeClient = memoize(async () => {
  const rpcClient = await new RpcClient(
    process.env.RPC_NODE_WSS_URL as string,
    requestValidators,
    validators,
    'cf',
  ).connect();

  return rpcClient;
});

const getSwapAmount = async (
  fromAsset: SupportedAsset,
  toAsset: SupportedAsset,
  amount: string,
): Promise<string> => {
  const client = await initializeClient();

  return client.sendRequest('swap_rate', fromAsset, toAsset, amount);
};

export const getBrokerQuote = async (
  { ingressAsset, egressAsset, amount }: QuoteQueryParams,
  id: string,
): Promise<QuoteResponse> => {
  if (ingressAsset === 'USDC' || egressAsset === 'USDC') {
    assert(ingressAsset !== egressAsset);
    const egressAmount = await getSwapAmount(ingressAsset, egressAsset, amount);

    return { id, egressAmount };
  }

  const intermediateAmount = await getSwapAmount(ingressAsset, 'USDC', amount);
  const egressAmount = await getSwapAmount(
    'USDC',
    egressAsset,
    intermediateAmount,
  );

  return { id, intermediateAmount, egressAmount };
};

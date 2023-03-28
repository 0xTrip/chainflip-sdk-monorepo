import { z } from 'zod';
import { supportedAsset, SupportedAsset } from './assets';
import { memoize } from './function';
import { bareHexString, hexString, numericString } from './parsers';
import RpcClient from './RpcClient';
import { transformAsset } from './string';

type NewSwapIntent = {
  ingressAsset: SupportedAsset;
  egressAsset: SupportedAsset;
  egressAddress: string;
};

const address = z.union([hexString, bareHexString.transform((v) => `0x${v}`)]);

const requestValidators = {
  newSwapIngressAddress: z
    .tuple([
      supportedAsset.transform(transformAsset),
      supportedAsset.transform(transformAsset),
      numericString.or(hexString),
      z.number(),
    ])
    .transform(([a, b, c, d]) => [a, b, c, d]),
};

const validators = {
  newSwapIngressAddress: address,
};

const initializeClient = memoize(async () => {
  const rpcClient = await new RpcClient(
    process.env.RPC_RELAYER_WSS_URL as string,
    requestValidators,
    validators,
    'relayer',
  ).connect();

  return rpcClient;
});

export const submitSwapToRelayer = async (
  swapIntent: NewSwapIntent,
): Promise<string> => {
  const client = await initializeClient();

  const ingressAddress = await client.sendRequest(
    'newSwapIngressAddress',
    swapIntent.ingressAsset,
    swapIntent.egressAsset,
    swapIntent.egressAddress,
    0,
  );

  return ingressAddress;
};

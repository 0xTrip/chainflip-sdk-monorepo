import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { z } from 'zod';
import { supportedAsset, SupportedAsset } from '@/shared/assets';
import {
  bareHexString,
  btcString,
  hexString,
  numericString,
} from '@/shared/parsers';
import { memoize } from './function';
import RpcClient from './RpcClient';
import { transformAsset } from './string';

type NewSwapIntent = {
  ingressAsset: SupportedAsset;
  egressAsset: SupportedAsset;
  egressAddress: string;
};

const address = z.union([
  hexString,
  bareHexString.transform((v) => `0x${v}`),
  btcString,
]);

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

const responseValidators = {
  newSwapIngressAddress: address,
};

const initializeClient = memoize(async () => {
  const rpcClient = await new RpcClient(
    process.env.RPC_RELAYER_WSS_URL as string,
    requestValidators,
    responseValidators,
    'relayer',
  ).connect();

  return rpcClient;
});

export const submitSwapToBroker = async (
  swapIntent: NewSwapIntent,
): Promise<string> => {
  const { ingressAsset, egressAsset, egressAddress } = swapIntent;
  const client = await initializeClient();
  const ingressAddress = await client.sendRequest(
    'newSwapIngressAddress',
    ingressAsset,
    egressAsset,
    egressAsset === 'DOT' // btc not yet implemented on broker side
      ? u8aToHex(decodeAddress(egressAddress))
      : egressAddress,
    0,
  );

  return ingressAddress;
};

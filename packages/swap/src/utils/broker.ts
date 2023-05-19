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

type NewSwapRequest = {
  depositAsset: SupportedAsset;
  destinationAsset: SupportedAsset;
  destinationAddress: string;
};

const address = z.union([
  hexString,
  bareHexString.transform((v) => `0x${v}`),
  btcString,
]);

const requestValidators = {
  requestSwapDepositAddress: z
    .tuple([
      supportedAsset.transform(transformAsset),
      supportedAsset.transform(transformAsset),
      numericString.or(hexString),
      z.number(),
    ])
    .transform(([a, b, c, d]) => [a, b, c, d]),
};

const responseValidators = {
  requestSwapDepositAddress: address,
};

const initializeClient = memoize(async () => {
  const rpcClient = await new RpcClient(
    process.env.RPC_BROKER_WSS_URL as string,
    requestValidators,
    responseValidators,
    'broker',
  ).connect();

  return rpcClient;
});

export const submitSwapToBroker = async (
  swapRequest: NewSwapRequest,
): Promise<string> => {
  const { depositAsset, destinationAsset, destinationAddress } = swapRequest;
  const client = await initializeClient();
  const depositAddress = await client.sendRequest(
    'requestSwapDepositAddress',
    depositAsset,
    destinationAsset,
    destinationAsset === 'DOT' // btc not yet implemented on broker side
      ? u8aToHex(decodeAddress(destinationAddress))
      : destinationAddress,
    0,
  );

  return depositAddress;
};

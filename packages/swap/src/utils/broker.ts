import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { z } from 'zod';
import { supportedAsset, SupportedAsset } from '@/shared/assets';
import {
  hexString,
  numericString,
  btcString,
  bareHexString,
} from '@/shared/parsers';
import { memoize } from './function';
import RpcClient from './RpcClient';
import { transformAsset } from './string';

type NewSwapRequest = {
  depositAsset: SupportedAsset;
  destinationAsset: SupportedAsset;
  destinationAddress: string;
};

const requestValidators = {
  requestSwapDepositAddress: z
    .tuple([
      supportedAsset.transform(transformAsset),
      supportedAsset.transform(transformAsset),
      z.union([numericString, hexString, btcString]),
      z.number(),
    ])
    .transform(([a, b, c, d]) => [a, b, c, d]),
};

const responseValidators = {
  requestSwapDepositAddress: z
    .object({
      address: z.union([
        hexString,
        bareHexString.transform((v) => `0x${v}`),
        btcString,
      ]),
      expiry_block: z.number(),
    })
    .transform(({ address, expiry_block: expiryBlock }) => ({
      depositAddress: address,
      expiryBlock,
    })),
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

export type DepositChannelResponse = z.infer<
  (typeof responseValidators)['requestSwapDepositAddress']
>;

export const submitSwapToBroker = async (
  swapRequest: NewSwapRequest,
): Promise<DepositChannelResponse> => {
  const { depositAsset, destinationAsset, destinationAddress } = swapRequest;
  const client = await initializeClient();
  const depositAddress = await client.sendRequest(
    'requestSwapDepositAddress',
    depositAsset,
    destinationAsset,
    destinationAsset === 'DOT'
      ? u8aToHex(decodeAddress(destinationAddress))
      : destinationAddress,
    0,
  );

  return depositAddress;
};

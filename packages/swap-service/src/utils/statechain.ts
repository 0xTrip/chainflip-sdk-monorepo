import {
  SupportedAsset,
  supportedAsset,
} from '@chainflip-io/sdk-shared/assets';
import { numericString } from '@chainflip-io/sdk-shared/parsers';
import BigNumber from 'bignumber.js';
import { z } from 'zod';
import { decimalPlaces } from './assets';
import { memoize } from './function';
import RpcClient from './RpcClient';
import { transformAsset } from './string';

const requestValidators = {
  swap_rate: z.tuple([
    supportedAsset.transform(transformAsset),
    supportedAsset.transform(transformAsset),
    numericString,
  ]),
};

const u128Fixed = z.string().transform((v) => new BigNumber(v));

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

const FIXED_U128_DECIMAL_PLACES = 18;

export const getRateEstimate = async ({
  ingressAsset,
  egressAsset,
  amount,
}: {
  ingressAsset: SupportedAsset;
  egressAsset: SupportedAsset;
  amount: string;
}) => {
  const client = await initializeClient();

  const decimalPlacesToRemove =
    FIXED_U128_DECIMAL_PLACES -
    decimalPlaces[ingressAsset] +
    decimalPlaces[egressAsset];

  const rate = await client.sendRequest(
    'swap_rate',
    ingressAsset,
    egressAsset,
    amount,
  );

  return rate.dividedBy(new BigNumber(10).pow(decimalPlacesToRemove)).toFixed();
};

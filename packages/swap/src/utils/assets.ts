import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import * as ethers from 'ethers';
import { z } from 'zod';
import { SupportedAsset, supportedAsset } from '@/shared/assets';
import ServiceError from './ServiceError';

export const stateChainAsset = z
  .enum(['Usdc', 'Flip', 'Dot', 'Eth'])
  .transform((val) => val.toUpperCase() as SupportedAsset);

export const validateAddress = (
  egressAsset: SupportedAsset,
  address: string,
): void => {
  if (
    (egressAsset === 'ETH' ||
      egressAsset === 'FLIP' ||
      egressAsset === 'USDC') &&
    ethers.isAddress(address)
  ) {
    return;
  }

  if (egressAsset === 'DOT') {
    try {
      encodeAddress(
        isHex(address) ? hexToU8a(address) : decodeAddress(address),
      );

      return;
    } catch {
      // pass
    }
  }

  throw ServiceError.badRequest('provided address is not valid');
};

export const isSupportedAsset = (value: string): value is SupportedAsset =>
  supportedAsset.safeParse(value).success;

export function assertSupportedAsset(
  value: string,
): asserts value is SupportedAsset {
  if (!isSupportedAsset(value)) {
    throw new Error(`received invalid asset "${value}"`);
  }
}

export const decimalPlaces: Record<SupportedAsset, number> = {
  DOT: 10,
  ETH: 18,
  FLIP: 18,
  USDC: 6,
  BTC: 8,
};

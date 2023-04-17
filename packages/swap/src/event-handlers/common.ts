import { z } from 'zod';
import { SupportedAsset, Network, network } from '@/shared/assets';
import { hexString, unsignedInteger } from '@/shared/parsers';
import { stateChainAsset } from '../utils/assets';

export const assetToNetwork: Record<SupportedAsset, Network> = {
  DOT: 'Polkadot',
  ETH: 'Ethereum',
  FLIP: 'Ethereum',
  USDC: 'Ethereum',
  BTC: 'Bitcoin',
};

export const egressId = z.tuple([
  z.object({ __kind: network }).transform(({ __kind }) => __kind),
  unsignedInteger,
]);

export const chainAddress = z
  .object({ __kind: stateChainAsset, value: hexString })
  .transform(
    ({ __kind, value }) =>
      ({
        chain: __kind,
        address: value,
      } as const),
  );

import { z } from 'zod';
import { SupportedAsset } from '../utils/assets';
import { unsignedInteger } from '../utils/parsers';

export const network = z.enum(['Polkadot', 'Ethereum']);
export type Network = z.infer<typeof network>;

export const assetToNetwork: Record<SupportedAsset, Network> = {
  DOT: 'Polkadot',
  ETH: 'Ethereum',
  FLIP: 'Ethereum',
  USDC: 'Ethereum',
};

export const egressId = z.tuple([
  z.object({ __kind: network }).transform(({ __kind }) => __kind),
  unsignedInteger,
]);

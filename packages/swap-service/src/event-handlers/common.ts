import { z } from 'zod';
import { SupportedAsset, Network, network } from '@/shared/assets';
import { unsignedInteger } from '@/shared/parsers';

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

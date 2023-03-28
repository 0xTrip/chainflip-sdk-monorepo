import {
  SupportedAsset,
  Network,
  network,
} from '@chainflip-io/sdk-shared/assets';
import { unsignedInteger } from '@chainflip-io/sdk-shared/parsers';
import { z } from 'zod';

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

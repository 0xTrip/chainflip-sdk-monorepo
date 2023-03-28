import { z } from 'zod';

const supportedNetworks = ['Polkadot', 'Ethereum', 'Bitcoin'] as const;
export const network = z.enum(supportedNetworks);
export type Network = (typeof supportedNetworks)[number];

const supportedAssets = ['FLIP', 'USDC', 'DOT', 'ETH', 'BTC'] as const;
export const supportedAsset = z.enum(supportedAssets);
export type SupportedAsset = (typeof supportedAssets)[number];
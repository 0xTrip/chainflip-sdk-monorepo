export enum ChainId {
  Ethereum = 1,
  Goerli = 5,
  Polkadot,
  Westend, // we will be using an internal test network for polkadot this is a placeholder for now
  Bitcoin,
  BitcoinTest,
}

export type { SupportedAsset as TokenSymbol } from '@/shared/assets';

// value to be replaced at build time with `envsubst` or similar
export const BACKEND_SERVICE_URL = '$BACKEND_SERVICE_URL';

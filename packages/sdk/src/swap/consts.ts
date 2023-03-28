export enum ChainId {
  Ethereum = 1,
  Polkadot,
  Bitcoin,
}

export type { SupportedAsset as TokenSymbol } from '@/shared/assets';

// value to be replaced at build time with `envsubst` or similar
export const BACKEND_SERVICE_URL = '$BACKEND_SERVICE_URL';

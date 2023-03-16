export enum ChainId {
  Ethereum = 1,
  Polkadot,
  Bitcoin,
}

export enum TokenSymbol {
  FLIP = 'FLIP',
  USDC = 'USDC',
  DOT = 'DOT',
  ETH = 'ETH',
  BTC = 'BTC',
}

// value to be replaced at build time with `envsubst` or similar
export const BACKEND_SERVICE_URL = '$BACKEND_SERVICE_URL';

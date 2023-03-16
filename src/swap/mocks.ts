import type { Chain, Token } from './types';

export const ethereum: Chain = {
  id: 1,
  name: 'ethereum',
};

export const polkadot: Chain = {
  id: 2,
  name: 'polkadot',
};

export const bitcoin: Chain = {
  id: 3,
  name: 'bitcoin',
};

export const eth$: Token = {
  chainId: 1,
  contractAddress: '0xeth',
  decimals: 18,
  name: 'ether',
  symbol: 'ETH',
};

export const usdc$: Token = {
  chainId: 1,
  contractAddress: '0xusdc',
  decimals: 6,
  name: 'usdc',
  symbol: 'USDC',
};

export const flip$: Token = {
  chainId: 1,
  contractAddress: '0xflip',
  decimals: 18,
  name: 'flip',
  symbol: 'FLIP',
};

export const dot$: Token = {
  chainId: 2,
  contractAddress: '0xdot',
  decimals: 10,
  name: 'dot',
  symbol: 'DOT',
};

export const btc$: Token = {
  chainId: 3,
  contractAddress: '0xbitcoin',
  decimals: 8,
  name: 'bitcoin',
  symbol: 'BTC',
};

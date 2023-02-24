import { Chain, Token } from './types';

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

export const ether$: Token = {
  chainId: 1,
  contractAddress: '0xeth',
  decimals: 18,
  name: 'ether',
  ticker: 'ETH',
};

export const usdc$: Token = {
  chainId: 1,
  contractAddress: '0xusdc',
  decimals: 6,
  name: 'usdc',
  ticker: 'USDC',
};

export const flip$: Token = {
  chainId: 1,
  contractAddress: '0xflip',
  decimals: 18,
  name: 'flip',
  ticker: 'FLIP',
};

export const polkadot$: Token = {
  chainId: 2,
  contractAddress: '0xdot',
  decimals: 10,
  name: 'dot',
  ticker: 'DOT',
};

export const bitcoin$: Token = {
  chainId: 3,
  contractAddress: '0xbitcoin',
  decimals: 6,
  name: 'bitcoin',
  ticker: 'BTC',
};

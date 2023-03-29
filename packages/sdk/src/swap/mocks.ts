import { ChainId } from './consts';
import type { Chain, Token } from './types';

export const ethereum: Chain = {
  id: ChainId.Ethereum,
  name: 'ethereum',
};

export const goerli: Chain = {
  id: ChainId.Goerli,
  name: 'goerli',
};

export const polkadot: Chain = {
  id: ChainId.Polkadot,
  name: 'polkadot',
};

export const bitcoin: Chain = {
  id: ChainId.Bitcoin,
  name: 'bitcoin',
};

export const goerliTokens: Token[] = [
  {
    chainId: ChainId.Goerli,
    contractAddress: '0xeth',
    decimals: 18,
    name: 'ether',
    symbol: 'ETH',
  },
  {
    chainId: ChainId.Goerli,
    contractAddress: '0xusdc',
    decimals: 6,
    name: 'usdc',
    symbol: 'USDC',
  },
  {
    chainId: ChainId.Goerli,
    contractAddress: '0xflip',
    decimals: 18,
    name: 'flip',
    symbol: 'FLIP',
  },
];

export const dot$: Token = {
  chainId: ChainId.Polkadot,
  contractAddress: '0xdot',
  decimals: 10,
  name: 'dot',
  symbol: 'DOT',
};

export const btc$: Token = {
  chainId: ChainId.Bitcoin,
  contractAddress: '0xbitcoin',
  decimals: 8,
  name: 'bitcoin',
  symbol: 'BTC',
};

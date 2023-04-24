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

export const westend: Chain = {
  id: ChainId.Westend,
  name: 'westend',
};

export const bitcoin: Chain = {
  id: ChainId.Bitcoin,
  name: 'bitcoin',
};

export const bitcoinTest: Chain = {
  id: ChainId.BitcoinTest,
  name: 'bitcoin-test',
};

export const ethereumTokens: Token[] = [
  {
    chainId: ChainId.Ethereum,
    contractAddress: '0xeth',
    decimals: 18,
    name: 'ether',
    symbol: 'ETH',
  },
  {
    chainId: ChainId.Ethereum,
    contractAddress: '0xusdc',
    decimals: 6,
    name: 'usdc',
    symbol: 'USDC',
  },
  {
    chainId: ChainId.Ethereum,
    contractAddress: '0xflip',
    decimals: 18,
    name: 'flip',
    symbol: 'FLIP',
  },
];

export const goerliTokens: Token[] = [
  {
    chainId: ChainId.Goerli,
    contractAddress: '0xeth',
    decimals: 18,
    name: 'goerli ether',
    symbol: 'gETH',
  },
  {
    chainId: ChainId.Goerli,
    contractAddress: '0xusdc',
    decimals: 6,
    name: 'goerli usdc',
    symbol: 'gUSDC',
  },
  {
    chainId: ChainId.Goerli,
    contractAddress: '0xflip',
    decimals: 18,
    name: 'test flip',
    symbol: 'tFLIP',
  },
];

export const dot$: Token = {
  chainId: ChainId.Polkadot,
  contractAddress: '0xdot',
  decimals: 10,
  name: 'dot',
  symbol: 'DOT',
};

export const wnd$: Token = {
  chainId: ChainId.Westend,
  contractAddress: '0xwnd',
  decimals: 10,
  name: 'westend',
  symbol: 'WND',
};

export const btc$: Token = {
  chainId: ChainId.Bitcoin,
  contractAddress: '0xbitcoin',
  decimals: 8,
  name: 'bitcoin',
  symbol: 'BTC',
};

export const tbtc$: Token = {
  chainId: ChainId.BitcoinTest,
  contractAddress: '0xbitcoin',
  decimals: 8,
  name: 'bitcoin-test',
  symbol: 'tBTC',
};

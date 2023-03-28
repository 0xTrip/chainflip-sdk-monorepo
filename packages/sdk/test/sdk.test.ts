import { ChainId } from '../src/swap/consts';
import {
  bitcoin,
  btc$,
  ethereum,
  eth$,
  flip$,
  polkadot,
  dot$,
  usdc$,
} from '../src/swap/mocks';
import { SwapSDK } from '../src/swap/sdk';

describe('Chainflip SDK', () => {
  describe('chains', () => {
    it('should return the available chains', async () => {
      const sdk = new SwapSDK();
      expect(await sdk.getChains()).toStrictEqual([
        ethereum,
        polkadot,
        bitcoin,
      ]);
    });
  });

  describe('tokens', () => {
    it('should return the available tokens for ethereum', async () => {
      const sdk = new SwapSDK();
      expect(await sdk.getTokens(ChainId.Ethereum)).toStrictEqual([
        eth$,
        usdc$,
        flip$,
      ]);
    });
    it('should return the available tokens for polkadot', async () => {
      const sdk = new SwapSDK();
      expect(await sdk.getTokens(ChainId.Polkadot)).toStrictEqual([dot$]);
    });
    it('should return the available tokens for bitcoin', async () => {
      const sdk = new SwapSDK();
      expect(await sdk.getTokens(ChainId.Bitcoin)).toStrictEqual([btc$]);
    });
  });

  describe('routes', () => {
    // implement
  });
});

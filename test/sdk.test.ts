import ChainFlipSDK from '../src/index';
import {
  bitcoin,
  bitcoin$,
  ethereum,
  ether$,
  flip$,
  polkadot,
  polkadot$,
  usdc$,
} from '../src/mocks';
import { Chains } from '../src/types';

describe('Chainflip SDK', () => {
  describe('chains', () => {
    it('should return the available chains', async () => {
      const sdk = new ChainFlipSDK();
      expect(await sdk.getChains()).toStrictEqual([
        ethereum,
        polkadot,
        bitcoin,
      ]);
    });
  });

  describe('tokens', () => {
    it('should return the available tokens for ethereum', async () => {
      const sdk = new ChainFlipSDK();
      expect(await sdk.getTokens(Chains.ETHEREUM)).toStrictEqual([
        ether$,
        usdc$,
        flip$,
      ]);
    });
    it('should return the available tokens for polkadot', async () => {
      const sdk = new ChainFlipSDK();
      expect(await sdk.getTokens(Chains.POLKADOT)).toStrictEqual([polkadot$]);
    });
    it('should return the available tokens for bitcoin', async () => {
      const sdk = new ChainFlipSDK();
      expect(await sdk.getTokens(Chains.BITCOIN)).toStrictEqual([bitcoin$]);
    });
  });

  describe('routes', () => {
    // implement
  });
});

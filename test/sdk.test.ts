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
      expect(await sdk.getTokens(1)).toStrictEqual([ether$, usdc$, flip$]);
    });
    it('should return the available tokens for polkadot', async () => {
      const sdk = new ChainFlipSDK();
      expect(await sdk.getTokens(2)).toStrictEqual([polkadot$]);
    });
    it('should return the available tokens for bitcoin', async () => {
      const sdk = new ChainFlipSDK();
      expect(await sdk.getTokens(3)).toStrictEqual([bitcoin$]);
    });
  });

  describe('routes', () => {
    // implement
  });
});

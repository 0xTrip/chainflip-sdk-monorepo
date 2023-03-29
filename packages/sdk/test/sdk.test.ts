import { ChainId } from '../src/swap/consts';
import {
  bitcoin,
  btc$,
  polkadot,
  dot$,
  goerliTokens,
  goerli,
} from '../src/swap/mocks';
import { SwapSDK } from '../src/swap/sdk';

describe(SwapSDK, () => {
  const sdk = new SwapSDK();

  describe(SwapSDK.prototype.getChains, () => {
    it('returns the available chains', async () => {
      expect(await sdk.getChains()).toStrictEqual([goerli, polkadot, bitcoin]);
    });

    it.each([
      [ChainId.Goerli, [polkadot, bitcoin]],
      [ChainId.Polkadot, [goerli, bitcoin]],
      [ChainId.Bitcoin, [goerli, polkadot]],
    ])(
      `returns the possible destination chains for %s`,
      async (chainId, chains) => {
        expect(await sdk.getChains(chainId)).toStrictEqual(chains);
      },
    );

    it('throws when mainnet is requested', async () => {
      await expect(sdk.getChains(ChainId.Ethereum)).rejects.toThrow();
    });

    it('throws when an unknown chain is requested', async () => {
      await expect(sdk.getChains(NaN)).rejects.toThrow();
    });
  });

  describe(SwapSDK.prototype.getTokens, () => {
    it.each([
      [ChainId.Goerli, goerliTokens],
      [ChainId.Polkadot, [dot$]],
      [ChainId.Bitcoin, [btc$]],
    ])('returns the available tokens for %s', async (chainId, tokens) => {
      expect(await sdk.getTokens(chainId)).toStrictEqual(tokens);
    });

    it('disallows mainnet', async () => {
      await expect(sdk.getTokens(ChainId.Ethereum)).rejects.toThrow();
    });

    it('throws when an unknown chain is requested', async () => {
      await expect(sdk.getChains(NaN)).rejects.toThrow();
    });
  });

  describe('routes', () => {
    // implement
  });
});

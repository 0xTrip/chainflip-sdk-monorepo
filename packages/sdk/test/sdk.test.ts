import { ChainId } from '../src/swap/consts';
import {
  bitcoin,
  polkadot,
  dot$,
  goerli,
  btc$,
  ethereum,
  ethereumTokens,
  westend,
  bitcoinTest,
  goerliTokens,
  wnd$,
  tbtc$,
} from '../src/swap/mocks';
import { SwapSDK } from '../src/swap/sdk';

describe(SwapSDK, () => {
  const sdk = new SwapSDK({ useTestnets: false });

  describe(SwapSDK.prototype.getChains, () => {
    it('returns the available chains', async () => {
      expect(await sdk.getChains()).toStrictEqual([
        ethereum,
        polkadot,
        bitcoin,
      ]);
    });

    it.each([
      [ChainId.Ethereum, [bitcoin, polkadot]],
      [ChainId.Polkadot, [ethereum, bitcoin]],
      [ChainId.Bitcoin, [ethereum, polkadot]],
    ])(
      `returns the possible destination chains for %s`,
      async (chainId, chains) => {
        expect(await sdk.getChains(chainId)).toStrictEqual(chains);
      },
    );

    it('throws when requesting a testnet chain on mainent', async () => {
      await expect(sdk.getChains(ChainId.Goerli)).rejects.toThrow();
    });

    it('throws when an unknown chain is requested', async () => {
      await expect(sdk.getChains(NaN)).rejects.toThrow();
    });
  });

  describe(SwapSDK.prototype.getTokens, () => {
    it.each([
      [ChainId.Ethereum, ethereumTokens],
      [ChainId.Polkadot, [dot$]],
      [ChainId.Bitcoin, [btc$]],
    ])('returns the available tokens for %s', async (chainId, tokens) => {
      expect(await sdk.getTokens(chainId)).toStrictEqual(tokens);
    });

    it('disallows testnet tokens', async () => {
      await expect(sdk.getTokens(ChainId.Goerli)).rejects.toThrow();
    });

    it('throws when an unknown chain is requested', async () => {
      await expect(sdk.getChains(NaN)).rejects.toThrow();
    });
  });

  describe('routes', () => {
    // implement
  });
});

describe(SwapSDK, () => {
  const sdk = new SwapSDK({ useTestnets: true });

  describe(SwapSDK.prototype.getChains, () => {
    it('returns the available chains', async () => {
      expect(await sdk.getChains()).toEqual([goerli, westend, bitcoinTest]);
    });

    it.each([
      [ChainId.Goerli, [westend, bitcoinTest]],
      [ChainId.Westend, [goerli, bitcoinTest]],
      [ChainId.BitcoinTest, [goerli, westend]],
    ])(
      `returns the possible destination chains for %s`,
      async (chainId, chains) => {
        expect(await sdk.getChains(chainId)).toEqual(chains);
      },
    );

    it('throws when requesting a mainent chain on testnet', async () => {
      await expect(sdk.getChains(ChainId.Ethereum)).rejects.toThrow();
    });

    it('throws when an unknown chain is requested', async () => {
      await expect(sdk.getChains(NaN)).rejects.toThrow();
    });
  });

  describe(SwapSDK.prototype.getTokens, () => {
    it.each([
      [ChainId.Goerli, goerliTokens],
      [ChainId.Westend, [wnd$]],
      [ChainId.BitcoinTest, [tbtc$]],
    ])('returns the available tokens for %s', async (chainId, tokens) => {
      expect(await sdk.getTokens(chainId)).toStrictEqual(tokens);
    });

    it('disallows mainnet tokens', async () => {
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

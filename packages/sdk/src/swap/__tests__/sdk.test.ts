import axios from 'axios';
import { VoidSigner } from 'ethers';
import { Chain, ChainflipNetworks, Chains } from '@/shared/enums';
import { executeSwap } from '@/shared/vault';
import { dot$, btc$, eth$, usdc$, flip$ } from '../assets';
import { bitcoin, ethereum, polkadot } from '../chains';
import { SwapSDK } from '../sdk';

jest.mock('@/shared/vault', () => ({
  executeSwap: jest.fn(),
}));

jest.mock('@trpc/client', () => ({
  ...jest.requireActual('@trpc/client'),
  createTRPCProxyClient: () => ({
    openSwapDepositChannel: {
      mutate: jest.fn(),
    },
  }),
}));

describe(SwapSDK, () => {
  const sdk = new SwapSDK({ network: ChainflipNetworks.perseverance });

  describe(SwapSDK.prototype.getChains, () => {
    it('returns the available chains', async () => {
      expect(await sdk.getChains()).toStrictEqual([
        ethereum(ChainflipNetworks.perseverance),
        polkadot(ChainflipNetworks.perseverance),
        bitcoin(ChainflipNetworks.perseverance),
      ]);
    });

    it.each([
      [
        Chains.Ethereum,
        [
          ethereum(ChainflipNetworks.perseverance),
          bitcoin(ChainflipNetworks.perseverance),
          polkadot(ChainflipNetworks.perseverance),
        ],
      ],
      [
        'Ethereum' as const,
        [
          ethereum(ChainflipNetworks.perseverance),
          bitcoin(ChainflipNetworks.perseverance),
          polkadot(ChainflipNetworks.perseverance),
        ],
      ],
      [
        Chains.Polkadot,
        [
          ethereum(ChainflipNetworks.perseverance),
          bitcoin(ChainflipNetworks.perseverance),
        ],
      ],
      [
        Chains.Bitcoin,
        [
          ethereum(ChainflipNetworks.perseverance),
          polkadot(ChainflipNetworks.perseverance),
        ],
      ],
    ])(
      `returns the possible destination chains for %s`,
      async (chain, chains) => {
        expect(await sdk.getChains(chain)).toStrictEqual(chains);
      },
    );

    it('throws when requesting an unsupported chain', async () => {
      await expect(sdk.getChains('Dogecoin' as Chain)).rejects.toThrow();
    });
  });

  describe(SwapSDK.prototype.getAssets, () => {
    it.each([
      [
        Chains.Ethereum,
        [
          eth$(ChainflipNetworks.perseverance),
          usdc$(ChainflipNetworks.perseverance),
          flip$(ChainflipNetworks.perseverance),
        ],
      ],
      [
        'Ethereum' as const,
        [
          eth$(ChainflipNetworks.perseverance),
          usdc$(ChainflipNetworks.perseverance),
          flip$(ChainflipNetworks.perseverance),
        ],
      ],
      [Chains.Polkadot, [dot$(ChainflipNetworks.perseverance)]],
      [Chains.Bitcoin, [btc$(ChainflipNetworks.perseverance)]],
    ])('returns the available assets for %s', async (chain, assets) => {
      expect(await sdk.getAssets(chain)).toStrictEqual(assets);
    });

    it('throws when requesting an unsupported chain', async () => {
      await expect(sdk.getChains('Dogecoin' as Chain)).rejects.toThrow();
    });
  });
});

describe(SwapSDK, () => {
  const signer = new VoidSigner('0x0');
  const sdk = new SwapSDK({ network: ChainflipNetworks.sisyphos, signer });

  describe(SwapSDK.prototype.getChains, () => {
    it('returns the available chains', async () => {
      expect(await sdk.getChains()).toStrictEqual([
        ethereum(ChainflipNetworks.sisyphos),
        polkadot(ChainflipNetworks.sisyphos),
        bitcoin(ChainflipNetworks.sisyphos),
      ]);
    });

    it.each([
      [
        Chains.Ethereum,
        [
          ethereum(ChainflipNetworks.sisyphos),
          bitcoin(ChainflipNetworks.sisyphos),
          polkadot(ChainflipNetworks.sisyphos),
        ],
      ],
      [
        'Ethereum' as const,
        [
          ethereum(ChainflipNetworks.sisyphos),
          bitcoin(ChainflipNetworks.sisyphos),
          polkadot(ChainflipNetworks.sisyphos),
        ],
      ],
      [
        Chains.Polkadot,
        [
          ethereum(ChainflipNetworks.sisyphos),
          bitcoin(ChainflipNetworks.sisyphos),
        ],
      ],
      [
        Chains.Bitcoin,
        [
          ethereum(ChainflipNetworks.sisyphos),
          polkadot(ChainflipNetworks.sisyphos),
        ],
      ],
    ])(
      `returns the possible destination chains for %s`,
      async (chain, chains) => {
        expect(await sdk.getChains(chain)).toEqual(chains);
      },
    );

    it('throws when requesting an unsupported chain', async () => {
      await expect(sdk.getChains('Dogecoin' as Chain)).rejects.toThrow();
    });
  });

  describe(SwapSDK.prototype.getAssets, () => {
    it.each([
      [
        Chains.Ethereum,
        [
          eth$(ChainflipNetworks.sisyphos),
          usdc$(ChainflipNetworks.sisyphos),
          flip$(ChainflipNetworks.sisyphos),
        ],
      ],
      [
        'Ethereum' as const,
        [
          eth$(ChainflipNetworks.sisyphos),
          usdc$(ChainflipNetworks.sisyphos),
          flip$(ChainflipNetworks.sisyphos),
        ],
      ],
      [Chains.Polkadot, [dot$(ChainflipNetworks.sisyphos)]],
      [Chains.Bitcoin, [btc$(ChainflipNetworks.sisyphos)]],
    ])('returns the available assets for %s', async (chain, assets) => {
      expect(await sdk.getAssets(chain)).toStrictEqual(assets);
    });

    it('throws when requesting an unsupported chain', async () => {
      await expect(sdk.getAssets('Dogecoin' as Chain)).rejects.toThrow();
    });
  });

  describe(SwapSDK.prototype.executeSwap, () => {
    it('calls executeSwap', async () => {
      const params = {};
      jest
        .mocked(executeSwap)
        .mockResolvedValueOnce({ hash: 'hello world' } as any);
      const result = await sdk.executeSwap(params as any);
      expect(executeSwap).toHaveBeenCalledWith(
        params,
        {
          network: 'sisyphos',
          signer,
        },
        {},
      );
      expect(result).toEqual('hello world');
    });
  });

  describe(SwapSDK.prototype.requestDepositAddress, () => {
    it('calls openSwapDepositChannel', async () => {
      const rpcSpy = jest
        // @ts-expect-error - testing private method
        .spyOn(sdk.trpc.openSwapDepositChannel, 'mutate')
        .mockResolvedValueOnce({
          id: 'channel id',
          depositAddress: 'deposit address',
          sourceChainExpiryBlock: 123n,
          depositChannelExpiryTime: 1698334470000,
        } as any);

      const response = await sdk.requestDepositAddress({
        property: true,
      } as any);
      expect(rpcSpy).toHaveBeenLastCalledWith({ property: true });
      expect(response).toStrictEqual({
        property: true,
        depositChannelId: 'channel id',
        depositAddress: 'deposit address',
        sourceChainExpiryBlock: 123n,
        depositChannelExpiryTime: 1698334470000,
      });
    });

    it('goes right to the broker', async () => {
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValue(Error('unhandled mock'))
        .mockResolvedValueOnce({
          data: {
            result: {
              address: '0x717e15853fd5f2ac6123e844c3a7c75976eaec9a',
              issued_block: 123,
              channel_id: 15,
              source_chain_expiry_block: '1234',
            },
          },
        });

      const result = await new SwapSDK({
        broker: { url: 'https://chainflap.org/broker', commissionBps: 5000 },
      }).requestDepositAddress({
        srcChain: 'Bitcoin',
        srcAsset: 'BTC',
        destChain: 'Ethereum',
        destAsset: 'FLIP',
        destAddress: '0x717e15853fd5f2ac6123e844c3a7c75976eaec9b',
        amount: BigInt(1e18).toString(),
      });

      expect(postSpy).toHaveBeenCalledWith('https://chainflap.org/broker', {
        id: 1,
        jsonrpc: '2.0',
        method: 'broker_requestSwapDepositAddress',
        params: [
          'Btc',
          'Flip',
          '0x717e15853fd5f2ac6123e844c3a7c75976eaec9b',
          5000,
        ],
      });
      expect(result).toStrictEqual({
        srcChain: 'Bitcoin',
        srcAsset: 'BTC',
        destChain: 'Ethereum',
        destAsset: 'FLIP',
        destAddress: '0x717e15853fd5f2ac6123e844c3a7c75976eaec9b',
        amount: '1000000000000000000',
        depositChannelId: '123-Bitcoin-15',
        depositAddress: '0x717e15853fd5f2ac6123e844c3a7c75976eaec9a',
        sourceChainExpiryBlock: 1234n,
        depositChannelExpiryTime: undefined,
      });
    });
  });
});

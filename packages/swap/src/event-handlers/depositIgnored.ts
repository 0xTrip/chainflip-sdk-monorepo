import { type Chain } from '.prisma/client';
import { encodeAddress } from '@polkadot/util-crypto';
import { z } from 'zod';
import { encodeAddress as encodeBitcoinAddress } from '@/shared/bitcoin';
import { Asset, assetChains } from '@/shared/enums';
import {
  DOT_PREFIX,
  chainflipAssetEnum,
  hexString,
  u128,
} from '@/shared/parsers';
import env from '../config/env';
import type { EventHandlerArgs } from './index';

const depositIgnoredArgs = z
  .object({
    asset: chainflipAssetEnum,
    amount: u128,
    depositAddress: z.union([
      z
        .object({ __kind: z.literal('Taproot'), value: hexString })
        .transform((o) => {
          try {
            return encodeBitcoinAddress(o.value, env.CHAINFLIP_NETWORK);
          } catch {
            return null;
          }
        }),
      hexString,
    ]),
  })
  .refine(
    (args): args is { amount: bigint; asset: Asset; depositAddress: string } =>
      args.depositAddress !== null,
    { message: 'failed to parse bitcoin deposit address' },
  )
  .transform((args) => {
    if (args.asset === 'DOT') {
      return {
        ...args,
        depositAddress: encodeAddress(args.depositAddress, DOT_PREFIX),
      };
    }
    return args;
  });

export type DepositIgnoredArgs = z.input<typeof depositIgnoredArgs>;

export const depositIgnored =
  (chain: Chain) =>
  async ({ prisma, event, block }: EventHandlerArgs) => {
    const { amount, depositAddress } = depositIgnoredArgs.parse(event.args);

    const channel = await prisma.swapDepositChannel.findFirstOrThrow({
      where: {
        srcChain: chain,
        depositAddress,
      },
      orderBy: { issuedBlock: 'desc' },
    });

    await prisma.failedSwap.create({
      data: {
        reason: 'BelowMinimumDeposit',
        swapDepositChannelId: channel.id,
        srcAsset: channel.srcAsset,
        srcChain: chain,
        destAddress: channel.destAddress,
        destChain: assetChains[channel.destAsset],
        depositAmount: amount.toString(),
        failedAt: new Date(block.timestamp),
        failedBlockIndex: `${block.height}-${event.indexInBlock}`,
      },
    });
  };

export default depositIgnored;

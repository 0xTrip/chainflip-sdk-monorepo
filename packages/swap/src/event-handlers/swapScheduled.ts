// Set the column in the DB to the block timestamp and the deposit amount.
import assert from 'assert';
import { z } from 'zod';
import { stateChainAssetEnum, unsignedInteger } from '@/shared/parsers';
import logger from '../utils/logger';
import { encodedAddress } from './common';
import type { EventHandlerArgs } from '.';

const baseArgs = z.object({
  swapId: unsignedInteger,
  depositAsset: stateChainAssetEnum,
  depositAmount: unsignedInteger,
  destinationAsset: stateChainAssetEnum,
  destinationAddress: encodedAddress,
});

const depositChannelOrigin = z.object({
  __kind: z.literal('DepositChannel'),
  depositAddress: encodedAddress,
});

const vaultOrigin = z.object({
  __kind: z.literal('Vault'),
  value: z.object({
    txHash: z.string(),
  }),
});

const eventArgs = z.intersection(
  baseArgs,
  z.object({ origin: z.union([depositChannelOrigin, vaultOrigin]) }),
);

export type SwapScheduledEvent = z.input<typeof eventArgs>;

export default async function swapScheduled({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    const { swapId, depositAmount, ...args } = eventArgs.parse(event.args);

    const newSwapData = {
      depositReceivedBlockIndex: `${block.height}-${event.indexInBlock}`,
      depositAmount: depositAmount.toString(),
      nativeId: swapId,
      depositReceivedAt: new Date(block.timestamp),
    };

    if (args.origin.__kind === 'DepositChannel') {
      const depositAddress = args.origin.depositAddress.address;

      const channels = await prisma.swapDepositChannel.findMany({
        where: { depositAddress, expiryBlock: { gte: block.height } },
      });

      if (channels.length === 0) {
        logger.info(
          `SwapScheduled: SwapDepositChannel not found for depositAddress ${depositAddress}`,
        );
        return;
      }

      assert(
        channels.length === 1,
        `SwapScheduled: too many active swap intents found for depositAddress ${depositAddress}`,
      );

      const [{ depositAsset, destinationAddress, destinationAsset, id }] =
        channels;

      await prisma.swap.create({
        data: {
          swapDepositChannelId: id,
          depositAsset,
          destinationAsset,
          destinationAddress,
          ...newSwapData,
        },
      });
    } else if (args.origin.__kind === 'Vault') {
      await prisma.swap.create({
        data: {
          depositAsset: args.depositAsset,
          destinationAsset: args.destinationAsset,
          destinationAddress: args.destinationAddress.address,
          ...newSwapData,
        },
      });
    }
  } catch (error) {
    logger.customError(
      'error in "SwapScheduled" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'SwapScheduled' },
    );
    throw error;
  }
}

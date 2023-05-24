// Set the column in the DB to the block timestamp and the deposit amount.
import assert from 'assert';
import { z } from 'zod';
import { unsignedInteger } from '@/shared/parsers';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  depositAddress: chainAddress,
  swapId: unsignedInteger,
  depositAmount: unsignedInteger,
});

export type SwapScheduledByDepositEvent = z.input<typeof eventArgs>;

export default async function swapScheduledByDeposit({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  logger.warn('SwapScheduledByDeposit handler is here');
  try {
    // get necessary params
    const {
      depositAddress: { address: depositAddress },
      swapId,
      depositAmount,
    } = eventArgs.parse(event.args);

    // retrieve SwapDepositChannel for later processing
    const swapRequests = await prisma.swapDepositChannel.findMany({
      where: { depositAddress, active: true },
    });

    if (swapRequests.length === 0) {
      logger.info(
        `SwapScheduledByDeposit: SwapDepositChannel not found for depositAddress ${depositAddress}`,
      );
      return;
    }

    assert(
      swapRequests.length === 1,
      `SwapScheduledByDeposit: too many active swap intents found for depositAddress ${depositAddress}`,
    );

    // Create a new swap object
    await prisma.swap.create({
      data: {
        depositAmount: depositAmount.toString(),
        nativeId: swapId,
        depositReceivedAt: new Date(block.timestamp),
        swapDepositChannelId: swapRequests[0].id,
      },
    });
  } catch (error) {
    logger.customError(
      'error in "SwapScheduledByDeposit" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'SwapScheduledByDeposit' },
    );
    throw error;
  }
}

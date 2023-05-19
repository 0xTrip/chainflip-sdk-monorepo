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

export type SwapDepositReceivedEvent = z.input<typeof eventArgs>;

export default async function swapDepositReceived({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
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
        `swapDepositReceived: SwapDepositChannel not found for depositAddress ${depositAddress}`,
      );
      return;
    }

    assert(
      swapRequests.length === 1,
      `swapDepositReceived: too many active swap intents found for depositAddress ${depositAddress}`,
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
      'error in "swapDepositReceived" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'swapDepositReceived' },
    );
    throw error;
  }
}

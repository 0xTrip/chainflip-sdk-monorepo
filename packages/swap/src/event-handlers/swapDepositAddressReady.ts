// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  depositAddress: chainAddress,
});

export default async function swapDepositAddressReady({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    // get necessary params
    const {
      depositAddress: { address: depositAddress },
    } = eventArgs.parse(event.args);

    // retrieve SwapDepositChannel for later processing
    const swapIntents = await prisma.swapDepositChannel.findMany({
      where: { depositAddress, active: true },
    });

    assert(
      swapIntents.length === 0,
      `swapDepositAddressReady: too many active swap intents found for depositAddress ${depositAddress}`,
    );

    // Create a new swap object
    await prisma.swapIntentBlock.create({
      data: { depositAddress, blockHeight: block.height },
    });
  } catch (error) {
    logger.customError(
      'error in "swapDepositAddressReady" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'swapDepositAddressReady' },
    );
    throw error;
  }
}

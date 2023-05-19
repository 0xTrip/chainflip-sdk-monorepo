// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  depositAddress: chainAddress,
});

export default async function SwapDepositAddressExpired({
  prisma,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    const {
      depositAddress: { address: depositAddress },
    } = eventArgs.parse(event.args);

    const swapRequests = await prisma.swapDepositChannel.findMany({
      where: { depositAddress, active: true },
    });

    if (swapRequests.length === 0) {
      logger.info(
        `SwapDepositAddressExpired: no swap requests found for depositAddress ${depositAddress}`,
      );
      return;
    }

    assert(
      swapRequests.length === 1,
      `SwapDepositAddressExpired: too many active swapRequests found for ${depositAddress}`,
    );

    await prisma.swapDepositChannel.update({
      where: { id: swapRequests[0].id },
      data: { active: false },
    });
  } catch (error) {
    logger.customError(
      'error in "SwapDepositAddressExpired" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'SwapDepositAddressExpired' },
    );
    throw error;
  }
}

// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  ingressAddress: chainAddress,
});

export default async function swapIntentExpired({
  prisma,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    const {
      ingressAddress: { address: ingressAddress },
    } = eventArgs.parse(event.args);

    const swapIntents = await prisma.swapIntent.findMany({
      where: { ingressAddress, active: true },
    });

    if (swapIntents.length === 0) {
      logger.info(
        `swapIntentExpired: no swap intents found for ingressAddress ${ingressAddress}`,
      );
      return;
    }

    assert(
      swapIntents.length === 1,
      `swapIntentExpired: too many active swapIntents found for ${ingressAddress}`,
    );

    await prisma.swapIntent.update({
      where: { id: swapIntents[0].id },
      data: { active: false },
    });
  } catch (error) {
    logger.customError(
      'error in "swapIntentExpired" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'swapIntentExpired' },
    );
    throw error;
  }
}

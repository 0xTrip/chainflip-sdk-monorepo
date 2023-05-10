// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  ingressAddress: chainAddress,
});

export default async function newSwapIntent({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    // get necessary params
    const {
      ingressAddress: { address: ingressAddress },
    } = eventArgs.parse(event.args);

    // retrieve SwapIntent for later processing
    const swapIntents = await prisma.swapIntent.findMany({
      where: { ingressAddress, active: true },
    });

    assert(
      swapIntents.length === 0,
      `swapIngressReceived: too many active swap intents found for ingressAddress ${ingressAddress}`,
    );

    // Create a new swap object
    await prisma.swapIntentBlock.create({
      data: { ingressAddress, blockHeight: block.height },
    });
  } catch (error) {
    logger.customError(
      'error in "swapIngressReceived" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'swapIngressReceived' },
    );
    throw error;
  }
}

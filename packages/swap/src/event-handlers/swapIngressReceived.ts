// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { unsignedInteger } from '@/shared/parsers';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  ingressAddress: chainAddress,
  swapId: unsignedInteger,
  ingressAmount: unsignedInteger,
});

export type SwapIngressReceivedEvent = z.input<typeof eventArgs>;

export default async function swapIngressReceived({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    // get necessary params
    const {
      ingressAddress: { address: ingressAddress },
      swapId,
      ingressAmount,
    } = eventArgs.parse(event.args);

    // retrieve SwapIntent for later processing
    const swapIntents = await prisma.swapIntent.findMany({
      where: { ingressAddress, active: true },
    });

    if (swapIntents.length === 0) {
      logger.info(
        `swapIngressReceived: SwapIntent not found for ingressAddress ${ingressAddress}`,
      );
      return;
    }

    assert(
      swapIntents.length === 1,
      `swapIngressReceived: too many active swap intents found for ingressAddress ${ingressAddress}`,
    );

    // Create a new swap object
    await prisma.swap.create({
      data: {
        ingressAmount: ingressAmount.toString(),
        nativeId: swapId,
        ingressReceivedAt: new Date(block.timestamp),
        swapIntentId: swapIntents[0].id,
      },
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

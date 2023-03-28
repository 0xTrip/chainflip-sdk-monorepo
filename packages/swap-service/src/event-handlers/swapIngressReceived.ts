// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { stateChainAsset } from '../utils/assets';
import logger from '../utils/logger';
import { unsignedInteger, hexString } from '../utils/parsers';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  ingressAddress: z
    .object({ __kind: stateChainAsset, value: hexString })
    .transform(
      ({ __kind, value }) =>
        ({
          chain: __kind,
          address: value,
        } as const),
    ),
  swapId: unsignedInteger,
  ingressAmount: unsignedInteger,
});

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
        ingressReceivedAt: new Date(block.header.timestamp),
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

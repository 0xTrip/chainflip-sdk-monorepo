import { Network } from '@chainflip-io/sdk-shared/assets';
import { unsignedInteger } from '@chainflip-io/sdk-shared/parsers';
import { z } from 'zod';
import logger from '../utils/logger';
import type { EventHandlerArgs } from './index';

const eventArgs = z.object({
  broadcastId: unsignedInteger,
});

export async function handleEvent(
  network: Network,
  { prisma, block, event }: EventHandlerArgs,
): Promise<void> {
  try {
    const { broadcastId } = eventArgs.parse(event.args);

    const broadcast = await prisma.broadcast.findUnique({
      where: { nativeId_network: { network, nativeId: broadcastId } },
      include: { egresses: { include: { swap: true } } },
    });

    if (!broadcast) {
      logger.customInfo(
        'no broadcast found, skipping',
        {},
        { broadcastId, network },
      );
      return;
    }

    await prisma.swap.updateMany({
      where: {
        id: {
          in: broadcast.egresses.reduce((acc, egress) => {
            if (egress.swapId !== null) acc.push(egress.swapId);
            return acc;
          }, [] as bigint[]),
        },
      },
      data: { egressCompleteAt: new Date(block.header.timestamp) },
    });
  } catch (error) {
    logger.customError(
      'error in "chainBroadcastSuccess" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'chainBroadcastSuccess', network },
    );
    throw error;
  }
}

/**
 * this event is emitted when a broadcast is successful. all of the egresses
 * contained by the broadcast id can be marked as successful
 */
export default function networkBroadcastSuccess(
  network: Network,
): (args: EventHandlerArgs) => Promise<void> {
  return (args: EventHandlerArgs) => handleEvent(network, args);
}

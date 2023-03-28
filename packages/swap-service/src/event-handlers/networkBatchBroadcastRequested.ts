import { z } from 'zod';
import { unsignedInteger } from '@/shared/parsers';
import { egressId } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  broadcastId: unsignedInteger,
  egressIds: z.array(egressId),
});

/**
 * this event emits a list of egress ids and a new broadcast id to track the
 * egresses. the broadcast success event will be emitted with this id when all
 * of the egresses are successful
 */
export default async function networkBatchBroadcastRequested({
  prisma,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    const { broadcastId, egressIds } = eventArgs.parse(event.args);

    if (egressIds.length === 0) {
      logger.customInfo('no egress ids, skipping', {}, { broadcastId });
      return;
    }

    const [[network]] = egressIds;

    const egresses = await prisma.egress.findMany({
      where: {
        network,
        nativeId: { in: egressIds.map(([, id]) => id) },
      },
    });

    if (egresses.length === 0) {
      logger.customInfo('no egresses found, skipping', {}, { broadcastId });
      return;
    }

    const broadcast = await prisma.broadcast.create({
      data: { network, nativeId: broadcastId },
    });

    await prisma.egress.updateMany({
      where: { id: { in: egresses.map((egress) => egress.id) } },
      data: { broadcastId: broadcast.id },
    });
  } catch (error) {
    logger.customError(
      'error in "chainBatchBroadcastRequested" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'chainBatchBroadcastRequested' },
    );
    throw error;
  }
}

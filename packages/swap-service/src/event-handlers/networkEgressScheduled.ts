import { unsignedInteger } from '@chainflip-io/sdk-shared/parsers';
import { z } from 'zod';
import { assetToNetwork, egressId } from './common';
import { stateChainAsset } from '../utils/assets';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  id: egressId,
  asset: z
    .object({ __kind: stateChainAsset })
    .transform(({ __kind }) => __kind),
  amount: unsignedInteger,
});

/**
 * the event emits the egress id (Network, number) and the egress amount. the
 * egress id is used to uniquely identify an egress and correlate it to a swap
 * and determining if funds were successfully sent by the broadcast pallets
 */
export default async function networkEgressScheduled({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    const { id, asset, amount } = eventArgs.parse(event.args);

    await prisma.egress.create({
      data: {
        nativeId: id[1],
        network: assetToNetwork[asset],
        amount: amount.toString(),
        timestamp: new Date(block.header.timestamp),
      },
    });
  } catch (error) {
    logger.customError(
      'error in "chainEgressScheduled" handler',
      { alertCode: 'EventHandlerError' },
      { error, handler: 'chainEgressScheduled' },
    );
    throw error;
  }
}

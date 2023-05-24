// Set the column in the DB to the block timestamp and the ingress amount.
import assert from 'assert';
import { z } from 'zod';
import { chainAddress } from './common';
import logger from '../utils/logger';
import type { EventHandlerArgs } from '.';

const eventArgs = z.object({
  depositAddress: chainAddress,
  expiryBlock: z.number(),
});

export default async function swapDepositAddressReady({
  prisma,
  block,
  event,
}: EventHandlerArgs): Promise<void> {
  try {
    const {
      depositAddress: { address: depositAddress },
      expiryBlock,
    } = eventArgs.parse(event.args);

    const depositChannels = await prisma.swapDepositChannel.findMany({
      where: { depositAddress, expiryBlock: { gte: block.height } },
    });

    assert(
      depositChannels.length === 0,
      `swapDepositAddressReady: too many open deposit channels found for depositAddress ${depositAddress}`,
    );

    await prisma.swapDepositChannelBlock.create({
      data: { depositAddress, issuedBlock: block.height, expiryBlock },
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

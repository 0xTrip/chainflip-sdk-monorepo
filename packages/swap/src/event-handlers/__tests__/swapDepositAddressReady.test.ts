import { swapDepositAddressReadyMock } from './utils';
import prisma from '../../client';
import swapDepositAddressReady from '../swapDepositAddressReady';

describe(swapDepositAddressReady, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "Swap" CASCADE`;
  });

  it('creates a swap intent block when it receives a swap deposit address', async () => {
    await prisma.$transaction(async (client) => {
      await swapDepositAddressReady({
        prisma: client,
        block: swapDepositAddressReadyMock.block as any,
        event: swapDepositAddressReadyMock.eventContext.event as any,
      });
    });

    const swapDepositChannelBlock =
      await prisma.swapDepositChannelBlock.findFirstOrThrow({
        where: {
          depositAddress:
            swapDepositAddressReadyMock.eventContext.event.args.depositAddress
              .value,
        },
      });
    expect(swapDepositChannelBlock.depositAddress).toBe(
      swapDepositAddressReadyMock.eventContext.event.args.depositAddress.value,
    );
  });
});

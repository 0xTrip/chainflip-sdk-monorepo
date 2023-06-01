import { DOT_ADDRESS, createDepositChannel, swapExecutedMock } from './utils';
import prisma from '../../client';
import swapExecuted from '../swapExecuted';

const {
  eventContext: { event },
  block,
} = swapExecutedMock;

describe(swapExecuted, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "Swap" CASCADE`;
  });

  it('updates an existing swap with the execution timestamp', async () => {
    const { swapId } = event.args;

    // store a new swap intent to initiate a new swap
    const swapDepositChannel = await createDepositChannel({
      swaps: {
        create: {
          nativeId: BigInt(swapId),
          depositAmount: '10000000000',
          depositReceivedAt: new Date(block.timestamp - 6000),
          depositReceivedBlockIndex: `${block.height}-${event.indexInBlock}`,
          depositAsset: 'ETH',
          destinationAsset: 'DOT',
          destinationAddress: DOT_ADDRESS,
        },
      },
    });

    await prisma.$transaction((tx) =>
      swapExecuted({
        block: block as any,
        event: event as any,
        prisma: tx,
      }),
    );

    const swap = await prisma.swap.findFirstOrThrow({
      where: { swapDepositChannelId: swapDepositChannel.id },
    });

    expect(swap).toMatchSnapshot({
      id: expect.any(BigInt),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      swapDepositChannelId: expect.any(BigInt),
    });
  });
});

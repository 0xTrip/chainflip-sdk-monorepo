import { swapEgressScheduledMock } from './utils';
import prisma, { SwapDepositChannel } from '../../client';
import swapEgressScheduled from '../swapEgressScheduled';

const ETH_ADDRESS = '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2';
const DOT_ADDRESS = '5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX';

type SwapData = Parameters<
  (typeof prisma)['swapDepositChannel']['create']
>[0]['data'];
const createSwapRequest = (
  data: Partial<SwapData> = {},
): Promise<SwapDepositChannel> =>
  prisma.swapDepositChannel.create({
    data: {
      depositAsset: 'ETH',
      destinationAsset: 'DOT',
      depositAddress: ETH_ADDRESS,
      destinationAddress: DOT_ADDRESS,
      expectedDepositAmount: '10000000000',
      ...data,
    },
  });

const {
  eventContext: { event },
  block,
} = swapEgressScheduledMock;

describe(swapEgressScheduled, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "Swap" CASCADE`;
  });

  it('updates an existing swap with the scheduled timestamp', async () => {
    const { swapId } = event.args;

    await prisma.egress.create({
      data: {
        network: event.args.egressId[0].__kind,
        nativeId: BigInt(event.args.egressId[1]),
        amount: '1234567890',
        timestamp: new Date(block.timestamp),
      },
    });

    // store a new swap intent to initiate a new swap
    const swapDepositChannel = await createSwapRequest({
      swaps: {
        create: {
          nativeId: BigInt(swapId),
          depositAmount: '10000000000',
          depositReceivedAt: new Date(block.timestamp - 12000),
          swapExecutedAt: new Date(block.timestamp - 6000),
        },
      },
    });

    await prisma.$transaction((tx) =>
      swapEgressScheduled({
        block: block as any,
        event: event as any,
        prisma: tx,
      }),
    );

    const swap = await prisma.swap.findFirstOrThrow({
      where: { swapDepositChannelId: swapDepositChannel.id },
      include: {
        egress: {
          select: {
            amount: true,
            timestamp: true,
            network: true,
          },
        },
      },
    });

    expect(swap).toMatchSnapshot({
      id: expect.any(BigInt),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      swapDepositChannelId: expect.any(BigInt),
    });
  });
});

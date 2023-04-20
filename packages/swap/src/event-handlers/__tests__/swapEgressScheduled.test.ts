import { SwapIntent } from '.prisma/client';
import { swapEgressScheduledMock } from './utils';
import prisma from '../../client';
import swapEgressScheduled from '../swapEgressScheduled';

const ETH_ADDRESS = '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2';
const DOT_ADDRESS = '5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX';

type SwapData = Parameters<(typeof prisma)['swapIntent']['create']>[0]['data'];
const createSwapIntent = (data: Partial<SwapData> = {}): Promise<SwapIntent> =>
  prisma.swapIntent.create({
    data: {
      ingressAsset: 'ETH',
      egressAsset: 'DOT',
      ingressAddress: ETH_ADDRESS,
      egressAddress: DOT_ADDRESS,
      ...data,
    },
  });

const {
  eventContext: { event },
  block,
} = swapEgressScheduledMock;

describe(swapEgressScheduled, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapIntent", "Swap" CASCADE`;
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
    const swapIntent = await createSwapIntent({
      swaps: {
        create: {
          nativeId: BigInt(swapId),
          ingressAmount: '10000000000',
          ingressReceivedAt: new Date(block.timestamp - 12000),
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
      where: { swapIntentId: swapIntent.id },
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
      swapIntentId: expect.any(BigInt),
    });
  });
});

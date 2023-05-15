import { swapIngressMock } from './utils';
import prisma, { SwapIntent } from '../../client';
import swapIngressReceived from '../swapIngressReceived';

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
      expectedIngressAmount: '10000000000',
      ...data,
    },
  });

describe(swapIngressReceived, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapIntent", "Swap" CASCADE`;
  });

  it('stores a new swap', async () => {
    // store a new swap intent to initiate a new swap
    const swapIntent = await createSwapIntent();

    // create a swap after receiving the event
    await prisma.$transaction(async (client) => {
      await swapIngressReceived({
        prisma: client,
        block: swapIngressMock.block as any,
        event: swapIngressMock.eventContext.event as any,
      });
    });

    const swap = await prisma.swap.findFirstOrThrow({
      where: { swapIntentId: swapIntent.id },
    });

    expect(swap.ingressAmount.toString()).toEqual(
      swapIngressMock.eventContext.event.args.ingressAmount,
    );
    expect(swap).toMatchSnapshot({
      id: expect.any(BigInt),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      swapIntentId: expect.any(BigInt),
    });
  });
});

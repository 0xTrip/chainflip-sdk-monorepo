import { SwapExpiredMock } from './utils';
import prisma, { SwapIntent } from '../../client';
import swapIntentExpired from '../swapIntentExpired';

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

describe(swapIntentExpired, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapIntent", "Swap" CASCADE`;
  });

  it('expired', async () => {
    // create a swap after receiving the event
    const swapIntent = await createSwapIntent();
    expect(swapIntent.active).toBe(true);
    await prisma.$transaction(async (client) => {
      await swapIntentExpired({
        prisma: client,
        block: SwapExpiredMock.block as any,
        event: SwapExpiredMock.eventContext.event as any,
      });
    });

    const updatedSwapIntent = await prisma.swapIntent.findFirstOrThrow({
      where: { id: swapIntent.id },
    });
    expect(updatedSwapIntent.active).toBe(false);
  });
});

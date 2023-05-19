import { SwapExpiredMock } from './utils';
import prisma, { SwapDepositChannel } from '../../client';
import swapDepositAddressExpired from '../swapDepositAddressExpired';

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

describe(swapDepositAddressExpired, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "Swap" CASCADE`;
  });

  it('expired', async () => {
    // create a swap after receiving the event
    const swapDepositChannel = await createSwapRequest();
    expect(swapDepositChannel.active).toBe(true);
    await prisma.$transaction(async (client) => {
      await swapDepositAddressExpired({
        prisma: client,
        block: SwapExpiredMock.block as any,
        event: SwapExpiredMock.eventContext.event as any,
      });
    });

    const updatedSwapIntent = await prisma.swapDepositChannel.findFirstOrThrow({
      where: { id: swapDepositChannel.id },
    });
    expect(updatedSwapIntent.active).toBe(false);
  });
});

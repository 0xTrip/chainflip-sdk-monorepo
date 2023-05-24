import { swapScheduledByDepositMock } from './utils';
import prisma, { SwapDepositChannel } from '../../client';
import swapScheduledByDeposit from '../swapScheduledByDeposit';

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

describe(swapScheduledByDeposit, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "Swap" CASCADE`;
  });

  it('stores a new swap', async () => {
    // store a new swap intent to initiate a new swap
    const swapDepositChannel = await createSwapRequest();

    // create a swap after receiving the event
    await prisma.$transaction(async (client) => {
      await swapScheduledByDeposit({
        prisma: client,
        block: swapScheduledByDepositMock.block as any,
        event: swapScheduledByDepositMock.eventContext.event as any,
      });
    });

    const swap = await prisma.swap.findFirstOrThrow({
      where: { swapDepositChannelId: swapDepositChannel.id },
    });

    expect(swap.depositAmount.toString()).toEqual(
      swapScheduledByDepositMock.eventContext.event.args.depositAmount,
    );
    expect(swap).toMatchSnapshot({
      id: expect.any(BigInt),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      swapDepositChannelId: expect.any(BigInt),
    });
  });
});

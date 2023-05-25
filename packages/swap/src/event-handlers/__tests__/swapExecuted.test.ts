import { swapExecutedMock } from './utils';
import prisma, { SwapDepositChannel } from '../../client';
import swapExecuted from '../swapExecuted';

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
      issuedBlock: 100,
      expiryBlock: 200,
      ...data,
    },
  });

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
    const swapDepositChannel = await createSwapRequest({
      swaps: {
        create: {
          nativeId: BigInt(swapId),
          depositAmount: '10000000000',
          depositReceivedAt: new Date(block.timestamp - 6000),
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

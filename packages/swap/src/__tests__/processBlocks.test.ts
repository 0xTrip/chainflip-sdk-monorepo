import { GraphQLClient } from 'graphql-request';
import prisma from '../client';
import type { SwapScheduledByDepositEvent } from '../event-handlers/swapScheduledByDeposit';
import { GetBatchQuery } from '../gql/generated/graphql';
import processBlocks from '../processBlocks';

describe(processBlocks, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "Swap", private."State" CASCADE`;
  });

  it('dispatches a SwapScheduledByDeposit event', async () => {
    const depositAddress = '0xcafebabe';
    await prisma.swapDepositChannel.create({
      data: {
        depositAddress,
        issuedBlock: 100,
        expiryBlock: 200,
        depositAsset: 'ETH',
        destinationAsset: 'USDC',
        destinationAddress: '0xdeadbeef',
        expectedDepositAmount: '1000000000000000000',
      },
    });

    const requestSpy = jest
      .spyOn(GraphQLClient.prototype, 'request')
      .mockResolvedValueOnce({
        blocks: {
          nodes: [
            {
              height: 1,
              timestamp: 1681989543437,
              events: {
                nodes: [
                  {
                    name: 'Swapping.SwapScheduledByDeposit',
                    args: {
                      depositAmount: '1000000000000000000',
                      swapId: 1,
                      depositAddress: {
                        value: depositAddress,
                        __kind: 'Eth',
                      },
                    } as SwapScheduledByDepositEvent,
                    indexInBlock: 3,
                  },
                ],
              },
            },
          ],
        },
      } as GetBatchQuery)
      // terminate the loop
      .mockRejectedValue(Error('clean exit'));

    await expect(processBlocks()).rejects.toThrowError('clean exit');
    expect(requestSpy).toHaveBeenCalledTimes(2);
    const swaps = await prisma.swap.findMany();
    expect(swaps).toHaveLength(1);
    expect(swaps[0]).toMatchInlineSnapshot(
      {
        id: expect.any(BigInt),
        swapDepositChannelId: expect.any(BigInt),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      `
      {
        "createdAt": Any<Date>,
        "depositAmount": "1000000000000000000",
        "depositReceivedAt": 2023-04-20T11:19:03.437Z,
        "depositReceivedBlockIndex": "1-3",
        "egressCompletedAt": null,
        "egressCompletedBlockIndex": null,
        "id": Any<BigInt>,
        "nativeId": 1n,
        "swapDepositChannelId": Any<BigInt>,
        "swapExecutedAt": null,
        "swapExecutedBlockIndex": null,
        "updatedAt": Any<Date>,
      }
    `,
    );
  });
});

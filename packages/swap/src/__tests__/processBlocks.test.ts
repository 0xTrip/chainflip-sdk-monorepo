import { GraphQLClient } from 'graphql-request';
import prisma from '../client';
import type { SwapIngressReceivedEvent } from '../event-handlers/swapIngressReceived';
import { GetBatchQuery } from '../gql/generated/graphql';
import processBlocks from '../processBlocks';

describe(processBlocks, () => {
  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapIntent", "Swap", private."State" CASCADE`;
  });

  it('dispatches a SwapIngressReceived event', async () => {
    const ingressAddress = '0xcafebabe';
    await prisma.swapIntent.create({
      data: {
        ingressAddress,
        active: true,
        ingressAsset: 'ETH',
        egressAsset: 'USDC',
        egressAddress: '0xdeadbeef',
        expectedIngressAmount: '1000000000000000000',
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
                    name: 'Swapping.SwapIngressReceived',
                    args: {
                      ingressAmount: '1000000000000000000',
                      swapId: 1,
                      ingressAddress: {
                        value: ingressAddress,
                        __kind: 'Eth',
                      },
                    } as SwapIngressReceivedEvent,
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
        swapIntentId: expect.any(BigInt),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      `
      {
        "createdAt": Any<Date>,
        "egressCompleteAt": null,
        "id": Any<BigInt>,
        "ingressAmount": "1000000000000000000",
        "ingressReceivedAt": 2023-04-20T11:19:03.437Z,
        "nativeId": 1n,
        "swapExecutedAt": null,
        "swapIntentId": Any<BigInt>,
        "updatedAt": Any<Date>,
      }
    `,
    );
  });
});

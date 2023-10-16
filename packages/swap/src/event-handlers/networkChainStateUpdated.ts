import { z } from 'zod';
import { Chain } from '../enums';
import { u128 } from '../parsers';
import { EventHandlerArgs } from '.';

const chainStateUpdatedArgs = z.object({
  newChainState: z.object({
    blockHeight: u128,
  }),
});

const chainStateUpdated =
  (chain: Chain) =>
  async ({ prisma, event }: EventHandlerArgs) => {
    const { blockHeight } = chainStateUpdatedArgs.parse(
      event.args,
    ).newChainState;

    await Promise.all([
      prisma.swapDepositChannel.updateMany({
        where: {
          srcChain: chain,
          srcChainExpiryBlock: { lte: blockHeight },
          isExpired: false,
        },
        data: { isExpired: true },
      }),
    ]);
  };

export default chainStateUpdated;
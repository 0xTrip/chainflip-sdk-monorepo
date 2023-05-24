import prisma from '../../client';
import type { DepositChannelResponse } from '../../utils/broker';
import { loop } from '../../utils/function';
import logger from '../../utils/logger';

const findIssuedBlockForSwapRequest = async ({
  expiryBlock,
  depositAddress,
}: DepositChannelResponse): // eslint-disable-next-line consistent-return
Promise<number | undefined> => {
  for await (const count of loop({ timeout: 250 })) {
    if (count === 100) {
      logger.error('failed to find block height for swap intent', {
        depositAddress,
      });
      return undefined;
    }

    const blockForIntent = await prisma.swapDepositChannelBlock.findFirst({
      where: {
        depositAddress,
        expiryBlock,
      },
    });

    if (blockForIntent !== null) {
      await prisma.swapDepositChannelBlock.delete({
        where: { id: blockForIntent.id },
      });
      return blockForIntent.issuedBlock;
    }
  }
};

export default findIssuedBlockForSwapRequest;

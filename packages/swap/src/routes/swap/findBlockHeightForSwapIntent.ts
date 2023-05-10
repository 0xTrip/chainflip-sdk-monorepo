import prisma from '../../client';
import { loop } from '../../utils/function';
import logger from '../../utils/logger';

const findBlockHeightForSwapIntent = async (
  previousHeight: number,
  ingressAddress: string,
  // eslint-disable-next-line consistent-return
): Promise<number | undefined> => {
  for await (const count of loop({ timeout: 250 })) {
    if (count === 100) {
      logger.error('failed to find block height for swap intent', {
        ingressAddress,
      });
      return undefined;
    }

    const blockForIntent = await prisma.swapIntentBlock.findFirst({
      where: {
        ingressAddress,
        blockHeight: { gt: previousHeight },
      },
    });

    if (blockForIntent !== null) {
      await prisma.swapIntentBlock.delete({ where: { id: blockForIntent.id } });
      return blockForIntent.blockHeight;
    }
  }
};

export default findBlockHeightForSwapIntent;

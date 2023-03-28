import prisma from '../client';
import { eventHandlers, isSwapEvent } from '../event-handlers';
import type { Context } from '../processor';

export async function processBlock(ctx: Context): Promise<void> {
  for (const block of ctx.blocks) {
    await prisma.$transaction(async (tx) => {
      for (const item of block.items) {
        if (isSwapEvent(item)) {
          await eventHandlers[item.name]({
            prisma: tx,
            event: item.event,
            block,
          });
        }
      }
    });
  }
}

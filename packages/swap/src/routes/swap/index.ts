import assert from 'assert';
import express from 'express';
import { validateAddress } from '@/sdk/swap/validation/addressValidation';
import { postSwapSchema } from '@/shared/schemas';
import findBlockHeightForSwapRequest from './findBlockHeightForSwapRequest';
import prisma from '../../client';
import { submitSwapToBroker } from '../../utils/broker';
import { isProduction } from '../../utils/consts';
import logger from '../../utils/logger';
import ServiceError from '../../utils/ServiceError';
import { asyncHandler } from '../common';

const router = express.Router();

export enum State {
  Complete = 'COMPLETE',
  EgressScheduled = 'EGRESS_SCHEDULED',
  SwapExecuted = 'SWAP_EXECUTED',
  DepositReceived = 'DEPOSIT_RECEIVED',
  AwaitingDeposit = 'AWAITING_DEPOSIT',
}

router.get(
  '/:uuid',
  asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    const swapDepositChannel = await prisma.swapDepositChannel.findUnique({
      where: { uuid },
      include: { swaps: { include: { egress: true } } },
    });

    if (!swapDepositChannel) {
      logger.info(`could not find swap request with id "${uuid}`);
      throw ServiceError.notFound();
    }

    const swap = swapDepositChannel.swaps.at(0);

    let state: State;

    if (swap?.egressCompletedAt) {
      assert(swap.swapExecutedAt, 'swapExecutedAt should not be null');
      assert(swap.egress, 'egress should not be null');
      state = State.Complete;
    } else if (swap?.egress) {
      assert(swap.swapExecutedAt, 'swapExecutedAt should not be null');
      state = State.EgressScheduled;
    } else if (swap?.swapExecutedAt) {
      state = State.SwapExecuted;
    } else if (swap?.depositReceivedAt) {
      state = State.DepositReceived;
    } else {
      state = State.AwaitingDeposit;
    }

    const response = {
      state,
      egressCompletedAt: swap?.egressCompletedAt?.valueOf(),
      egressAmount: swap?.egress?.amount?.toString(),
      depositAmount: swap?.depositAmount?.toString(),
      egressScheduledAt: swap?.egress?.timestamp.valueOf(),
      swapExecutedAt: swap?.swapExecutedAt?.valueOf(),
      depositReceivedAt: swap?.depositReceivedAt.valueOf(),
      depositAddress: swapDepositChannel.depositAddress,
      expectedDepositAmount:
        swapDepositChannel.expectedDepositAmount.toString(),
      destinationAddress: swapDepositChannel.destinationAddress,
      depositAsset: swapDepositChannel.depositAsset,
      destinationAsset: swapDepositChannel.destinationAsset,
    };

    logger.info('sending response for swap request', { uuid, response });

    res.json(response);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = postSwapSchema.safeParse(req.body);
    if (!result.success) {
      logger.info('received bad request for new swap', { body: req.body });
      throw ServiceError.badRequest('invalid request body');
    }

    const payload = result.data;

    if (
      !validateAddress(
        payload.destinationAsset,
        payload.destinationAddress,
        isProduction,
      )
    ) {
      throw ServiceError.badRequest('provided address is not valid');
    }

    const { height } = await prisma.state.findFirstOrThrow();
    const depositAddress = await submitSwapToBroker(payload);

    const blockHeight = await findBlockHeightForSwapRequest(
      height,
      depositAddress,
    );

    const { uuid } = await prisma.swapDepositChannel.create({
      data: { ...payload, depositAddress, blockHeight },
    });

    res.json({ depositAddress, blockHeight, id: uuid });
  }),
);

export default router;

import assert from 'assert';
import express from 'express';
import { validateAddress } from '@/sdk/swap/validation/addressValidation';
import { postSwapSchema } from '@/shared/schemas';
import findBlockHeightForSwapIntent from './findBlockHeightForSwapIntent';
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
  IngressReceived = 'INGRESS_RECEIVED',
  AwaitingIngress = 'AWAITING_INGRESS',
}

router.get(
  '/:uuid',
  asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    const swapIntent = await prisma.swapIntent.findUnique({
      where: { uuid },
      include: { swaps: { include: { egress: true } } },
    });

    if (!swapIntent) {
      logger.info(`could not find swap intent with id "${uuid}`);
      throw ServiceError.notFound();
    }

    const swap = swapIntent.swaps.at(0);

    let state: State;

    if (swap?.egressCompleteAt) {
      assert(swap.swapExecutedAt, 'swapExecutedAt should not be null');
      assert(swap.egress, 'egress should not be null');
      state = State.Complete;
    } else if (swap?.egress) {
      assert(swap.swapExecutedAt, 'swapExecutedAt should not be null');
      state = State.EgressScheduled;
    } else if (swap?.swapExecutedAt) {
      state = State.SwapExecuted;
    } else if (swap?.ingressReceivedAt) {
      state = State.IngressReceived;
    } else {
      state = State.AwaitingIngress;
    }

    const response = {
      state,
      egressCompleteAt: swap?.egressCompleteAt?.valueOf(),
      egressAmount: swap?.egress?.amount?.toString(),
      ingressAmount: swap?.ingressAmount?.toString(),
      egressScheduledAt: swap?.egress?.timestamp.valueOf(),
      swapExecutedAt: swap?.swapExecutedAt?.valueOf(),
      ingressReceivedAt: swap?.ingressReceivedAt.valueOf(),
      ingressAddress: swapIntent.ingressAddress,
      expectedIngressAmount: swapIntent.expectedIngressAmount.toString(),
      egressAddress: swapIntent.egressAddress,
      ingressAsset: swapIntent.ingressAsset,
      egressAsset: swapIntent.egressAsset,
    };

    logger.info('sending response for swap intent', { uuid, response });

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
      !validateAddress(payload.egressAsset, payload.egressAddress, isProduction)
    ) {
      throw ServiceError.badRequest('provided address is not valid');
    }

    const { height } = await prisma.state.findFirstOrThrow();
    const ingressAddress = await submitSwapToBroker(payload);

    const blockHeight = await findBlockHeightForSwapIntent(
      height,
      ingressAddress,
    );

    const { uuid } = await prisma.swapIntent.create({
      data: { ...payload, ingressAddress, blockHeight },
    });

    res.json({ ingressAddress, blockHeight, id: uuid });
  }),
);

export default router;

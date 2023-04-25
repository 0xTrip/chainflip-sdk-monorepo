import express from 'express';
import { asyncHandler } from './common';
import prisma from '../client';
import logger from '../utils/logger';
import { thirdPartySwapSchema } from '../utils/parsers';
import ServiceError from '../utils/ServiceError';

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = thirdPartySwapSchema.safeParse(req.body);

    if (!result.success) {
      logger.info('received bad request for new third party swap', {
        body: req.body,
      });
      throw ServiceError.badRequest('invalid request body');
    }
    try {
      await prisma.thirdPartySwap.create({
        data: {
          uuid: result.data.uuid,
          protocol: result.data.routeResponse.protocol,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          routeResponse: result.data.routeResponse as Record<string, any>,
        },
      });
      res.sendStatus(201);
    } catch (err) {
      if (err instanceof Error) throw ServiceError.internalError(err.message);
      throw ServiceError.internalError();
    }
  }),
);

export default router;

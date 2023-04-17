import express from 'express';
import { rateQuerySchema } from '@/shared/schemas';
import { asyncHandler } from './common';
import logger from '../utils/logger';
import ServiceError from '../utils/ServiceError';
import { getRateEstimate } from '../utils/statechain';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = rateQuerySchema.safeParse(req.query);

    if (!result.success) {
      logger.info('received invalid rates request', { query: req.query });
      throw ServiceError.badRequest('invalid request');
    }

    const rate = await getRateEstimate(result.data);

    res.json({ rate });
  }),
);

export default router;

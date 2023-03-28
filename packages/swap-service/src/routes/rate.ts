import express from 'express';
import { z } from 'zod';
import { asyncHandler } from './common';
import { supportedAsset } from '../utils/assets';
import logger from '../utils/logger';
import { numericString } from '../utils/parsers';
import ServiceError from '../utils/ServiceError';
import { getRateEstimate } from '../utils/statechain';

const router = express.Router();

const rateQuerySchema = z.object({
  ingressAsset: supportedAsset,
  egressAsset: supportedAsset,
  amount: numericString,
});

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

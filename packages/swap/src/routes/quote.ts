import express from 'express';
import type { Server } from 'socket.io';
import { quoteQuerySchema } from '@/shared/schemas';
import { asyncHandler } from './common';
import getConnectionHandler from '../quoting/getConnectionHandler';
import {
  collectQuotes,
  findBestQuote,
  buildQuoteRequest,
} from '../quoting/quotes';
import logger from '../utils/logger';
import ServiceError from '../utils/ServiceError';
import { getBrokerQuote } from '../utils/statechain';

const quote = (io: Server) => {
  const router = express.Router();

  const { handler, quotes$ } = getConnectionHandler();

  io.on('connection', handler);

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const result = quoteQuerySchema.safeParse(req.query);

      if (!result.success) {
        logger.info('received invalid quote request', { query: req.query });
        throw ServiceError.badRequest('invalid request');
      }

      const quoteRequest = buildQuoteRequest(result.data);

      io.emit('quote_request', quoteRequest);

      const [marketMakerQuotes, brokerQuote] = await Promise.all([
        collectQuotes(quoteRequest.id, io.sockets.sockets.size, quotes$),
        getBrokerQuote(result.data, quoteRequest.id),
      ]);

      res.json(findBestQuote(marketMakerQuotes, brokerQuote));
    }),
  );

  return router;
};

export default quote;

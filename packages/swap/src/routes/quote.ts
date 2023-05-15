import express from 'express';
import type { Server } from 'socket.io';
import { quoteQuerySchema } from '@/shared/schemas';
import { asyncHandler } from './common';
import getConnectionHandler from '../quoting/getConnectionHandler';
import { findBestQuote, buildQuoteRequest } from '../quoting/quotes';
import logger from '../utils/logger';
import ServiceError from '../utils/ServiceError';

const quote = (io: Server) => {
  const router = express.Router();

  const { handler } = getConnectionHandler();

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

      // enable later when we have a market maker

      // io.emit('quote_request', quoteRequest);

      // const [marketMakerQuotes, brokerQuote] = await Promise.all([
      //   collectQuotes(quoteRequest.id, io.sockets.sockets.size, quotes$),
      //   getBrokerQuote(result.data, quoteRequest.id),
      // ]);

      const egressAmount =
        Math.random() < 5 ? BigInt('1000000000') : BigInt('2000000000');
      res.json(
        findBestQuote(
          [
            {
              id: quoteRequest.id,
              egressAmount: egressAmount.toString(),
            },
          ],
          {
            id: quoteRequest.id,
            egressAmount: egressAmount.toString(),
          },
        ),
      );
    }),
  );

  return router;
};

export default quote;

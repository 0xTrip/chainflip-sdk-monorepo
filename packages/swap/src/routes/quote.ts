import express from 'express';
import { Subject } from 'rxjs';
import type { Server } from 'socket.io';
import {
  quoteQuerySchema,
  QuoteResponse,
  quoteResponseSchema,
} from '@/shared/schemas';
import { asyncHandler } from './common';
import {
  collectQuotes,
  findBestQuote,
  buildQuoteRequest,
} from '../quoting/quotes';
import logger from '../utils/logger';
import ServiceError from '../utils/ServiceError';
// import { getRateEstimate } from '../utils/statechain';

const quote = (io: Server) => {
  const router = express.Router();

  const quoteResponses$ = new Subject<{
    client: string;
    quote: QuoteResponse;
  }>();

  io.on('connection', (socket) => {
    logger.info(`socket connected with id "${socket.id}"`);

    socket.on('disconnect', () => {
      logger.info(`socket disconnected with id "${socket.id}"`);
    });

    socket.on('quote_response', (message) => {
      const result = quoteResponseSchema.safeParse(message);

      if (!result.success) {
        logger.warn('received invalid quote response', { message });
        return;
      }

      quoteResponses$.next({ client: socket.id, quote: result.data });
    });
  });

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

      const [quotes] = await Promise.all([
        collectQuotes(
          quoteRequest.id,
          io.sockets.sockets.size,
          quoteResponses$,
        ),
        // getRateEstimate(result.data),
      ]);

      res.json(findBestQuote(quotes));
    }),
  );

  return router;
};

export default quote;

import * as crypto from 'crypto';
import type { Server } from 'socket.io';
import { z } from 'zod';
import prisma from '../client';
import logger from '../utils/logger';

type Middleware = Parameters<Server['use']>[0];
type Socket = Parameters<Middleware>[0];
type Next = Parameters<Middleware>[1];

const authSchema = z.object({
  client_version: z.literal('1'),
  market_maker_id: z.string(),
  timestamp: z.number(),
  signature: z.string(),
});

const authenticate = async (socket: Socket, next: Next) => {
  const result = authSchema.safeParse(socket.handshake.auth);

  if (!result.success) {
    next(new Error('invalid auth'));
    return;
  }

  const auth = result.data;

  if (Date.now() - auth.timestamp > 10000) {
    next(new Error('auth expired'));
    return;
  }

  const marketMaker = await prisma.marketMaker.findUnique({
    where: { name: auth.market_maker_id },
  });

  if (!marketMaker) {
    next(new Error('market maker not found'));
    return;
  }

  let key: crypto.KeyObject;
  try {
    key = crypto.createPublicKey({
      key: Buffer.from(marketMaker.publicKey),
      format: 'pem',
      type: 'spki',
    });
  } catch {
    logger.error('invalid public key', { marketMaker });
    next(new Error('invalid public key'));
    return;
  }

  const signaturesMatch = crypto.verify(
    null,
    Buffer.from(`${auth.market_maker_id}${auth.timestamp}`, 'utf8'),
    key,
    Buffer.from(auth.signature, 'base64'),
  );

  if (!signaturesMatch) {
    next(new Error('invalid signature'));
    return;
  }

  next();
};

export default authenticate;

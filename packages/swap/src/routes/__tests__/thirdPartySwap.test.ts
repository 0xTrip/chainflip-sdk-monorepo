import * as crypto from 'crypto';
import { Server } from 'http';
import request from 'supertest';
import prisma from '../../client';
import app from '../../server';

describe('server', () => {
  let server: Server;

  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "ThirdPartySwap" CASCADE`;
    server = app.listen(0);
  });

  afterEach((cb) => {
    server.close(cb);
  });

  describe('POST /third-party-swap', () => {
    it('saves the third party swap information', async () => {
      const uuid = crypto.randomUUID();
      const body = {
        uuid,
        routeResponse: { integration: 'lifi', route: 'route' },
      };

      const { status } = await request(app)
        .post('/third-party-swap')
        .send(body);
      try {
        const swap = await prisma.thirdPartySwap.findFirstOrThrow({
          where: { uuid },
        });
        expect(status).toBe(201);
        expect(swap.uuid).toBe(uuid);
      } catch {
        expect(true).toBe(false);
      }
    });

    it('throws when protocol info is missing', async () => {
      const uuid = crypto.randomUUID();
      const body = {
        uuid,
        routeResponse: { route: 'route' },
      };

      const { status } = await request(app)
        .post('/third-party-swap')
        .send(body);
      try {
        await prisma.thirdPartySwap.findFirstOrThrow({
          where: { uuid },
        });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('No ThirdPartySwap found');
      }
      expect(status).not.toBe(201);
    });

    it('throws bad request uuid is missing', async () => {
      const body = {
        routeResponse: { protocol: 'Lifi', route: 'route' },
      };
      const { status } = await request(app)
        .post('/third-party-swap')
        .send(body);
      expect(status).toBe(400);
    });
  });
});

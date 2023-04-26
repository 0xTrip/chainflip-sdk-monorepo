// import BigNumber from 'bignumber.js';
import * as crypto from 'crypto';
import { once } from 'events';
import { Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { promisify } from 'util';
import prisma from '../../client';
import QuotingClient from '../../quoting/QuotingClient';
import app from '../../server';
// import RpcClient from '../../utils/RpcClient';

const generateKeyPairAsync = promisify(crypto.generateKeyPair);

jest.mock(
  '../../utils/RpcClient',
  () =>
    class {
      async connect() {
        return this;
      }

      sendRequest() {
        throw new Error('unmocked request');
      }
    },
);

describe('server', () => {
  let server: Server;
  let client: QuotingClient;

  beforeEach(async () => {
    server = app.listen(0);
    await prisma.$queryRaw`TRUNCATE TABLE private."MarketMaker" CASCADE`;
    const name = 'web_team_whales';
    const pair = await generateKeyPairAsync('ed25519');
    await prisma.marketMaker.create({
      data: {
        name: 'web_team_whales',
        publicKey: pair.publicKey
          .export({ format: 'pem', type: 'spki' })
          .toString('base64'),
      },
    });

    client = new QuotingClient(
      `http://localhost:${(server.address() as AddressInfo).port}`,
      name,
      pair.privateKey.export({ format: 'pem', type: 'pkcs8' }).toString(),
    );
    await once(client, 'connected');
  });

  afterEach((cb) => {
    client.close();
    server.close(cb);
  });

  describe('GET /quote', () => {
    it('gets the rates', async () => {
      // TODO: restore broker mock
      // const sendSpy = jest
      //   .spyOn(RpcClient.prototype, 'sendRequest')
      //   .mockResolvedValueOnce(new BigNumber('1').times(10e18));
      const params = new URLSearchParams({
        ingressAsset: 'FLIP',
        egressAsset: 'ETH',
        amount: '1',
      });

      client.setQuoteRequestHandler(async (req) => ({
        id: req.id,
        intermediate_amount: '1000000000',
        egress_amount: '0.005',
      }));

      const { body, status } = await request(server).get(
        `/quote?${params.toString()}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchSnapshot({ id: expect.any(String) });
      // expect(sendSpy).toHaveBeenCalledTimes(1);
    });
  });
});

import * as crypto from 'crypto';
import { Server } from 'http';
import request from 'supertest';
import prisma, { SwapIntent } from '../../client';
import app from '../../server';
import RpcClient from '../../utils/RpcClient';
import { State } from '../swap';

jest.mock('timers/promises', () => ({
  setTimeout: jest.fn().mockResolvedValue(undefined),
}));

const randomId = () => BigInt(crypto.randomInt(1, 100000));

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

const ETH_ADDRESS = '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2';
const HEX_DOT_ADDRESS = '0xca';
const DOT_ADDRESS = '5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX';
const RECEIVED_TIMESTAMP = 1669907135201;

type SwapData = Parameters<(typeof prisma)['swapIntent']['create']>[0]['data'];
const createSwapIntent = (data: Partial<SwapData> = {}): Promise<SwapIntent> =>
  prisma.swapIntent.create({
    data: {
      ingressAsset: 'ETH',
      egressAsset: 'DOT',
      ingressAddress: ETH_ADDRESS,
      egressAddress: DOT_ADDRESS,
      expectedIngressAmount: '1000000000',
      ...data,
    },
  });

describe('server', () => {
  let server: Server;
  jest.setTimeout(1000);

  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapIntent", private."State", "SwapIntentBlock" CASCADE`;
    await prisma.state.create({ data: { id: 1, height: 10 } });
    server = app.listen(0);
  });

  afterEach((cb) => {
    server.close(cb);
  });

  describe('GET /swaps/:id', () => {
    it('throws an error if no swap intent is found', async () => {
      const { body, status } = await request(server).get(`/swaps/1`);

      expect(status).toBe(404);
      expect(body).toEqual({ message: 'resource not found' });
    });

    it(`retrieves a swap in ${State.AwaitingIngress} status`, async () => {
      const swapIntent = await createSwapIntent();

      const { body, status } = await request(server).get(
        `/swaps/${swapIntent.uuid}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchInlineSnapshot(`
        {
          "egressAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "egressAsset": "DOT",
          "expectedIngressAmount": "1000000000",
          "ingressAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "ingressAsset": "ETH",
          "state": "AWAITING_INGRESS",
        }
      `);
    });

    it(`retrieves a swap in ${State.IngressReceived} status`, async () => {
      const swapIntent = await createSwapIntent({
        swaps: {
          create: {
            ingressAmount: '10',
            ingressReceivedAt: new Date(RECEIVED_TIMESTAMP),
            nativeId: randomId(),
          },
        },
      });

      const { body, status } = await request(server).get(
        `/swaps/${swapIntent.uuid}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchInlineSnapshot(`
        {
          "egressAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "egressAsset": "DOT",
          "expectedIngressAmount": "1000000000",
          "ingressAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "ingressAmount": "10",
          "ingressAsset": "ETH",
          "ingressReceivedAt": 1669907135201,
          "state": "INGRESS_RECEIVED",
        }
      `);
    });

    it(`retrieves a swap in ${State.SwapExecuted} status`, async () => {
      const swapIntent = await createSwapIntent({
        swaps: {
          create: {
            nativeId: randomId(),
            ingressReceivedAt: new Date(RECEIVED_TIMESTAMP),
            ingressAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
          },
        },
      });

      const { body, status } = await request(server).get(
        `/swaps/${swapIntent.uuid}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchInlineSnapshot(`
        {
          "egressAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "egressAsset": "DOT",
          "expectedIngressAmount": "1000000000",
          "ingressAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "ingressAmount": "10",
          "ingressAsset": "ETH",
          "ingressReceivedAt": 1669907135201,
          "state": "SWAP_EXECUTED",
          "swapExecutedAt": 1669907141201,
        }
      `);
    });

    it(`retrieves a swap in ${State.EgressScheduled} status`, async () => {
      const swapIntent = await createSwapIntent({
        swaps: {
          create: {
            nativeId: randomId(),
            ingressReceivedAt: new Date(RECEIVED_TIMESTAMP),
            ingressAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
            egress: {
              create: {
                timestamp: new Date(RECEIVED_TIMESTAMP + 12000),
                amount: (10n ** 18n).toString(),
                network: 'Ethereum',
                nativeId: 1n,
              },
            },
          },
        },
      });

      const { body, status } = await request(server).get(
        `/swaps/${swapIntent.uuid}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchInlineSnapshot(`
        {
          "egressAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "egressAmount": "1000000000000000000",
          "egressAsset": "DOT",
          "egressScheduledAt": 1669907147201,
          "expectedIngressAmount": "1000000000",
          "ingressAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "ingressAmount": "10",
          "ingressAsset": "ETH",
          "ingressReceivedAt": 1669907135201,
          "state": "EGRESS_SCHEDULED",
          "swapExecutedAt": 1669907141201,
        }
      `);
    });

    it(`retrieves a swap in ${State.Complete} status`, async () => {
      const swapIntent = await createSwapIntent({
        swaps: {
          create: {
            nativeId: randomId(),
            ingressReceivedAt: new Date(RECEIVED_TIMESTAMP),
            ingressAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
            egressCompleteAt: new Date(RECEIVED_TIMESTAMP + 18000),
            egress: {
              create: {
                timestamp: new Date(RECEIVED_TIMESTAMP + 12000),
                amount: (10n ** 18n).toString(),
                network: 'Ethereum',
                nativeId: 1n,
              },
            },
          },
        },
      });

      const { body, status } = await request(server).get(
        `/swaps/${swapIntent.uuid}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchInlineSnapshot(`
        {
          "egressAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "egressAmount": "1000000000000000000",
          "egressAsset": "DOT",
          "egressCompleteAt": 1669907153201,
          "egressScheduledAt": 1669907147201,
          "expectedIngressAmount": "1000000000",
          "ingressAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "ingressAmount": "10",
          "ingressAsset": "ETH",
          "ingressReceivedAt": 1669907135201,
          "state": "COMPLETE",
          "swapExecutedAt": 1669907141201,
        }
      `);
    });
  });

  describe('POST /swaps', () => {
    it.each([
      [
        {
          ingressAsset: 'ETH',
          egressAsset: 'DOT',
          egressAddress: HEX_DOT_ADDRESS,
          expectedIngressAmount: '1000000000',
        },
      ],
      [
        {
          ingressAsset: 'ETH',
          egressAsset: 'DOT',
          egressAddress: DOT_ADDRESS,
          expectedIngressAmount: '1000000000',
        },
      ],
      [
        {
          ingressAsset: 'DOT',
          egressAsset: 'ETH',
          egressAddress: ETH_ADDRESS,
          expectedIngressAmount: '1000000000',
        },
      ],
    ])('creates a new swap intent', async (requestBody) => {
      const blockHeight = 123;
      const ingressAddress = 'THE_INGRESS_ADDRESS';
      jest
        .spyOn(RpcClient.prototype, 'sendRequest')
        .mockResolvedValueOnce(ingressAddress);
      await prisma.swapIntentBlock.create({
        data: { ingressAddress, blockHeight },
      });

      const { body, status } = await request(app)
        .post('/swaps')
        .send(requestBody);

      expect(status).toBe(200);
      expect(body).toMatchObject({
        blockHeight,
        ingressAddress,
        id: expect.any(String),
      });
    });

    it.each([
      ['ingressAsset', 'SHIB'],
      ['egressAsset', 'SHIB'],
    ])('rejects an invalid %s', async (key, value) => {
      const requestBody = {
        ingressAsset: 'ETH',
        egressAsset: 'DOT',
        egressAddress: HEX_DOT_ADDRESS,
        expectedIngressAmount: '1000000000',
        [key]: value,
      };

      const { body, status } = await request(app)
        .post('/swaps')
        .send(requestBody);

      expect(status).toBe(400);
      expect(body).toMatchObject({ message: 'invalid request body' });
    });

    it.each([
      [
        'ETH',
        {
          ingressAsset: 'DOT',
          egressAsset: 'ETH',
          egressAddress: '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181f2',
          expectedIngressAmount: '1000000000',
        },
      ],
      [
        'DOT',
        {
          ingressAsset: 'ETH',
          egressAsset: 'DOT',
          egressAddress: '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181f2',
          expectedIngressAmount: '1000000000',
        },
      ],
    ])('throws on bad addresses (%s)', async (address, requestBody) => {
      const { body, status } = await request(app)
        .post('/swaps')
        .send(requestBody);

      expect(status).toBe(400);
      expect(body).toMatchObject({ message: 'provided address is not valid' });
    });
  });

  it('returns no block height if unable', async () => {
    jest
      .spyOn(RpcClient.prototype, 'sendRequest')
      .mockResolvedValueOnce('THE_INGRESS_ADDRESS');

    const promise = request(app).post('/swaps').send({
      ingressAsset: 'ETH',
      egressAsset: 'DOT',
      egressAddress: HEX_DOT_ADDRESS,
      expectedIngressAmount: '1000000000',
    });

    const { body, status } = await promise;

    expect(status).toBe(200);
    expect(body).not.toHaveProperty('blockHeight');
    expect(body).toMatchObject({
      ingressAddress: 'THE_INGRESS_ADDRESS',
      id: expect.any(String),
    });
  });
});

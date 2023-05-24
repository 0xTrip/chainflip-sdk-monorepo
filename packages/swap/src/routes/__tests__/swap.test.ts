import * as crypto from 'crypto';
import { Server } from 'http';
import request from 'supertest';
import prisma, { SwapDepositChannel } from '../../client';
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

type SwapData = Parameters<
  (typeof prisma)['swapDepositChannel']['create']
>[0]['data'];
const createSwapRequest = (
  data: Partial<SwapData> = {},
): Promise<SwapDepositChannel> =>
  prisma.swapDepositChannel.create({
    data: {
      depositAsset: 'ETH',
      destinationAsset: 'DOT',
      depositAddress: ETH_ADDRESS,
      destinationAddress: DOT_ADDRESS,
      expectedDepositAmount: '1000000000',
      expiryBlock: 100,
      ...data,
    },
  });

describe('server', () => {
  let server: Server;
  jest.setTimeout(1000);

  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel", "SwapDepositChannelBlock" CASCADE`;
    server = app.listen(0);
  });

  afterEach((cb) => {
    server.close(cb);
  });

  describe('GET /swaps/:id', () => {
    it('throws an error if no swap deposit channel is found', async () => {
      const { body, status } = await request(server).get(`/swaps/1`);

      expect(status).toBe(404);
      expect(body).toEqual({ message: 'resource not found' });
    });

    it(`retrieves a swap in ${State.AwaitingDeposit} status`, async () => {
      const swapIntent = await createSwapRequest();

      const { body, status } = await request(server).get(
        `/swaps/${swapIntent.uuid}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchInlineSnapshot(`
        {
          "depositAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "depositAsset": "ETH",
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "expectedDepositAmount": "1000000000",
          "state": "AWAITING_DEPOSIT",
        }
      `);
    });

    it(`retrieves a swap in ${State.DepositReceived} status`, async () => {
      const swapIntent = await createSwapRequest({
        swaps: {
          create: {
            depositAmount: '10',
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
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
          "depositAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "depositAmount": "10",
          "depositAsset": "ETH",
          "depositReceivedAt": 1669907135201,
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "expectedDepositAmount": "1000000000",
          "state": "DEPOSIT_RECEIVED",
        }
      `);
    });

    it(`retrieves a swap in ${State.SwapExecuted} status`, async () => {
      const swapIntent = await createSwapRequest({
        swaps: {
          create: {
            nativeId: randomId(),
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            depositAmount: '10',
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
          "depositAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "depositAmount": "10",
          "depositAsset": "ETH",
          "depositReceivedAt": 1669907135201,
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "expectedDepositAmount": "1000000000",
          "state": "SWAP_EXECUTED",
          "swapExecutedAt": 1669907141201,
        }
      `);
    });

    it(`retrieves a swap in ${State.EgressScheduled} status`, async () => {
      const swapIntent = await createSwapRequest({
        swaps: {
          create: {
            nativeId: randomId(),
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            depositAmount: '10',
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
          "depositAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "depositAmount": "10",
          "depositAsset": "ETH",
          "depositReceivedAt": 1669907135201,
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "egressAmount": "1000000000000000000",
          "egressScheduledAt": 1669907147201,
          "expectedDepositAmount": "1000000000",
          "state": "EGRESS_SCHEDULED",
          "swapExecutedAt": 1669907141201,
        }
      `);
    });

    it(`retrieves a swap in ${State.Complete} status`, async () => {
      const swapIntent = await createSwapRequest({
        swaps: {
          create: {
            nativeId: randomId(),
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            depositAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
            egressCompletedAt: new Date(RECEIVED_TIMESTAMP + 18000),
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
          "depositAddress": "0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181F2",
          "depositAmount": "10",
          "depositAsset": "ETH",
          "depositReceivedAt": 1669907135201,
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "egressAmount": "1000000000000000000",
          "egressCompletedAt": 1669907153201,
          "egressScheduledAt": 1669907147201,
          "expectedDepositAmount": "1000000000",
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
          depositAsset: 'ETH',
          destinationAsset: 'DOT',
          destinationAddress: HEX_DOT_ADDRESS,
          expectedDepositAmount: '1000000000',
        },
      ],
      [
        {
          depositAsset: 'ETH',
          destinationAsset: 'DOT',
          destinationAddress: DOT_ADDRESS,
          expectedDepositAmount: '1000000000',
        },
      ],
      [
        {
          depositAsset: 'DOT',
          destinationAsset: 'ETH',
          destinationAddress: ETH_ADDRESS,
          expectedDepositAmount: '1000000000',
        },
      ],
    ])('creates a new swap deposit channel', async (requestBody) => {
      const issuedBlock = 123;
      const depositAddress = 'THE_INGRESS_ADDRESS';
      jest
        .spyOn(RpcClient.prototype, 'sendRequest')
        .mockResolvedValueOnce({ depositAddress, expiryBlock: 100 });
      await prisma.swapDepositChannelBlock.create({
        data: { depositAddress, issuedBlock, expiryBlock: 100 },
      });

      const { body, status } = await request(app)
        .post('/swaps')
        .send(requestBody);

      expect(status).toBe(200);
      expect(body).toMatchObject({
        issuedBlock,
        depositAddress,
        id: expect.any(String),
      });
    });

    it.each([
      ['depositAsset', 'SHIB'],
      ['destinationAsset', 'SHIB'],
    ])('rejects an invalid %s', async (key, value) => {
      const requestBody = {
        depositAsset: 'ETH',
        destinationAsset: 'DOT',
        destinationAddress: HEX_DOT_ADDRESS,
        expectedDepositAmount: '1000000000',
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
          depositAsset: 'DOT',
          destinationAsset: 'ETH',
          destinationAddress: '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181f2',
          expectedDepositAmount: '1000000000',
        },
      ],
      [
        'DOT',
        {
          depositAsset: 'ETH',
          destinationAsset: 'DOT',
          destinationAddress: '0x6Aa69332B63bB5b1d7Ca5355387EDd5624e181f2',
          expectedDepositAmount: '1000000000',
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
    jest.spyOn(RpcClient.prototype, 'sendRequest').mockResolvedValueOnce({
      depositAddress: 'THE_INGRESS_ADDRESS',
      expiryBlock: 100,
    });

    const promise = request(app).post('/swaps').send({
      depositAsset: 'ETH',
      destinationAsset: 'DOT',
      destinationAddress: HEX_DOT_ADDRESS,
      expectedDepositAmount: '1000000000',
    });

    const { body, status } = await promise;

    expect(status).toBe(200);
    expect(body).not.toHaveProperty('issuedBlock');
    expect(body).toMatchObject({
      depositAddress: 'THE_INGRESS_ADDRESS',
      id: expect.any(String),
    });
  });
});

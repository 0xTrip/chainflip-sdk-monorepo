import * as crypto from 'crypto';
import { Server } from 'http';
import request from 'supertest';
import prisma from '../../client';
import {
  DOT_ADDRESS,
  ETH_ADDRESS,
  createDepositChannel,
} from '../../event-handlers/__tests__/utils';
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

const HEX_DOT_ADDRESS = '0xca';
const RECEIVED_TIMESTAMP = 1669907135201;
const RECEIVED_BLOCK_INDEX = `100-3`;

describe('server', () => {
  let server: Server;
  jest.setTimeout(1000);

  beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "SwapDepositChannel" CASCADE`;
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
      const swapIntent = await createDepositChannel();

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
          "expectedDepositAmount": "10000000000",
          "state": "AWAITING_DEPOSIT",
        }
      `);
    });

    it(`retrieves a swap in ${State.DepositReceived} status`, async () => {
      const swapIntent = await createDepositChannel({
        swaps: {
          create: {
            depositAmount: '10',
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            nativeId: randomId(),
            depositReceivedBlockIndex: RECEIVED_BLOCK_INDEX,
            depositAsset: 'ETH',
            destinationAsset: 'DOT',
            destinationAddress: DOT_ADDRESS,
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
          "depositReceivedBlockIndex": "100-3",
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "egressCompletedBlockIndex": null,
          "expectedDepositAmount": "10000000000",
          "state": "DEPOSIT_RECEIVED",
          "swapExecutedBlockIndex": null,
        }
      `);
    });

    it(`retrieves a swap in ${State.SwapExecuted} status`, async () => {
      const swapIntent = await createDepositChannel({
        swaps: {
          create: {
            nativeId: randomId(),
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            depositReceivedBlockIndex: RECEIVED_BLOCK_INDEX,
            depositAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
            swapExecutedBlockIndex: `200-3`,
            depositAsset: 'ETH',
            destinationAsset: 'DOT',
            destinationAddress: DOT_ADDRESS,
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
          "depositReceivedBlockIndex": "100-3",
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "egressCompletedBlockIndex": null,
          "expectedDepositAmount": "10000000000",
          "state": "SWAP_EXECUTED",
          "swapExecutedAt": 1669907141201,
          "swapExecutedBlockIndex": "200-3",
        }
      `);
    });

    it(`retrieves a swap in ${State.EgressScheduled} status`, async () => {
      const swapIntent = await createDepositChannel({
        swaps: {
          create: {
            nativeId: randomId(),
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            depositReceivedBlockIndex: RECEIVED_BLOCK_INDEX,
            depositAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
            swapExecutedBlockIndex: `200-3`,
            egress: {
              create: {
                timestamp: new Date(RECEIVED_TIMESTAMP + 12000),
                amount: (10n ** 18n).toString(),
                network: 'Ethereum',
                nativeId: 1n,
              },
            },
            depositAsset: 'ETH',
            destinationAsset: 'DOT',
            destinationAddress: DOT_ADDRESS,
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
          "depositReceivedBlockIndex": "100-3",
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "egressAmount": "1000000000000000000",
          "egressCompletedBlockIndex": null,
          "egressScheduledAt": 1669907147201,
          "expectedDepositAmount": "10000000000",
          "state": "EGRESS_SCHEDULED",
          "swapExecutedAt": 1669907141201,
          "swapExecutedBlockIndex": "200-3",
        }
      `);
    });

    it(`retrieves a swap in ${State.Complete} status`, async () => {
      const swapIntent = await createDepositChannel({
        swaps: {
          create: {
            nativeId: randomId(),
            depositReceivedAt: new Date(RECEIVED_TIMESTAMP),
            depositReceivedBlockIndex: RECEIVED_BLOCK_INDEX,
            depositAmount: '10',
            swapExecutedAt: new Date(RECEIVED_TIMESTAMP + 6000),
            swapExecutedBlockIndex: `200-3`,
            egressCompletedAt: new Date(RECEIVED_TIMESTAMP + 18000),
            egressCompletedBlockIndex: RECEIVED_BLOCK_INDEX + 200,
            egress: {
              create: {
                timestamp: new Date(RECEIVED_TIMESTAMP + 12000),
                amount: (10n ** 18n).toString(),
                network: 'Ethereum',
                nativeId: 1n,
              },
            },
            depositAsset: 'ETH',
            destinationAsset: 'DOT',
            destinationAddress: DOT_ADDRESS,
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
          "depositReceivedBlockIndex": "100-3",
          "destinationAddress": "5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX",
          "destinationAsset": "DOT",
          "egressAmount": "1000000000000000000",
          "egressCompletedAt": 1669907153201,
          "egressCompletedBlockIndex": "100-3200",
          "egressScheduledAt": 1669907147201,
          "expectedDepositAmount": "10000000000",
          "state": "COMPLETE",
          "swapExecutedAt": 1669907141201,
          "swapExecutedBlockIndex": "200-3",
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
      const expiryBlock = 200;
      const address = 'THE_INGRESS_ADDRESS';
      jest
        .spyOn(RpcClient.prototype, 'sendRequest')
        .mockResolvedValueOnce({ address, expiryBlock, issuedBlock });

      const { body, status } = await request(app)
        .post('/swaps')
        .send(requestBody);

      const swapDepositChannel = await prisma.swapDepositChannel.findFirst({
        where: { depositAddress: address },
      });

      expect(swapDepositChannel).toMatchObject({
        id: expect.any(BigInt),
        uuid: expect.any(String),
        depositAsset: requestBody.depositAsset,
        depositAddress: address,
        destinationAsset: requestBody.destinationAsset,
        destinationAddress: requestBody.destinationAddress,
        expiryBlock,
        issuedBlock,
        createdAt: expect.any(Date),
      });
      expect(swapDepositChannel?.expectedDepositAmount.toString()).toBe(
        requestBody.expectedDepositAmount,
      );
      expect(status).toBe(200);
      expect(body).toMatchObject({
        issuedBlock,
        depositAddress: address,
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
});

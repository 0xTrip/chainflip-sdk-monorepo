import BigNumber from 'bignumber.js';
import { Server } from 'http';
import request from 'supertest';
import app from '../../server';
import RpcClient from '../../utils/RpcClient';

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

  beforeEach(async () => {
    server = app.listen(0);
  });

  afterEach((cb) => {
    server.close(cb);
  });

  describe('GET /rates', () => {
    it.each([
      ['ETH', 'DOT'],
      ['DOT', 'ETH'],
      ['FLIP', 'ETH'],
    ])('gets the rates', async (ingressAsset, egressAsset) => {
      const sendSpy = jest
        .spyOn(RpcClient.prototype, 'sendRequest')
        .mockResolvedValueOnce(new BigNumber('1').times(10e18));
      const params = new URLSearchParams({
        ingressAsset,
        egressAsset,
        amount: '1',
      });
      const { body, status } = await request(server).get(
        `/rates?${params.toString()}`,
      );

      expect(status).toBe(200);
      expect(body).toMatchSnapshot();
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });
  });
});

import { once } from 'events';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Socket, io } from 'socket.io-client';
import request from 'supertest';
import { setTimeout as sleep } from 'timers/promises';
import app from '../server';

describe('server', () => {
  let server: Server;

  beforeEach(async () => {
    server = app.listen(0);
  });

  afterEach((cb) => {
    server.close(cb);
  });

  describe('GET /healthcheck', () => {
    it('gets the fees', async () => {
      expect((await request(app).get('/healthcheck')).text).toBe('OK');
    });
  });

  describe('socket.io', () => {
    let socket: Socket;

    beforeEach(() => {
      const { port } = server.address() as AddressInfo;

      socket = io(`http://127.0.0.1:${port}`, { autoConnect: false });
    });

    afterEach(() => {
      socket.disconnect();
    });

    it('can connect to the server', async () => {
      socket.connect();

      const connected = await Promise.race([
        sleep(100).then(() => false),
        once(socket, 'connect').then(() => true),
      ]);

      expect(connected).toBe(true);
    });
  });
});

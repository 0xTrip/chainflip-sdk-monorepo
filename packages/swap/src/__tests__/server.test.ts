import { Server } from 'http';
import request from 'supertest';
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
});

import { Server } from 'http';
import start from './processor';
import app from './server';
import { handleExit } from './utils/function';
import logger from './utils/logger';

start();
// eslint-disable-next-line func-names
app.listen(process.env.SWAPPING_APP_PORT ?? 8080, function (this: Server) {
  logger.info('server listening', { address: this.address() });

  handleExit(() => this.close());
});

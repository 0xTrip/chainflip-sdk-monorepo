import 'dotenv/config';
import { Server } from 'http';
import start from './processor';
import app from './server';
import { handleExit } from './utils/function';
import logger from './utils/logger';

start();
app.listen(
  Number.parseInt(process.env.SWAPPING_APP_PORT as string, 10) || 8080,
  '0.0.0.0',
  // eslint-disable-next-line func-names
  function (this: Server) {
    logger.info('server listening', { address: this.address() });

    handleExit(() => this.close());
  },
);

process.on('exit', (code) => {
  logger.info(`process exiting with code "${code}"`);
});

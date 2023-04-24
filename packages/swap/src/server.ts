import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fee from './routes/fee';
import rate from './routes/rate';
import swap from './routes/swap';
import logger from './utils/logger';

const app = express().use(cors());
const server = createServer(app);
const io = new Server(server);

app.use('/fees', fee);
app.use('/rates', rate);
app.use('/swaps', express.json(), swap);

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

io.on('connection', (socket) => {
  logger.info(`socket connected with id "${socket.id}"`);
});

export default server;

import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authenticate from './quoting/authenticate';
import fee from './routes/fee';
import rate from './routes/rate';
import swap from './routes/swap';
import thirdPartySwap from './routes/thirdPartySwap';

const app = express().use(cors());
const server = createServer(app);
const io = new Server(server).use(authenticate);

app.use('/fees', fee);
app.use('/swaps', express.json(), swap);
app.use('/third-party-swap', express.json(), thirdPartySwap);

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use('/quote', rate(io));

export default server;

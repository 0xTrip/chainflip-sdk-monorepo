import cors from 'cors';
import express from 'express';
import fee from './routes/fee';
import rate from './routes/rate';
import swap from './routes/swap';

const app = express().use(cors());

app.use('/fees', fee);
app.use('/rates', rate);
app.use('/swaps', express.json(), swap);

export default app;

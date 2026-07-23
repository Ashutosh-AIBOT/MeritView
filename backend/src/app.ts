import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestId } from './middleware/requestId.ts';
import { errorHandler } from './middleware/errors.ts';
import v1Router from './routes/v1/index.ts';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ['https://meritview.app', 'https://staging.meritview.app'],
    credentials: true,
    maxAge: 86400,
  }),
);
app.use(requestId);
app.use(express.json({ limit: '2mb' }));

app.use('/v1', v1Router);

app.use(errorHandler);

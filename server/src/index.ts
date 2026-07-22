import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errors';
import { requestId } from './middleware/requestId';
import authRoutes from './routes/auth';
import disputeRoutes from './routes/disputes';
import briefRoutes from './routes/briefs';
import paymentRoutes from './routes/payments';
import opinionRoutes from './routes/opinions';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(requestId);

app.use('/v1/auth', authRoutes);
app.use('/v1/disputes', disputeRoutes);
app.use('/v1/briefs', briefRoutes);
app.use('/v1/payments', paymentRoutes);
app.use('/v1/opinions', opinionRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/webhooks', webhookRoutes);

app.use('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;

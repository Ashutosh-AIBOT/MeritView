import { Worker } from 'bullmq';
import { redis } from '../../config/redis.ts';

export const emailWorker = new Worker(
  'email',
  async (job) => {
    console.log('sending email job', job.id);
  },
  { connection: redis as any },
);

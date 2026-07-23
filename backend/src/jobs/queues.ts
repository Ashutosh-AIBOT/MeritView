import { Queue } from 'bullmq';
import { redis } from '../../config/redis.ts';

export const evaluationQueue = new Queue('evaluation', { connection: redis as any });
export const emailQueue = new Queue('email', { connection: redis as any });

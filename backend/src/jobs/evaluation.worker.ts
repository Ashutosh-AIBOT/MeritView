import { Worker } from 'bullmq';
import { redis } from '../../config/redis.ts';
import { dispatchEvaluators } from '../../services/evaluation/index.ts';
import { sendEmail } from '../../services/email/index.ts';

export const evaluationWorker = new Worker(
  'evaluation',
  async (job) => {
    await dispatchEvaluators(job.data.disputeId, job.data.promptVersion);
    return { success: true };
  },
  { connection: redis as any },
);

export const emailWorker = new Worker(
  'email',
  async (_job) => {
    await sendEmail({ to: '', subject: '', html: '', text: '' });
    return { success: true };
  },
  { connection: redis as any },
);

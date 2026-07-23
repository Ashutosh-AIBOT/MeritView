import nodemailer from 'nodemailer';
import { prisma } from '../../db/prisma.js';
import { redis } from '../../config/redis.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: Number(process.env.SMTP_PORT ?? 1025),
});

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload) {
  const jobId = `email:${Date.now()}:${Math.random()}`;
  await redis.lPush('email:queue', JSON.stringify({ id: jobId, ...payload }));
  return { queued: true, jobId };
}

export async function processEmailQueue() {
  while (true) {
    const result = await redis.brPop('email:queue', 0);
    if (!result) break;

    try {
      const job = JSON.parse(result.element);
      await transporter.sendMail({
        from: process.env.FROM_EMAIL ?? 'noreply@meritview.app',
        to: job.to,
        subject: job.subject,
        text: job.text,
        html: job.html,
      });
    } catch (err) {
      console.error('Email send failed', err);
    }
  }
}

export async function runEmailWorker() {
  await processEmailQueue();
}

export async function enqueueOpinionReady(userId: string, email: string, disputeId: string) {
  const html = `
    <h1>Your dispute analysis is ready</h1>
    <p>View your opinion: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/disputes/${disputeId}/opinion</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/disputes/${disputeId}/opinion">View Opinion</a></p>
  `;
  const text = `Your dispute analysis is ready. View at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/disputes/${disputeId}/opinion`;

  await sendEmail({ to: email, subject: 'Your dispute analysis is ready', html, text });
}

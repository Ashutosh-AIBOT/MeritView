import Stripe from 'stripe';
import { prisma } from '../db/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function getOrCreatePaymentIntent(userId: string, disputeId: string) {
  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, initiator_user_id: userId },
    include: { parties: true },
  });
  if (!dispute) {
    const error = new Error('Dispute not found');
    (error as any).statusCode = 404;
    throw error;
  }
  if (dispute.state !== 'brief_submitted' && dispute.state !== 'payment_pending') {
    const error = new Error('Payment not allowed for this dispute state');
    (error as any).statusCode = 400;
    throw error;
  }

  const existing = await prisma.payment.findFirst({
    where: { dispute_id: disputeId, status: 'pending' },
    orderBy: { created_at: 'desc' },
  });

  if (existing?.processor_payment_id) {
    try {
      const intent = await stripe.paymentIntents.retrieve(existing.processor_payment_id);
      return { client_secret: intent.client_secret, payment_id: existing.id };
    } catch {
      // stale intent, create new
    }
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(dispute.price_usd) * 100),
    currency: 'USD',
    metadata: { dispute_id: disputeId, user_id: userId },
  });

  const payment = await prisma.payment.create({
    data: {
      dispute_id: disputeId,
      user_id: userId,
      amount_usd: dispute.price_usd,
      currency: 'USD',
      processor: 'stripe',
      processor_payment_id: intent.id,
      status: 'pending',
    },
  });

  // update dispute state
  await prisma.dispute.update({
    where: { id: disputeId },
    data: { state: 'payment_pending', state_changed_at: new Date() } as any,
  });

  return { client_secret: intent.client_secret, payment_id: payment.id };
}

export async function confirmPayment(userId: string, disputeId: string, body: any) {
  const payment = await prisma.payment.findFirst({
    where: { dispute_id: disputeId, user_id: userId },
    orderBy: { created_at: 'desc' },
  });
  if (!payment) {
    const error = new Error('Payment not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // confirm with stripe
  const intent = await stripe.paymentIntents.retrieve(payment.processor_payment_id);
  if (intent.status !== 'succeeded') {
    const error = new Error('Payment not completed');
    (error as any).statusCode = 400;
    throw error;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'succeeded', completed_at: new Date() },
  });

  // trigger evaluation
  // TODO: enqueue evaluation job

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { state: 'under_analysis', state_changed_at: new Date() } as any,
  });

  return { status: 'under_analysis' };
}

export async function requestRefund(userId: string, disputeId: string, body: any) {
  const payment = await prisma.payment.findFirst({
    where: { dispute_id: disputeId, user_id: userId },
  });
  if (!payment || payment.status !== 'succeeded') {
    const error = new Error('No successful payment found');
    (error as any).statusCode = 400;
    throw error;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'refunded', refunded_amount_usd: payment.amount_usd, refund_reason: body.reason, refunded_at: new Date() },
  });

  return { refunded: true };
}

export async function getPaymentHistory(userId: string) {
  return prisma.payment.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
}

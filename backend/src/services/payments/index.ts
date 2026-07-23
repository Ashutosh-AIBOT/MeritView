import { prisma } from '../../db/prisma.ts';
import { stripe } from '../../config/stripe.ts';
import { withRetry } from '../../utils/retry.ts';
import { redis } from '../../config/redis.ts';

export async function getPaymentIntent(disputeId: string, userId: string) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };
  if (dispute.state !== 'payment_pending') throw { status: 400, code: 'INVALID_STATE', message: 'Payment intent only for payment_pending disputes' };

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(dispute.priceUsd * 100),
    currency: 'usd',
    metadata: { disputeId, userId },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.payment.create({
    data: {
      disputeId,
      userId,
      amountUsd: dispute.priceUsd,
      currency: 'USD',
      processorPaymentId: paymentIntent.id,
      status: 'requires_payment',
      processor: 'stripe',
    },
  });

  return { clientSecret: paymentIntent.client_secret };
}

export async function confirmPayment(disputeId: string, paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') throw { status: 400, code: 'PAYMENT_FAILED', message: 'Payment not completed' };

  await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { disputeId, processorPaymentId: paymentIntentId },
      data: { status: 'succeeded', completedAt: new Date() },
    });

    await tx.dispute.update({
      where: { id: disputeId },
      data: { state: 'under_analysis' },
    });
  });

  return { success: true };
}

export async function requestRefund(disputeId: string, userId: string, reason?: string) {
  const payment = await prisma.payment.findFirst({
    where: { disputeId, userId, status: 'succeeded' },
    orderBy: { createdAt: 'desc' },
  });

  if (!payment) throw { status: 404, code: 'NO_SUCCESSFUL_PAYMENT' };
  if (payment.refundedAmountUsd >= payment.amountUsd) throw { status: 400, code: 'ALREADY_REFUNDED' };

  const refund = await stripe.refunds.create({
    payment_intent: payment.processorPaymentId,
    reason: 'requested_by_customer',
    metadata: { disputeId, reason: reason ?? '' },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { refundedAmountUsd: payment.amountUsd, refundReason: refund.reason, refundedAt: new Date(), status: 'refunded' },
  });

  return { refundId: refund.id, status: refund.status };
}

export async function getPaymentHistory(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return { payments };
}

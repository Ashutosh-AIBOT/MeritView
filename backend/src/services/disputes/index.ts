import { prisma } from '../../db/prisma.ts';
import type { DisputeCreateInput, DisputeUpdateInput } from '../types/index.ts';

export async function createDispute(userId: string, input: DisputeCreateInput) {
  const dispute = await prisma.dispute.create({
    data: {
      category: input.category,
      title: input.title,
      summary: input.summary,
      estimatedStakesUsd: input.estimated_stakes_usd,
      initiatorUserId: userId,
      state: 'draft',
      priceUsd: 49.00,
      pricingTier: 'standard',
    },
    include: {
      parties: true,
    },
  });

  await prisma.party.create({
    data: {
      disputeId: dispute.id,
      role: 'initiator',
      userId,
      briefStatus: 'not_started',
    },
  });

  return dispute;
}

export async function getDisputes(userId: string) {
  return prisma.dispute.findMany({
    where: { initiatorUserId: userId, deletedAt: null },
    include: { parties: true, briefs: true, opinion: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDispute(userId: string, disputeId: string) {
  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, initiatorUserId: userId, deletedAt: null },
    include: { parties: true, briefs: true, opinion: true, evaluatorOutputs: true, payments: true },
  });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };
  return dispute;
}

export async function updateDispute(userId: string, disputeId: string, input: DisputeUpdateInput) {
  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, initiatorUserId: userId, state: 'draft', deletedAt: null },
  });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };

  if (dispute.state !== 'draft') {
    throw { status: 409, code: 'INVALID_STATE_TRANSITION', message: 'Cannot modify dispute after brief is submitted' };
  }

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      title: input.title,
      summary: input.summary,
      estimatedStakesUsd: input.estimated_stakes_usd,
    },
    include: { parties: true },
  });
}

export async function withdrawDispute(userId: string, disputeId: string) {
  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, initiatorUserId: userId, deletedAt: null },
    include: { payments: true },
  });

  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };

  const allowedStates = ['draft', 'brief_submitted', 'payment_pending'];
  if (!allowedStates.includes(dispute.state)) {
    throw { status: 409, code: 'INVALID_STATE_TRANSITION', message: `Cannot withdraw from state: ${dispute.state}` };
  }

  const hasAnalysis = dispute.state === 'under_analysis' || dispute.state === 'awaiting_aggregation' || dispute.state === 'completed';

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: disputeId },
      data: { state: 'withdrawn', deletedAt: new Date() },
    });

    if (!hasAnalysis) {
      const successfulPayment = dispute.payments.find(p => p.status === 'succeeded');
      if (successfulPayment) {
        await tx.payment.create({
          data: {
            disputeId,
            userId,
            amountUsd: -successfulPayment.amountUsd,
            currency: 'USD',
            processor: 'stripe',
            processorPaymentId: `refund_${Date.now()}`,
            status: 'refunded',
            refundedAmountUsd: successfulPayment.amountUsd,
            refundReason: 'Account withdrawal',
          },
        });
      }
    }
  });

  return { success: true };
}

import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { Dispute, DisputeState } from '@meritview/shared/src/types';

export async function createDispute(userId: string, data: Partial<Dispute>) {
  return prisma.dispute.create({
    data: {
      ...data,
      initiator_user_id: userId,
      state: 'draft',
      state_changed_at: new Date(),
    } as any,
  });
}

export async function listDisputes(userId: string) {
  return prisma.dispute.findMany({
    where: { initiator_user_id: userId, deleted_at: null },
    orderBy: { created_at: 'desc' },
  });
}

export async function getDispute(userId: string, id: string) {
  const dispute = await prisma.dispute.findFirst({
    where: { id, initiator_user_id: userId, deleted_at: null },
  });
  return dispute;
}

export async function updateDispute(userId: string, id: string, data: Partial<Dispute>) {
  const dispute = await prisma.dispute.findFirst({
    where: { id, initiator_user_id: userId, deleted_at: null },
  });
  if (!dispute) {
    const error = new Error('Dispute not found');
    (error as any).statusCode = 404;
    throw error;
  }

  if (dispute.state !== 'draft') {
    const error = new Error('Cannot modify dispute after brief is submitted');
    (error as any).statusCode = 409;
    throw error;
  }

  return prisma.dispute.update({
    where: { id },
    data: { ...data, updated_at: new Date() } as any,
  });
}

export async function withdrawDispute(userId: string, id: string) {
  const dispute = await getDispute(userId, id);
  if (!dispute) {
    const error = new Error('Dispute not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const allowedStates: DisputeState[] = ['draft'];
  if (!allowedStates.includes(dispute.state as DisputeState)) {
    const error = new Error(`Cannot withdraw dispute in ${dispute.state} state`);
    (error as any).statusCode = 409;
    throw error;
  }

  const updated = await prisma.dispute.update({
    where: { id },
    data: { state: 'withdrawn', state_changed_at: new Date(), deleted_at: new Date() },
  });

  // TODO: refund if applicable
  return { dispute: updated };
}

export function canTransition(current: DisputeState, next: DisputeState): boolean {
  const allowed: Record<DisputeState, DisputeState[]> = {
    draft: ['brief_submitted', 'withdrawn'],
    brief_submitted: ['payment_pending', 'draft'],
    payment_pending: ['under_analysis', 'draft', 'failed'],
    under_analysis: ['awaiting_aggregation', 'failed'],
    awaiting_aggregation: ['completed', 'failed'],
    completed: [],
    failed: [],
    withdrawn: [],
  };

  return allowed[current]?.includes(next) ?? false;
}

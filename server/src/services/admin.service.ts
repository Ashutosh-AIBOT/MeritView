import { prisma } from '../db/prisma';

export async function listAdminDisputes(filters: any) {
  return prisma.dispute.findMany({
    where: { deleted_at: null, ...filters },
    orderBy: { created_at: 'desc' },
  });
}

export async function getDisputeDetail(id: string) {
  return prisma.dispute.findFirst({ where: { id, deleted_at: null } });
}

export async function listPendingAggregations() {
  return prisma.dispute.findMany({
    where: { state: 'awaiting_aggregation', deleted_at: null },
  });
}

export async function publishOpinion(adminId: string, disputeId: string, opinionData: any) {
  // delegate to aggregation.service
  return { published: true };
}

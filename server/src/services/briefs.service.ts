import { prisma } from '../db/prisma';

export async function saveDraft(userId: string, disputeId: string, partyId: string, content: Record<string, any>) {
  // verify ownership
  const party = await prisma.party.findFirst({
    where: { id: partyId, dispute: { id: disputeId, initiator_user_id: userId } },
  });
  if (!party) {
    const error = new Error('Party not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // simple text fields
  const sections = content as Record<string, string>;
  const wordCount = Object.values(sections).reduce((acc, val) => {
    if (typeof val === 'string') return acc + val.split(/\s+/).length;
    return acc;
  }, 0);

  const existing = await prisma.brief.findUnique({ where: { party_id: partyId } });
  if (existing) {
    return prisma.brief.update({
      where: { party_id: partyId },
      data: { encrypted_content: Buffer.from(JSON.stringify(content)), word_count: wordCount, updated_at: new Date() } as any,
    });
  }
  return prisma.brief.create({
    data: {
      party_id: partyId,
      dispute_id: disputeId,
      encrypted_content: Buffer.from(JSON.stringify(content)),
      word_count: wordCount,
      status: 'draft',
    } as any,
  });
}

export async function submitBrief(userId: string, disputeId: string, partyId: string, content: Record<string, string>) {
  const party = await prisma.party.findFirst({
    where: { id: partyId, dispute: { id: disputeId, initiator_user_id: userId } },
  });
  if (!party) {
    const error = new Error('Party not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const wordCount = Object.values(content).reduce((acc, val) => acc + val.split(/\s+/).length, 0);
  if (wordCount > 5000) {
    const error = new Error('Brief exceeds 5000 words');
    (error as any).statusCode = 400;
    throw error;
  }

  const brief = await prisma.brief.upsert({
    where: { party_id: partyId },
    update: {
      encrypted_content: Buffer.from(JSON.stringify(content)),
      word_count: wordCount,
      status: 'submitted',
      submitted_at: new Date(),
    } as any,
    create: {
      party_id: partyId,
      dispute_id: disputeId,
      encrypted_content: Buffer.from(JSON.stringify(content)),
      word_count: wordCount,
      status: 'submitted',
      submitted_at: new Date(),
    } as any,
  });

  // update parent dispute state
  await prisma.dispute.update({
    where: { id: disputeId },
    data: { state: 'brief_submitted', state_changed_at: new Date() } as any,
  });

  await prisma.party.update({
    where: { id: partyId },
    data: { brief_status: 'submitted' },
  });

  return brief;
}

export async function getBrief(userId: string, disputeId: string, partyId: string) {
  const party = await prisma.party.findFirst({
    where: { id: partyId, dispute: { id: disputeId, initiator_user_id: userId } },
  });
  if (!party) {
    const error = new Error('Party not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const brief = await prisma.brief.findUnique({ where: { party_id: partyId } });
  return brief;
}

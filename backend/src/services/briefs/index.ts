import { prisma } from '../../db/prisma.ts';
import crypto from 'node:crypto';
import { env } from '../../config/env.ts';

function encrypt(text: string): { encrypted: Buffer; key: string } {
  const key = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { encrypted: Buffer.concat([iv, tag, encrypted]), key };
}

function decrypt(encrypted: Buffer, key: string): string {
  const iv = encrypted.subarray(0, 16);
  const tag = encrypted.subarray(16, 32);
  const data = encrypted.subarray(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}

export async function saveDraft(disputeId: string, partyId: string, userId: string, sections: Record<string, string>) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };
  if (dispute.state !== 'draft' && dispute.state !== 'brief_submitted') {
    throw { status: 409, code: 'INVALID_STATE', message: 'Cannot save draft in current dispute state' };
  }

  const party = await prisma.party.findFirst({ where: { id: partyId, disputeId } });
  if (!party) throw { status: 404, code: 'NOT_FOUND' };

  const content = JSON.stringify(sections);
  const wordCount = Object.values(sections).join(' ').split(/\s+/).filter(Boolean).length;
  const { encrypted, key } = encrypt(content);

  if (party.brief?.status === 'submitted' || party.brief?.status === 'sealed') {
    throw { status: 403, code: 'IMMUTABLE', message: 'Brief already submitted' };
  }

  const brief = await prisma.brief.upsert({
    where: { partyId },
    create: {
      partyId,
      disputeId,
      encryptedContent: encrypted,
      contentEncryptionKeyId: key,
      wordCount,
      status: 'draft',
    },
    update: {
      encryptedContent: encrypted,
      contentEncryptionKeyId: key,
      wordCount,
    },
  });

  await prisma.party.update({ where: { id: partyId }, data: { briefStatus: 'in_progress' } });

  return { brief: { id: brief.id, status: brief.status, wordCount: brief.wordCount } };
}

export async function submitBrief(disputeId: string, partyId: string, userId: string, sections: Record<string, string>) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };
  if (dispute.state !== 'draft' && dispute.state !== 'brief_submitted') {
    throw { status: 409, code: 'INVALID_STATE', message: 'Cannot submit brief in current dispute state' };
  }

  const party = await prisma.party.findFirst({ where: { id: partyId, disputeId } });
  if (!party) throw { status: 404, code: 'NOT_FOUND' };

  for (const key of ['factual_background', 'my_position', 'supporting_arguments', 'acknowledgment_of_opposing', 'desired_resolution']) {
    if (!sections[key] || sections[key].trim().length === 0) {
      throw { status: 400, code: 'EMPTY_SECTION', message: `Section ${key} is required` };
    }
  }

  const content = JSON.stringify(sections);
  const wordCount = Object.values(sections).join(' ').split(/\s+/).filter(Boolean).length;
  if (wordCount > 5000) throw { status: 400, code: 'WORD_LIMIT_EXCEEDED', message: 'Brief exceeds 5000 word limit' };

  const { encrypted, key } = encrypt(content);

  const brief = await prisma.brief.upsert({
    where: { partyId },
    create: {
      partyId,
      disputeId,
      encryptedContent: encrypted,
      contentEncryptionKeyId: key,
      wordCount,
      status: 'submitted',
      submittedAt: new Date(),
    },
    update: {
      encryptedContent: encrypted,
      contentEncryptionKeyId: key,
      wordCount,
      status: 'submitted',
      submittedAt: new Date(),
    },
  });

  await prisma.dispute.update({ where: { id: disputeId }, data: { state: 'brief_submitted' } });
  await prisma.party.update({ where: { id: partyId }, data: { briefStatus: 'submitted' } });

  return { brief: { id: brief.id, status: brief.status, wordCount: brief.wordCount, submittedAt: brief.submittedAt } };
}

export async function getBrief(disputeId: string, partyId: string, userId: string) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };

  const party = await prisma.party.findFirst({ where: { id: partyId, disputeId } });
  if (!party || !party.brief) throw { status: 404, code: 'NOT_FOUND' };

  const content = decrypt(party.brief.encryptedContent, party.brief.contentEncryptionKeyId);
  const sections = JSON.parse(content);

  return { brief: { id: party.brief.id, status: party.brief.status, wordCount: party.brief.wordCount, sections } };
}

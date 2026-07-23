import { prisma } from '../../db/prisma.ts';
import { s3 } from '../../config/s3.ts';
import { env } from '../../config/env.ts';
import crypto from 'node:crypto';

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

const S3_BUCKET = env.S3_BUCKET ?? 'meritview-dev';

export async function getOpinion(disputeId: string, userId: string) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute || dispute.state !== 'completed') throw { status: 404, code: 'OPINION_NOT_READY' };

  const opinion = await prisma.opinion.findUnique({ where: { disputeId } });
  if (!opinion) throw { status: 404, code: 'OPINION_NOT_FOUND' };

  const content = decrypt(opinion.encryptedContent, opinion.contentEncryptionKeyId);
  return { opinion: { ...opinion, content } };
}

export async function getOpinionStatus(disputeId: string, userId: string) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };

  const outputs = await prisma.evaluatorOutput.findMany({ where: { disputeId } });
  const opinion = await prisma.opinion.findUnique({ where: { disputeId } });

  return {
    status: dispute.state,
    outputsCount: outputs.length,
    opinionPublished: !!opinion,
  };
}

export async function getOpinionPdfUrl(disputeId: string, userId: string) {
  const dispute = await prisma.dispute.findFirst({ where: { id: disputeId, initiatorUserId: userId } });
  if (!dispute || dispute.state !== 'completed') throw { status: 404, code: 'OPINION_NOT_READY' };

  const opinion = await prisma.opinion.findUnique({ where: { disputeId } });
  if (!opinion?.pdfStorageKey) throw { status: 404, code: 'PDF_NOT_READY' };

  const command = new (await import('@aws-sdk/client-s3')).GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: opinion.pdfStorageKey,
  });

  const url = (await import('@aws-sdk/s3-request-presigner')).getSignedUrl(s3 as any, command, { expiresIn: 3600 });
  return { url };
}

export async function publishOpinion(disputeId: string, aggregatorProvider: string, aggregatorModelId: string, content: Record<string, unknown>, evaluatorOutputIds: string[], totalCostUsd: number) {
  if (evaluatorOutputIds.length < 3) throw { status: 400, code: 'INSUFFICIENT_OUTPUTS', message: 'At least 3 evaluator outputs required' };

  const { encrypted, key } = encrypt(JSON.stringify(content));
  const opinion = await prisma.opinion.create({
    data: {
      disputeId,
      encryptedContent: encrypted,
      contentEncryptionKeyId: key,
      evalPromptVersion: 'eval-v3.2',
      aggPromptVersion: 'agg-v2.1',
      evaluatorOutputIds,
      interEvaluatorAgreement: content.inter_evaluator_agreement as number | undefined,
      overallConfidence: content.overall_confidence as number | undefined,
      aggregatorProvider,
      aggregatorModelId,
      totalCostUsd,
      deliveredAt: new Date(),
    },
  });

  await prisma.dispute.update({ where: { id: disputeId }, data: { state: 'completed', completedAt: new Date() } });

  return opinion;
}

export async function getPendingAggregations() {
  const disputes = await prisma.dispute.findMany({
    where: { state: 'awaiting_aggregation' },
    include: { evaluatorOutputs: true, briefs: { include: { party: true } } },
  });

  const aggregations = await Promise.all(
    disputes.map(async (d) => {
      const brief = d.briefs[0];
      let content: Record<string, unknown> | null = null;
      if (brief) {
        try { content = JSON.parse(decrypt(brief.encryptedContent, brief.contentEncryptionKeyId)); } catch { /* ignore */ }
      }
      return { dispute: d, outputs: d.evaluatorOutputs, briefContent: content };
    }),
  );

  return aggregations;
}

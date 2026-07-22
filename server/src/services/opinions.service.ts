import { prisma } from '../db/prisma';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const ses = new SESClient({ region: process.env.AWS_REGION });

export async function createOpinionFromAggregation(disputeId: string) {
  // placeholder
  return { opinion: { id: 'todo' } };
}

export async function getOpinion(userId: string, disputeId: string) {
  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, initiator_user_id: userId },
  });
  if (!dispute || dispute.state !== 'completed') {
    const error = new Error('Opinion not found');
    (error as any).statusCode = 404;
    throw error;
  }

  const opinion = await prisma.opinion.findUnique({ where: { dispute_id: disputeId } });
  return opinion;
}

export async function getOpinionPdf(userId: string, disputeId: string) {
  const opinion = await getOpinion(userId, disputeId);
  if (!opinion || !opinion.pdf_storage_key) {
    return null;
  }

  const result = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: opinion.pdf_storage_key,
    })
  );

  const chunks: Buffer[] = [];
  for await (const chunk of result.Body as any) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function getOpinionStatus(userId: string, disputeId: string) {
  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, initiator_user_id: userId },
  });
  return { state: dispute?.state || 'unknown' };
}

export async function deliverOpinion(disputeId: string, opinionId: string) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) return;

  // send email
  await ses.send(
    new SendEmailCommand({
      Source: process.env.FROM_EMAIL,
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Data: 'Your dispute analysis is ready' },
        Body: { Text: { Data: 'Your opinion is ready.' } },
      },
    })
  );
}

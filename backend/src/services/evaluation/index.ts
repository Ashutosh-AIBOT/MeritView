import { prisma } from '../../db/prisma.ts';
import { getProviders } from '../../providers/registry.ts';
import { EVAL_PROMPT_V3_2 } from '../../prompts/eval-v3.2.ts';
import { withRetry } from '../../utils/retry.ts';
import crypto from 'node:crypto';

export async function createEvaluationJob(disputeId: string) {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };

  const brief = await prisma.brief.findFirst({ where: { disputeId } });
  if (!brief) throw { status: 400, code: 'NO_BRIEF' };

  const providers = getProviders();
  if (providers.length === 0) throw { status: 500, code: 'NO_PROVIDERS_CONFIGURED' };

  return { disputeId, providers: providers.map(p => ({ provider: p.providerId, model: p.modelId })) };
}

export async function dispatchEvaluators(disputeId: string, promptVersion: string = 'eval-v3.2') {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw { status: 404, code: 'NOT_FOUND' };

  const brief = await prisma.brief.findFirst({ where: { disputeId } });
  if (!brief) throw { status: 400, code: 'NO_BRIEF' };

  const providers = getProviders();
  if (providers.length === 0) throw { status: 500, code: 'NO_PROVIDERS_CONFIGURED' };

  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const start = Date.now();
          const result = await withRetry(async () => {
            const prompt = EVAL_PROMPT_V3_2.replace('{brief_content}', decodeContent(brief));
            return await provider.generateCompletion({ system: 'You are an impartial analyst.', user: prompt });
          }, 2, 1000);

          const durationMs = Date.now() - start;

          await prisma.evaluatorOutput.create({
            data: {
              disputeId,
              llmProvider: provider.providerId,
              modelId: provider.modelId,
              promptVersion,
              structuredOutput: result,
              rawOutput: result.text,
              parseSuccess: true,
              parseErrors: null,
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              costUsd: result.costUsd,
              durationMs,
              attemptNumber: attempt,
            },
          });

          return { provider: provider.providerId, success: true };
        } catch (err) {
          if (attempt === 3) {
            await prisma.evaluatorOutput.create({
              data: {
                disputeId,
                llmProvider: provider.providerId,
                modelId: provider.modelId,
                promptVersion,
                structuredOutput: null,
                rawOutput: null,
                parseSuccess: false,
                parseErrors: { error: String(err) },
                inputTokens: 0,
                outputTokens: 0,
                costUsd: 0,
                durationMs: 0,
                attemptNumber: attempt,
              },
            });
            throw err;
          }
        }
      }
    }),
  );

  const successCount = results.filter(r => r.status === 'fulfilled').length;

  if (successCount >= 3) {
    await prisma.dispute.update({ where: { id: disputeId }, data: { state: 'awaiting_aggregation' } });
    return { success: true, outputsCount: successCount };
  } else {
    await prisma.dispute.update({ where: { id: disputeId }, data: { state: 'failed' } });
    return { success: false, outputsCount: successCount };
  }
}

function decodeContent(brief: { encryptedContent: Buffer; contentEncryptionKeyId: string }): string {
  const iv = brief.encryptedContent.subarray(0, 16);
  const tag = brief.encryptedContent.subarray(16, 32);
  const data = brief.encryptedContent.subarray(32);
  const key = Buffer.from(brief.contentEncryptionKeyId, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}

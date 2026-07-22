import { prisma } from '../db/prisma';
import { LLMProvider } from '@meritview/llm-abstraction';
import { GroqProvider } from '../providers/groq.provider';
import { GeminiProvider } from '../providers/gemini.provider';

const groq = new GroqProvider('llama-3-70b-8192');
const gemini = new GeminiProvider('gemini-1.5-pro');

export async function createEvaluationJob(disputeId: string, promptVersion: string) {
  const job = await prisma.evaluationJob.create({
    data: { dispute_id: disputeId, state: 'pending', prompt_version: promptVersion } as any,
  });
  return job;
}

export async function runEvaluation(jobId: string) {
  const job = await prisma.evaluationJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('Evaluation job not found');

  await prisma.evaluationJob.update({ where: { id: jobId }, data: { state: 'running' } });

  const providers: LLMProvider[] = [groq, gemini];
  let successCount = 0;

  for (const provider of providers) {
    try {
      const output = await provider.generateCompletion({ text: 'sample' });
      await prisma.evaluatorOutput.create({
        data: {
          dispute_id: job.dispute_id,
          llm_provider: provider.providerId,
          model_id: provider.modelId,
          prompt_version: job.prompt_version,
          structured_output: output as any,
          raw_output: JSON.stringify(output),
          parse_success: true,
          input_tokens: 100,
          output_tokens: 50,
          cost_usd: 0.05,
          duration_ms: 1000,
          attempt_number: 1,
        } as any,
      });
      successCount++;
    } catch (error) {
      console.error(`Evaluator ${provider.providerId} failed:`, error);
    }
  }

  const allSucceeded = successCount === providers.length;
  const jobState = allSucceeded ? 'awaiting_aggregation' : 'failed';
  await prisma.evaluationJob.update({ where: { id: jobId }, data: { state: jobState } });

  if (!allSucceeded) {
    await prisma.dispute.update({
      where: { id: job.dispute_id },
      data: { state: 'failed', state_changed_at: new Date() } as any,
    });
  }

  return job;
}

export async function getEvaluationStatus(disputeId: string) {
  const job = await prisma.evaluationJob.findFirst({
    where: { dispute_id: disputeId },
    orderBy: { created_at: 'desc' },
  });
  const outputs = await prisma.evaluatorOutput.findMany({ where: { dispute_id: disputeId } });
  return { ...job, evaluatorOutputs: outputs };
}

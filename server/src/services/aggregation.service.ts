import { prisma } from '../db/prisma';
import { GeminiProvider } from '../providers/gemini.provider';

const aggregator = new GeminiProvider('gemini-1.5-pro');

export async function aggregateEvaluations(userId: string, disputeId: string, opinionData: any) {
  const job = await prisma.evaluationJob.findFirst({
    where: { dispute_id: disputeId, state: 'awaiting_aggregation' },
  });
  const outputs = await prisma.evaluatorOutput.findMany({ where: { dispute_id: disputeId } });
  if (!job || outputs.length < 3) {
    const error = new Error('Not enough evaluator outputs for aggregation');
    (error as any).statusCode = 400;
    throw error;
  }

  const opinion = await prisma.opinion.create({
    data: {
      dispute_id: disputeId,
      encrypted_content: Buffer.from(JSON.stringify(opinionData)),
      content_encryption_key_id: 'local-dev',
      eval_prompt_version: job.prompt_version,
      agg_prompt_version: 'agg-v2.1',
      evaluator_output_ids: outputs.map((o: any) => o.id),
      inter_evaluator_agreement: 0.85,
      overall_confidence: 0.9,
      aggregator_provider: aggregator.providerId,
      aggregator_model_id: aggregator.modelId,
      total_cost_usd: 0.25,
    } as any,
  });

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { state: 'completed', completed_at: new Date(), state_changed_at: new Date() } as any,
  });

  return opinion;
}

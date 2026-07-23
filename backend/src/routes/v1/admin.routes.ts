import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { requireAdmin } from '../middleware/auth.ts';
import { publishOpinion, getPendingAggregations } from '../../services/opinions/index.ts';

const router = Router();

router.get('/disputes', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const state = req.query.state as string;

    const where: any = {};
    if (state) where.state = state;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: { initiator: true, parties: { include: { brief: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dispute.count({ where }),
    ]);

    res.json({ disputes, pagination: { page, limit, total } });
  } catch (e) {
    next(e);
  }
});

router.get('/disputes/:id', requireAdmin, async (req, res, next) => {
  try {
    const dispute = await prisma.dispute.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        initiator: true,
        parties: { include: { brief: true } },
        evaluatorOutputs: true,
        opinion: true,
        payments: true,
      },
    });
    if (!dispute) throw { status: 404, code: 'NOT_FOUND' };
    res.json({ dispute });
  } catch (e) {
    next(e);
  }
});

router.get('/evaluations/pending', requireAdmin, async (req, res, next) => {
  try {
    const result = await getPendingAggregations();
    res.json({ aggregations: result });
  } catch (e) {
    next(e);
  }
});

const aggregateSchema = z.object({
  content: z.record(z.any()),
  evaluator_output_ids: z.array(z.string().minLength(1)).min(3),
  aggregator_provider: z.string(),
  aggregator_model_id: z.string(),
  total_cost_usd: z.number(),
  inter_evaluator_agreement: z.number().min(0).max(1).optional(),
  overall_confidence: z.number().min(0).max(1).optional(),
});

router.post('/disputes/:id/aggregate', requireAdmin, async (req, res, next) => {
  try {
    const validated = aggregateSchema.parse(req.body);
    const result = await publishOpinion(req.params.id, validated.aggregator_provider, validated.aggregator_model_id, validated.content, validated.evaluator_output_ids, validated.total_cost_usd);
    res.json(result);
  } catch (e: any) {
    if (e.status) return next(e);
    next(e);
  }
});

export default router;

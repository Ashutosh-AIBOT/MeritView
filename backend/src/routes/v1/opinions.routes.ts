import { Router } from 'express';
import { z } from 'zod';
import { getOpinion, getOpinionStatus, getOpinionPdfUrl, publishOpinion, getPendingAggregations } from '../../services/opinions/index.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';

const router = Router();

router.get('/:dispute_id/opinion', requireAuth, async (req, res, next) => {
  try {
    const result = await getOpinion(req.params.dispute_id, (req as any).user.sub);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:dispute_id/opinion/status', requireAuth, async (req, res, next) => {
  try {
    const result = await getOpinionStatus(req.params.dispute_id, (req as any).user.sub);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:dispute_id/opinion/pdf', requireAuth, async (req, res, next) => {
  try {
    const { url } = await getOpinionPdfUrl(req.params.dispute_id, (req as any).user.sub);
    res.redirect(url);
  } catch (e) {
    next(e);
  }
});

const publishSchema = z.object({
  content: z.record(z.any()),
  evaluator_output_ids: z.array(z.string().minLength(1)).min(3),
  aggregator_provider: z.string(),
  aggregator_model_id: z.string(),
  total_cost_usd: z.number(),
  inter_evaluator_agreement: z.number().min(0).max(1).optional(),
  overall_confidence: z.number().min(0).max(1).optional(),
});

router.post('/:dispute_id/publish', requireAdmin, async (req, res, next) => {
  try {
    const result = await publishOpinion(req.params.dispute_id, req.body.aggregator_provider, req.body.aggregator_model_id, req.body.content, req.body.evaluator_output_ids, req.body.total_cost_usd);
    res.json(result);
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

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { saveDraft, submitBrief, getBrief } from '../../services/briefs/index.ts';
import { requireAuth } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

const sectionsSchema = z.object({
  factual_background: z.string().min(1),
  my_position: z.string().min(1),
  supporting_arguments: z.string().min(1),
  acknowledgment_of_opposing: z.string().min(1),
  desired_resolution: z.string().min(1),
});

router.put('/:dispute_id/parties/:party_id/brief/draft', requireAuth, validate(z.object({ sections: sectionsSchema.partial() })), async (req, res, next) => {
  try {
    const result = await saveDraft(req.params.dispute_id, req.params.party_id, (req as any).user.sub, req.body.sections);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:dispute_id/parties/:party_id/brief/submit', requireAuth, validate(z.object({ sections: sectionsSchema })), async (req, res, next) => {
  try {
    const result = await submitBrief(req.params.dispute_id, req.params.party_id, (req as any).user.sub, req.body.sections);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:dispute_id/parties/:party_id/brief', requireAuth, async (req, res, next) => {
  try {
    const result = await getBrief(req.params.dispute_id, req.params.party_id, (req as any).user.sub);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;

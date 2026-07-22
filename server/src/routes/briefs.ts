import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { briefSubmitSchema } from '@meritview/shared/src/schemas';
import * as briefService from '../services/briefs.service';

const router = Router();

router.use(authenticate);

router.put('/:dispute_id/parties/:party_id/brief/draft', async (req: AuthRequest, res: any, next: any) => {
  try {
    const brief = await briefService.saveDraft(req.user!.id, req.params.dispute_id, req.params.party_id, req.body);
    res.json({ brief });
  } catch (error) {
    next(error);
  }
});

router.post('/:dispute_id/parties/:party_id/brief/submit', validate(briefSubmitSchema), async (req: any, res: any, next: any) => {
  try {
    const brief = await briefService.submitBrief(req.user!.id, req.params.dispute_id, req.params.party_id, req.validated);
    res.json({ brief });
  } catch (error) {
    next(error);
  }
});

router.get('/:dispute_id/parties/:party_id/brief', async (req: AuthRequest, res: any, next: any) => {
  try {
    const brief = await briefService.getBrief(req.user!.id, req.params.dispute_id, req.params.party_id);
    if (!brief) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Brief not found' } });
    res.json({ brief });
  } catch (error) {
    next(error);
  }
});

export default router;

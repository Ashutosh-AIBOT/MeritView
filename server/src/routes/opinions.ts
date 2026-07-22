import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as opinionService from '../services/opinions.service';

const router = Router();

router.use(authenticate);

router.get('/:dispute_id/opinion', async (req: AuthRequest, res: any, next: any) => {
  try {
    const opinion = await opinionService.getOpinion(req.user!.id, req.params.dispute_id);
    if (!opinion) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Opinion not found' } });
    res.json({ opinion });
  } catch (error) {
    next(error);
  }
});

router.get('/:dispute_id/opinion/pdf', async (req: AuthRequest, res: any, next: any) => {
  try {
    const pdf = await opinionService.getOpinionPdf(req.user!.id, req.params.dispute_id);
    if (!pdf) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'PDF not found' } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="opinion-${req.params.dispute_id}.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

router.get('/:dispute_id/opinion/status', async (req: AuthRequest, res: any, next: any) => {
  try {
    const status = await opinionService.getOpinionStatus(req.user!.id, req.params.dispute_id);
    res.json({ status });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as disputeService from '../services/disputes.service';

const router = Router();

router.use(authenticate);

router.post('/', async (req: any, res: any, next: any) => {
  try {
    const created = await disputeService.createDispute(req.user!.id, req.body);
    res.status(201).json({ dispute: created });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    const disputes = await disputeService.listDisputes(req.user!.id);
    res.json({ disputes });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const dispute = await disputeService.getDispute(req.user!.id, req.params.id);
    if (!dispute) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Dispute not found' } });
    res.json({ dispute });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const updated = await disputeService.updateDispute(req.user!.id, req.params.id, req.body);
    res.json({ dispute: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/withdraw', async (req: AuthRequest, res: any, next: any) => {
  try {
    const result = await disputeService.withdrawDispute(req.user!.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

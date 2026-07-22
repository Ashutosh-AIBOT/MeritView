import { Router } from 'express';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import * as adminService from '../services/admin.service';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/disputes', async (req: AuthRequest, res: any, next: any) => {
  try {
    const disputes = await adminService.listAdminDisputes(req.query);
    res.json({ disputes });
  } catch (error) {
    next(error);
  }
});

router.get('/disputes/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const dispute = await adminService.getDisputeDetail(req.params.id);
    if (!dispute) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Dispute not found' } });
    res.json({ dispute });
  } catch (error) {
    next(error);
  }
});

router.get('/evaluations/pending', async (req: AuthRequest, res: any, next: any) => {
  try {
    const pending = await adminService.listPendingAggregations();
    res.json({ pending });
  } catch (error) {
    next(error);
  }
});

router.post('/disputes/:id/aggregate', async (req: AuthRequest, res: any, next: any) => {
  try {
    const opinion = await adminService.publishOpinion(req.user!.id, req.params.id, req.body);
    res.json({ opinion });
  } catch (error) {
    next(error);
  }
});

export default router;

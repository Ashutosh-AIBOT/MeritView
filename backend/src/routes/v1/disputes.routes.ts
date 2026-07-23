import { Router } from 'express';
import { z } from 'zod';
import { createDispute, getDisputes, getDispute, updateDispute, withdrawDispute } from '../../services/disputes/index.ts';
import { requireAuth } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

const createSchema = z.object({
  category: z.literal('contract_interpretation'),
  title: z.string().min(5).max(200),
  summary: z.string().max(500).optional(),
  estimated_stakes_usd: z.number().positive().optional(),
});

router.post('/', requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const dispute = await createDispute((req as any).user.sub, req.body);
    res.status(201).json({ dispute });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const disputes = await getDisputes((req as any).user.sub);
    res.json({ disputes });
  } catch (e) {
    next(e);
  }
});

router.get('/:dispute_id', requireAuth, async (req, res, next) => {
  try {
    const dispute = await getDispute((req as any).user.sub, req.params.dispute_id);
    res.json({ dispute });
  } catch (e) {
    next(e);
  }
});

const updateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  summary: z.string().max(500).optional(),
  estimated_stakes_usd: z.number().positive().optional(),
});

router.patch('/:dispute_id', requireAuth, validate(updateSchema), async (req, res, next) => {
  try {
    const dispute = await updateDispute((req as any).user.sub, req.params.dispute_id, req.body);
    res.json({ dispute });
  } catch (e) {
    next(e);
  }
});

router.post('/:dispute_id/withdraw', requireAuth, async (req, res, next) => {
  try {
    await withdrawDispute((req as any).user.sub, req.params.dispute_id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { getPaymentIntent, confirmPayment, requestRefund, getPaymentHistory } from '../../services/payments/index.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/:dispute_id/payment-intent', requireAuth, async (req, res, next) => {
  try {
    const result = await getPaymentIntent(req.params.dispute_id, (req as any).user.sub);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:dispute_id/payment/confirm', requireAuth, async (req, res, next) => {
  try {
    const { payment_intent_id } = req.body;
    if (!payment_intent_id) throw { status: 400, code: 'MISSING_PAYMENT_INTENT_ID' };
    const result = await confirmPayment(req.params.dispute_id, payment_intent_id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:dispute_id/refund-request', requireAuth, async (req, res, next) => {
  try {
    const result = await requestRefund(req.params.dispute_id, (req as any).user.sub, req.body.reason);
    res.status(202).json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/users/me/payments', requireAuth, async (req, res, next) => {
  try {
    const result = await getPaymentHistory((req as any).user.sub);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;

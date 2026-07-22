import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as paymentService from '../services/payments.service';

const router = Router();

router.use(authenticate);

router.get('/:dispute_id/payment-intent', async (req: AuthRequest, res: any, next: any) => {
  try {
    const intent = await paymentService.getOrCreatePaymentIntent(req.user!.id, req.params.dispute_id);
    res.json({ intent });
  } catch (error) {
    next(error);
  }
});

router.post('/:dispute_id/payment/confirm', async (req: AuthRequest, res: any, next: any) => {
  try {
    const result = await paymentService.confirmPayment(req.user!.id, req.params.dispute_id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:dispute_id/refund-request', async (req: AuthRequest, res: any, next: any) => {
  try {
    const refund = await paymentService.requestRefund(req.user!.id, req.params.dispute_id, req.body);
    res.status(202).json({ refund });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: AuthRequest, res: any, next: any) => {
  try {
    const payments = await paymentService.getPaymentHistory(req.user!.id);
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

export default router;

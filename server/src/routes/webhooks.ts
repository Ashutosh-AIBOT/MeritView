import { Router } from 'express';
import express from 'express';
import * as webhookService from '../services/webhooks.service';

const router = Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req: any, res: any, next: any) => {
  const signature = req.headers['stripe-signature'] as string;
  try {
    await webhookService.handleStripeWebhook(req.body, signature);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;

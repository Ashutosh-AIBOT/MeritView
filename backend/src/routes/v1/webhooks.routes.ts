import express from 'express';
import { Router } from 'express';
import { stripe } from '../../config/stripe.ts';
import { prisma } from '../../db/prisma.ts';
import { confirmPayment } from '../../services/payments/index.ts';

const router = Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req: any, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  const paymentIntent = event.data.object as any;

  if (event.type === 'payment_intent.succeeded') {
    const disputeId = paymentIntent.metadata?.disputeId;
    if (disputeId) {
      await confirmPayment(disputeId, paymentIntent.id);
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const disputeId = paymentIntent.metadata?.disputeId;
    if (disputeId) {
      await prisma.dispute.update({
        where: { id: disputeId },
        data: { state: 'failed' },
      });
    }
  }

  res.json({ received: true });
});

export default router;

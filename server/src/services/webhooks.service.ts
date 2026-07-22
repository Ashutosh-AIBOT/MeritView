import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  // handle event types
  console.log('Stripe event:', event.type);
  return { handled: true };
}

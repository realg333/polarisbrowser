import Stripe from 'stripe';
import { config, isStripeEnabled } from '../config';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeEnabled()) {
    throw new Error('Stripe não configurado');
  }
  if (!stripe) {
    stripe = new Stripe(config.stripeSecretKey);
  }
  return stripe;
}

export function getStripePriceId(plan: 'starter' | 'unlimited', cycle: 'monthly' | 'yearly'): string {
  const map = {
    starter: {
      monthly: config.stripePrices.starterMonthly,
      yearly: config.stripePrices.starterYearly,
    },
    unlimited: {
      monthly: config.stripePrices.unlimitedMonthly,
      yearly: config.stripePrices.unlimitedYearly,
    },
  };
  const priceId = map[plan][cycle];
  if (!priceId) {
    throw new Error(`Stripe price ID não configurado para ${plan}/${cycle}`);
  }
  return priceId;
}

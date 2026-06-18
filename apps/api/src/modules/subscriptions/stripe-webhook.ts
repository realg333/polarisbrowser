import type { FastifyInstance, FastifyRequest } from 'fastify';
import type Stripe from 'stripe';
import { config, isStripeEnabled } from '../../config';
import { getStripe } from '../../plugins/stripe.plugin';
import {
  cancelSubscription,
  getPlanIdBySlug,
  getPlanSlugByStripePrice,
  upsertSubscription,
} from './subscription.service';
import { getUserWorkspaceId } from '../users/user.service';

export async function registerStripeWebhook(app: FastifyInstance): Promise<void> {
  await app.register(async (webhookApp) => {
    webhookApp.addContentTypeParser(
      'application/json',
      { parseAs: 'buffer' },
      (_req, body, done) => {
        done(null, body);
      },
    );

    webhookApp.post('/webhooks/stripe', async (request: FastifyRequest, reply) => {
      if (!isStripeEnabled()) {
        return reply.code(503).send({ error: 'Stripe não configurado' });
      }

      const signature = request.headers['stripe-signature'];
      if (!signature || typeof signature !== 'string') {
        return reply.code(400).send({ error: 'Assinatura ausente' });
      }

      const stripe = getStripe();
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body as Buffer,
          signature,
          config.stripeWebhookSecret,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Webhook inválido';
        return reply.code(400).send({ error: message });
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.created':
          await handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          break;
      }

      return reply.send({ received: true });
    });
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.polaris_user_id;
  const plan = session.metadata?.polaris_plan;
  if (!userId || !plan) return;

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncStripeSubscription(userId, subscription, plan as 'starter' | 'unlimited');
}

async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.polaris_user_id;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const planSlug = priceId ? await getPlanSlugByStripePrice(priceId) : null;
  await syncStripeSubscription(userId, subscription, (planSlug ?? 'starter') as 'starter' | 'unlimited');
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  if (subscription.id) {
    await cancelSubscription(subscription.id);
  }
}

async function syncStripeSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  planSlug: 'starter' | 'unlimited',
): Promise<void> {
  const workspaceId = await getUserWorkspaceId(userId);
  if (!workspaceId) return;

  const planId = await getPlanIdBySlug(planSlug);
  if (!planId) return;

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const item = subscription.items.data[0];
  const interval = item?.price.recurring?.interval;
  const billingCycle = interval === 'year' ? 'yearly' : 'monthly';

  const periodStart =
    'current_period_start' in subscription
      ? (subscription as Stripe.Subscription & { current_period_start: number }).current_period_start
      : Math.floor(Date.now() / 1000);
  const periodEnd =
    'current_period_end' in subscription
      ? (subscription as Stripe.Subscription & { current_period_end: number }).current_period_end
      : periodStart + 30 * 24 * 60 * 60;

  await upsertSubscription({
    userId,
    workspaceId,
    planId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    status: subscription.status,
    billingCycle,
    currentPeriodStart: new Date(periodStart * 1000),
    currentPeriodEnd: new Date(periodEnd * 1000),
  });
}

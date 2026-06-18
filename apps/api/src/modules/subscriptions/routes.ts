import type { FastifyInstance } from 'fastify';
import type { PlanSlug } from '@polaris/shared';
import { authenticate } from '../../plugins/auth.plugin';
import { config, isStripeEnabled } from '../../config';
import { getStripe, getStripePriceId } from '../../plugins/stripe.plugin';
import {
  ensureUserRecord,
  getStripeCustomerId,
  getUserWorkspaceId,
  updateStripeCustomerId,
} from '../users/user.service';
import { getPlanIdBySlug } from '../subscriptions/subscription.service';

export async function registerBillingRoutes(app: FastifyInstance): Promise<void> {
  app.post<{
    Body: { plan: PlanSlug; cycle: 'monthly' | 'yearly' };
  }>('/api/v1/billing/checkout', { preHandler: authenticate }, async (request, reply) => {
    if (!isStripeEnabled()) {
      return reply.code(503).send({ error: 'Billing indisponível no momento' });
    }

    const user = request.user!;
    const { plan, cycle } = request.body ?? {};

    if (!plan || !cycle || !['starter', 'unlimited'].includes(plan)) {
      return reply.code(400).send({ error: 'Plano ou ciclo inválido' });
    }

    await ensureUserRecord(user);
    const stripe = getStripe();

    let customerId = await getStripeCustomerId(user.id);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { polaris_user_id: user.id },
      });
      customerId = customer.id;
      await updateStripeCustomerId(user.id, customerId);
    }

    const priceId = getStripePriceId(plan as 'starter' | 'unlimited', cycle);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.appUrl}/settings?checkout=success`,
      cancel_url: `${config.appUrl}/settings?checkout=canceled`,
      metadata: {
        polaris_user_id: user.id,
        polaris_plan: plan,
        polaris_cycle: cycle,
      },
      subscription_data: {
        metadata: {
          polaris_user_id: user.id,
          polaris_plan: plan,
        },
      },
    });

    if (!session.url) {
      return reply.code(500).send({ error: 'Falha ao criar sessão de checkout' });
    }

    return reply.send({ url: session.url, sessionId: session.id });
  });

  app.post('/api/v1/billing/portal', { preHandler: authenticate }, async (request, reply) => {
    if (!isStripeEnabled()) {
      return reply.code(503).send({ error: 'Billing indisponível no momento' });
    }

    const user = request.user!;
    const customerId = await getStripeCustomerId(user.id);
    if (!customerId) {
      return reply.code(400).send({ error: 'Nenhuma assinatura encontrada' });
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.appUrl}/settings`,
    });

    return reply.send({ url: portal.url });
  });

  app.get('/api/v1/billing/subscription', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    await ensureUserRecord(user);
    const workspaceId = await getUserWorkspaceId(user.id);
    const planId = await getPlanIdBySlug('starter');

    return reply.send({
      workspaceId,
      defaultPlanId: planId,
    });
  });
}

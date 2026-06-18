import { eq, desc } from 'drizzle-orm';
import type { BillingCycle, PlanSlug, SubscriptionInfo, SubscriptionStatus } from '@polaris/shared';
import { plans, subscriptions } from '@polaris/database/cloud';
import { db } from '../../database/client';

export async function getSubscriptionForUser(userId: string): Promise<SubscriptionInfo> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);

  if (!sub) {
    return {
      plan: 'starter',
      status: 'none',
      billingCycle: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
    };
  }

  const [plan] = await db.select().from(plans).where(eq(plans.id, sub.planId)).limit(1);

  return {
    plan: (plan?.slug as PlanSlug) ?? 'starter',
    status: sub.status as SubscriptionStatus,
    billingCycle: (sub.billingCycle as BillingCycle) ?? null,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    stripeCustomerId: sub.stripeCustomerId,
  };
}

export async function upsertSubscription(input: {
  userId: string;
  workspaceId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}): Promise<void> {
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, input.stripeSubscriptionId))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        planId: input.planId,
        status: input.status,
        billingCycle: input.billingCycle,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
    return;
  }

  await db.insert(subscriptions).values({
    userId: input.userId,
    workspaceId: input.workspaceId,
    planId: input.planId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    stripeCustomerId: input.stripeCustomerId,
    status: input.status,
    billingCycle: input.billingCycle,
    currentPeriodStart: input.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd,
  });
}

export async function cancelSubscription(stripeSubscriptionId: string): Promise<void> {
  await db
    .update(subscriptions)
    .set({ status: 'canceled', canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

export async function getPlanIdBySlug(slug: PlanSlug): Promise<string | null> {
  const [plan] = await db.select().from(plans).where(eq(plans.slug, slug)).limit(1);
  return plan?.id ?? null;
}

export async function getPlanSlugByStripePrice(priceId: string): Promise<PlanSlug | null> {
  const allPlans = await db.select().from(plans);
  for (const plan of allPlans) {
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return plan.slug as PlanSlug;
    }
  }
  return null;
}

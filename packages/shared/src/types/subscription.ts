import type { PlanSlug } from './profile';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'none';

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionInfo {
  plan: PlanSlug;
  status: SubscriptionStatus;
  billingCycle: BillingCycle | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface SignedLicensePayload {
  plan: PlanSlug;
  maxProfiles: number;
  maxMembers: number;
  status: SubscriptionStatus;
  expiresAt: string;
  issuedAt: string;
  userId: string;
  signature: string;
}

import type { PlanSlug } from '../types/profile';

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  maxProfiles: number;
  maxMembers: number;
  priceMonthlyCents: number;
  priceYearlyCents: number;
}

export const PLANS: Record<PlanSlug, PlanDefinition> = {
  starter: {
    slug: 'starter',
    name: 'Starter',
    maxProfiles: 10,
    maxMembers: 3,
    priceMonthlyCents: 2990,
    priceYearlyCents: 1990,
  },
  unlimited: {
    slug: 'unlimited',
    name: 'Unlimited',
    maxProfiles: -1,
    maxMembers: 20,
    priceMonthlyCents: 4990,
    priceYearlyCents: 3990,
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    maxProfiles: -1,
    maxMembers: -1,
    priceMonthlyCents: 49900,
    priceYearlyCents: 39900,
  },
};

export function formatPlanPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

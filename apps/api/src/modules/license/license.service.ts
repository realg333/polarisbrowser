import { createHmac, timingSafeEqual } from 'crypto';
import type { PlanSlug, SignedLicensePayload, SubscriptionStatus } from '@polaris/shared';
import { PLANS } from '@polaris/shared';
import { config } from '../../config';

const OFFLINE_GRACE_HOURS = 72;

export function signLicensePayload(
  payload: Omit<SignedLicensePayload, 'signature'>,
): SignedLicensePayload {
  const data = serializePayload(payload);
  const signature = createHmac('sha256', config.licenseSigningSecret).update(data).digest('hex');
  return { ...payload, signature };
}

export function verifyLicenseSignature(payload: SignedLicensePayload): boolean {
  const { signature, ...rest } = payload;
  const expected = createHmac('sha256', config.licenseSigningSecret)
    .update(serializePayload(rest))
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function buildLicensePayload(
  userId: string,
  plan: PlanSlug,
  status: SubscriptionStatus,
): SignedLicensePayload {
  const planDef = PLANS[plan];
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + OFFLINE_GRACE_HOURS * 60 * 60 * 1000);

  return signLicensePayload({
    userId,
    plan,
    maxProfiles: planDef.maxProfiles,
    maxMembers: planDef.maxMembers,
    status,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

function serializePayload(payload: Omit<SignedLicensePayload, 'signature'>): string {
  return JSON.stringify({
    userId: payload.userId,
    plan: payload.plan,
    maxProfiles: payload.maxProfiles,
    maxMembers: payload.maxMembers,
    status: payload.status,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  });
}

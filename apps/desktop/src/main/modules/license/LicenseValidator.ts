import { createHmac, timingSafeEqual } from 'crypto';
import type { LicenseInfo, PlanSlug, SignedLicensePayload } from '@polaris/shared';
import { PLAN_LIMITS } from '@polaris/shared';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { licenseCache } from '../../database/schema';
import { authService } from '../auth/AuthService';
import { profileManager } from '../profiles/ProfileManager';

const LICENSE_SIGNING_SECRET =
  process.env.LICENSE_SIGNING_SECRET ?? 'dev-license-secret-change-in-production';

function getApiUrl(): string {
  return process.env.POLARIS_API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3001';
}

export class LicenseValidator {
  private currentPlan: PlanSlug = 'starter';

  getPlan(): PlanSlug {
    return this.currentPlan;
  }

  getLicenseInfo(activeProfiles: number): LicenseInfo {
    const limits = PLAN_LIMITS[this.currentPlan];
    const cached = this.loadCache();
    return {
      plan: this.currentPlan,
      maxProfiles: limits.maxProfiles,
      activeProfiles,
      expiresAt: cached?.expiresAt ?? null,
    };
  }

  async sync(): Promise<{ success: boolean; error?: string }> {
    const token = await authService.getValidAccessToken();
    if (!token) {
      this.applyOfflineCache();
      return { success: false, error: 'Não autenticado' };
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/license`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        this.applyOfflineCache();
        return { success: false, error: 'Falha ao sincronizar licença' };
      }

      const payload = (await response.json()) as SignedLicensePayload;
      if (!this.verifySignature(payload)) {
        return { success: false, error: 'Assinatura de licença inválida' };
      }

      this.saveCache(payload);
      this.applyPlan(payload.plan);
      return { success: true };
    } catch {
      this.applyOfflineCache();
      return { success: false, error: 'API indisponível — usando cache offline' };
    }
  }

  applyOfflineCache(): void {
    const cached = this.loadCache();
    if (cached && new Date(cached.expiresAt) > new Date()) {
      this.applyPlan(cached.plan);
    } else {
      this.applyPlan('starter');
    }
  }

  private applyPlan(plan: PlanSlug): void {
    this.currentPlan = plan;
    profileManager.setPlan(plan);
  }

  private loadCache(): SignedLicensePayload | null {
    const db = getDatabase();
    const row = db.select().from(licenseCache).where(eq(licenseCache.id, 'current')).get();
    if (!row) return null;

    try {
      return JSON.parse(row.payload) as SignedLicensePayload;
    } catch {
      return null;
    }
  }

  private saveCache(payload: SignedLicensePayload): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.insert(licenseCache)
      .values({
        id: 'current',
        plan: payload.plan,
        maxProfiles: payload.maxProfiles,
        expiresAt: payload.expiresAt,
        signature: payload.signature,
        payload: JSON.stringify(payload),
        cachedAt: now,
      })
      .onConflictDoUpdate({
        target: licenseCache.id,
        set: {
          plan: payload.plan,
          maxProfiles: payload.maxProfiles,
          expiresAt: payload.expiresAt,
          signature: payload.signature,
          payload: JSON.stringify(payload),
          cachedAt: now,
        },
      })
      .run();
  }

  private verifySignature(payload: SignedLicensePayload): boolean {
    const { signature, ...rest } = payload;
    const data = JSON.stringify({
      userId: rest.userId,
      plan: rest.plan,
      maxProfiles: rest.maxProfiles,
      maxMembers: rest.maxMembers,
      status: rest.status,
      issuedAt: rest.issuedAt,
      expiresAt: rest.expiresAt,
    });
    const expected = createHmac('sha256', LICENSE_SIGNING_SECRET).update(data).digest('hex');

    try {
      return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }
}

export const licenseValidator = new LicenseValidator();

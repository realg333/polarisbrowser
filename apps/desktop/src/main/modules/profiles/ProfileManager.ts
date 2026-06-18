import type { CreateProfileInput, ProfileWithMeta, UpdateProfileInput } from '@polaris/shared';
import { PLAN_LIMITS } from '@polaris/shared';
import { ProfileRepository } from './ProfileRepository';
import { BrowserLauncher } from './BrowserLauncher';

export class ProfileManager {
  private readonly repository = new ProfileRepository();
  private readonly launcher = new BrowserLauncher(this.repository);
  private currentPlan: keyof typeof PLAN_LIMITS = 'starter';

  setPlan(plan: keyof typeof PLAN_LIMITS): void {
    this.currentPlan = plan;
  }

  list(options?: { search?: string; status?: string; folderId?: string | null; tagId?: string }): ProfileWithMeta[] {
    return this.repository.findAll(options);
  }

  getById(id: string): ProfileWithMeta | null {
    return this.repository.findById(id);
  }

  create(input: CreateProfileInput): { profile?: ProfileWithMeta; error?: string } {
    const limit = PLAN_LIMITS[this.currentPlan].maxProfiles;
    if (limit > 0 && this.repository.countActive() >= limit) {
      return {
        error: `Limite de ${limit} perfis atingido no plano ${this.currentPlan}. Faça upgrade para criar mais.`,
      };
    }

    const profile = this.repository.create(input);
    return { profile };
  }

  update(id: string, input: UpdateProfileInput): ProfileWithMeta | null {
    return this.repository.update(id, input);
  }

  delete(id: string): boolean {
    this.launcher.stop(id);
    return this.repository.delete(id);
  }

  duplicate(id: string): ProfileWithMeta | null {
    const limit = PLAN_LIMITS[this.currentPlan].maxProfiles;
    if (limit > 0 && this.repository.countActive() >= limit) {
      return null;
    }
    return this.repository.duplicate(id);
  }

  archive(id: string): ProfileWithMeta | null {
    return this.repository.update(id, { status: 'archived' });
  }

  async launch(id: string, options?: { validation?: boolean }): Promise<{ success: boolean; error?: string }> {
    const profile = this.repository.findById(id);
    if (!profile) return { success: false, error: 'Perfil não encontrado' };
    if (profile.status === 'archived') {
      return { success: false, error: 'Perfil arquivado não pode ser iniciado' };
    }
    return this.launcher.launch(profile, options);
  }

  stop(id: string): boolean {
    return this.launcher.stop(id);
  }

  getStats() {
    const all = this.repository.findAll({ includeArchived: true });
    const active = all.filter((p) => p.status === 'running').length;
    const idle = all.filter((p) => p.status === 'idle').length;
    const archived = all.filter((p) => p.status === 'archived').length;

    return {
      total: all.length,
      active,
      idle,
      archived,
      running: this.launcher.getActiveCount(),
    };
  }
}

export const profileManager = new ProfileManager();

import { ipcMain, shell } from 'electron';
import { loginSchema, registerSchema } from '@polaris/shared';
import { authService } from '../modules/auth/AuthService';
import { licenseValidator } from '../modules/license/LicenseValidator';
import { profileManager } from '../modules/profiles/ProfileManager';

function getApiUrl(): string {
  return process.env.POLARIS_API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3001';
}

export function registerAuthIpc(): void {
  ipcMain.handle('auth:state', () => authService.getState());

  ipcMain.handle('auth:login', async (_event, input: unknown) => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };
    }
    const result = await authService.login(parsed.data);
    if (result.session) {
      await licenseValidator.sync();
    }
    return result;
  });

  ipcMain.handle('auth:register', async (_event, input: unknown) => {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };
    }
    const result = await authService.register(parsed.data);
    if (result.session) {
      await licenseValidator.sync();
    }
    return result;
  });

  ipcMain.handle('auth:refresh', async () => {
    const result = await authService.refresh();
    if (result.session) {
      await licenseValidator.sync();
    }
    return result;
  });

  ipcMain.handle('auth:logout', () => {
    authService.logout();
    licenseValidator.applyOfflineCache();
    return { success: true };
  });

  ipcMain.handle('auth:checkout', async (_event, input: { plan: string; cycle: string }) => {
    const token = await authService.getValidAccessToken();
    if (!token) return { error: 'Faça login para assinar um plano' };

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/billing/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        return { error: err.error ?? 'Falha ao iniciar checkout' };
      }

      const data = (await response.json()) as { url: string; sessionId: string };
      await shell.openExternal(data.url);
      return { success: true, sessionId: data.sessionId };
    } catch {
      return { error: 'API indisponível' };
    }
  });

  ipcMain.handle('auth:portal', async () => {
    const token = await authService.getValidAccessToken();
    if (!token) return { error: 'Faça login para gerenciar assinatura' };

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/billing/portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        return { error: err.error ?? 'Falha ao abrir portal' };
      }

      const data = (await response.json()) as { url: string };
      await shell.openExternal(data.url);
      return { success: true };
    } catch {
      return { error: 'API indisponível' };
    }
  });
}

export function registerLicenseIpc(): void {
  ipcMain.handle('license:info', () => {
    const stats = profileManager.getStats();
    return licenseValidator.getLicenseInfo(stats.total - stats.archived);
  });

  ipcMain.handle('license:sync', () => licenseValidator.sync());
}

import { join } from 'path';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { spawn, type ChildProcess } from 'child_process';
import type { Profile } from '@polaris/shared';
import { formatProxyServerArg, mergeGeoIntoProfile } from '@polaris/shared';
import { ProfileRepository } from './ProfileRepository';
import { browserPathService } from '../browsers/BrowserPathService';
import { fingerprintExtensionBuilder } from './FingerprintExtensionBuilder';
import { engineFingerprintBridge } from './EngineFingerprintBridge';
import { writeValidationHub } from './FingerprintValidationBuilder';
import { proxyGeoService } from '../proxy/ProxyGeoService';

const activeSessions = new Map<string, ChildProcess>();

export interface LaunchOptions {
  validation?: boolean;
}

export class BrowserLauncher {
  constructor(private readonly repository: ProfileRepository) {}

  private getProfileDataDir(profileId: string): string {
    const baseDir = join(app.getPath('userData'), 'profiles', profileId);
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
    return baseDir;
  }

  async launch(profile: Profile, options?: LaunchOptions): Promise<{ success: boolean; error?: string }> {
    if (activeSessions.has(profile.id)) {
      return { success: false, error: 'Perfil já está em execução' };
    }

    let activeProfile = profile;

    if (profile.proxy?.enabled && profile.proxy.host) {
      try {
        const geo = await proxyGeoService.resolveFromProxy(profile.proxy);
        activeProfile = mergeGeoIntoProfile(profile, geo);
      } catch {
        // segue com geo manual se lookup falhar
      }
    }

    const userDataDir = this.getProfileDataDir(profile.id);
    const startUrl = options?.validation
      ? writeValidationHub(userDataDir)
      : activeProfile.startUrl !== 'about:blank'
        ? activeProfile.startUrl
        : 'about:blank';
    const ua = activeProfile.fingerprint.userAgent ?? activeProfile.userAgent;

    const extDir = fingerprintExtensionBuilder.build(
      activeProfile.id,
      userDataDir,
      {
        ...activeProfile.fingerprint,
        language: activeProfile.fingerprint.language ?? activeProfile.language,
      },
    );
    const { chromiumArgs, engineArgs, env } = engineFingerprintBridge.build(activeProfile, userDataDir);

    const args: string[] = [
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      `--load-extension=${extDir}`,
      ...chromiumArgs,
      ...engineArgs,
    ];

    if (activeProfile.proxy?.enabled && activeProfile.proxy.host) {
      args.push(`--proxy-server=${formatProxyServerArg(activeProfile.proxy)}`);
    }

    if (ua) {
      args.push(`--user-agent=${ua}`);
    }

    if (activeProfile.adBlocker) {
      args.push('--disable-extensions-except=' + extDir);
    }

    if (activeProfile.fingerprint.screenWidth && activeProfile.fingerprint.screenHeight) {
      args.push(
        `--window-size=${activeProfile.fingerprint.screenWidth},${activeProfile.fingerprint.screenHeight}`,
      );
    }

    args.push(startUrl);

    try {
      const browserPath = browserPathService.resolve(activeProfile.browserEngine);
      const child = spawn(browserPath, args, {
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, ...env },
      });

      child.unref();
      activeSessions.set(profile.id, child);
      this.repository.markLaunched(profile.id);

      child.on('exit', () => {
        activeSessions.delete(profile.id);
        this.repository.markStopped(profile.id);
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao iniciar navegador';
      return { success: false, error: message };
    }
  }

  stop(profileId: string): boolean {
    const session = activeSessions.get(profileId);
    if (!session) return false;

    session.kill();
    activeSessions.delete(profileId);
    this.repository.markStopped(profileId);
    return true;
  }

  isRunning(profileId: string): boolean {
    return activeSessions.has(profileId);
  }

  getActiveCount(): number {
    return activeSessions.size;
  }
}

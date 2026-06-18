import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { app } from 'electron';
import { get as httpsGet } from 'https';
import { get as httpGet } from 'http';
import type {
  AntidetectEngine,
  BrowserInstallProgress,
  BrowserRuntimeInstallInfo,
  BrowserRuntimeManifest,
  BrowserRuntimePackage,
  BrowserRuntimePlatform,
  BrowserRuntimeStatus,
} from '@polaris/shared';
import { BUNDLED_BROWSER_RUNTIME_MANIFEST } from '@polaris/shared';
import { resolveRuntimeDownloadUrl } from '@polaris/shared';
import { browserPathService } from './BrowserPathService';
import {
  findExecutableInDir,
  findInAdsPowerInstalls,
  getAdsPowerImportCandidates,
} from './AdsPowerDiscovery';

function expandEnvPath(template: string): string {
  return template
    .replace(/%LOCALAPPDATA%/g, process.env.LOCALAPPDATA ?? '')
    .replace(/%PROGRAMFILES%/g, process.env.PROGRAMFILES ?? '')
    .replace(/%PROGRAMFILES\(X86\)%/g, process.env['PROGRAMFILES(X86)'] ?? '')
    .replace(/%USERPROFILE%/g, process.env.USERPROFILE ?? '');
}

function getPlatformKey(): BrowserRuntimePlatform {
  if (process.platform === 'darwin') {
    return process.arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  }
  if (process.platform === 'linux') return 'linux-x64';
  return 'win32-x64';
}

function downloadFile(url: string, dest: string, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https') ? httpsGet : httpGet;
    getter(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, dest, onProgress).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Download falhou (${response.statusCode})`));
        return;
      }
      const total = Number(response.headers['content-length'] ?? 0);
      let received = 0;
      const file = createWriteStream(dest);
      response.on('data', (chunk: Buffer) => {
        received += chunk.length;
        if (total > 0 && onProgress) onProgress(Math.round((received / total) * 100));
      });
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', reject);
    }).on('error', reject);
  });
}

export class BrowserRuntimeService {
  private manifest: BrowserRuntimeManifest = BUNDLED_BROWSER_RUNTIME_MANIFEST;

  getRuntimesDir(): string {
    const dir = join(app.getPath('userData'), 'runtimes');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  getEngineDir(engine: AntidetectEngine): string {
    const dir = join(this.getRuntimesDir(), engine);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async refreshManifest(): Promise<BrowserRuntimeManifest> {
    const url = this.manifest.remoteManifestUrl ?? BUNDLED_BROWSER_RUNTIME_MANIFEST.remoteManifestUrl;
    if (!url) return this.manifest;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (res.ok) {
        this.manifest = (await res.json()) as BrowserRuntimeManifest;
      }
    } catch {
      // mantém bundled
    }
    return this.manifest;
  }

  getInstalled(): Record<AntidetectEngine, BrowserRuntimeInstallInfo | null> {
    const path = join(this.getRuntimesDir(), 'installs.json');
    if (!existsSync(path)) {
      return { sunbrowser: null, flowerbrowser: null };
    }
    try {
      return JSON.parse(readFileSync(path, 'utf-8')) as Record<
        AntidetectEngine,
        BrowserRuntimeInstallInfo | null
      >;
    } catch {
      return { sunbrowser: null, flowerbrowser: null };
    }
  }

  private saveInstalled(data: Record<AntidetectEngine, BrowserRuntimeInstallInfo | null>): void {
    writeFileSync(join(this.getRuntimesDir(), 'installs.json'), JSON.stringify(data, null, 2), 'utf-8');
  }

  private registerInstall(info: BrowserRuntimeInstallInfo): void {
    const current = this.getInstalled();
    current[info.engine] = info;
    this.saveInstalled(current);
    browserPathService.setCustomPath(info.engine, info.executablePath);
  }

  getPackage(engine: AntidetectEngine): BrowserRuntimePackage | null {
    const entry = this.manifest.engines[engine];
    if (!entry) return null;
    const platform = getPlatformKey();
    const pkg = entry.platforms[platform];
    if (!pkg) return null;

    const downloadUrl = resolveRuntimeDownloadUrl(this.manifest, engine, platform, pkg);
    return downloadUrl ? { ...pkg, downloadUrl } : pkg;
  }

  getStatus(engine: AntidetectEngine): BrowserRuntimeStatus {
    const entry = this.manifest.engines[engine];
    const pkg = this.getPackage(engine);
    const installed = this.getInstalled()[engine];
    const path =
      installed?.executablePath ??
      browserPathService.detect().paths[engine] ??
      (pkg ? findExecutableInDir(this.getEngineDir(engine), pkg.executable) : null);
    const installedVersion = installed?.version ?? null;
    const latestVersion = pkg?.version ?? null;

    return {
      engine,
      label: entry?.label ?? engine,
      installed: !!path && existsSync(path),
      version: installedVersion,
      path,
      updateAvailable:
        !!latestVersion && (!installedVersion || latestVersion !== installedVersion),
      latestVersion,
      kernelFamily: entry?.kernelFamily ?? 'chromium',
      downloadAvailable: !!pkg?.downloadUrl,
    };
  }

  getAllStatus(): BrowserRuntimeStatus[] {
    return (['sunbrowser', 'flowerbrowser'] as AntidetectEngine[]).map((e) => this.getStatus(e));
  }

  tryImport(engine: AntidetectEngine): BrowserRuntimeInstallInfo | null {
    const pkg = this.getPackage(engine);
    if (!pkg) return null;

    const candidates = [
      ...(pkg.importCandidates ?? []).map(expandEnvPath),
      ...getAdsPowerImportCandidates(engine),
    ];

    for (const resolved of candidates) {
      if (resolved && existsSync(resolved)) {
        const info: BrowserRuntimeInstallInfo = {
          engine,
          version: pkg.version,
          installedAt: new Date().toISOString(),
          executablePath: resolved,
          source: 'import',
        };
        this.registerInstall(info);
        return info;
      }
    }

    const discovered = findInAdsPowerInstalls(engine);
    if (discovered) {
      const info: BrowserRuntimeInstallInfo = {
        engine,
        version: pkg.version,
        installedAt: new Date().toISOString(),
        executablePath: discovered,
        source: 'import',
      };
      this.registerInstall(info);
      return info;
    }

    return null;
  }

  async tryLocalApiKernel(engine: AntidetectEngine): Promise<BrowserRuntimeInstallInfo | null> {
    const entry = this.manifest.engines[engine];
    const pkg = this.getPackage(engine);
    if (!entry || !pkg?.kernelMajor) return null;

    const bases = ['http://127.0.0.1:50325', 'http://local.adspower.net:50325'];
    for (const base of bases) {
      try {
        const statusRes = await fetch(`${base}/status`, { signal: AbortSignal.timeout(3000) });
        if (!statusRes.ok) continue;

        await fetch(`${base}/api/v2/browser-profile/download-kernel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kernel_type: entry.kernelApiType,
            kernel_version: pkg.kernelMajor,
          }),
          signal: AbortSignal.timeout(120_000),
        });

        const imported = this.tryImport(engine);
        if (imported) {
          imported.source = 'local-api';
          this.registerInstall(imported);
          return imported;
        }
      } catch {
        // próximo endpoint
      }
    }
    return null;
  }

  async install(
    engine: AntidetectEngine,
    onProgress?: (p: BrowserInstallProgress) => void,
    options?: { forceUpdate?: boolean },
  ): Promise<{ success: boolean; error?: string; info?: BrowserRuntimeInstallInfo }> {
    const emit = (partial: Omit<BrowserInstallProgress, 'engine'>): void => {
      onProgress?.({ engine, ...partial });
    };

    emit({ phase: 'checking', percent: 5, message: 'Verificando instalação existente...' });
    await this.refreshManifest();

    const status = this.getStatus(engine);
    const pkg = this.getPackage(engine);

    if (status.installed && !status.updateAvailable && !options?.forceUpdate) {
      const info = this.getInstalled()[engine];
      if (info) {
        emit({ phase: 'done', percent: 100, message: 'Runtime já instalado' });
        return { success: true, info };
      }
    }

    if (!options?.forceUpdate && !status.updateAvailable) {
      const imported = this.tryImport(engine);
      if (imported) {
        emit({ phase: 'done', percent: 100, message: 'Navegador importado com sucesso' });
        return { success: true, info: imported };
      }
    }

    emit({ phase: 'checking', percent: 15, message: 'Tentando baixar kernel via suite local...' });
    const fromApi = await this.tryLocalApiKernel(engine);
    if (fromApi && !status.updateAvailable) {
      emit({ phase: 'done', percent: 100, message: 'Kernel baixado via suite anti-detect' });
      return { success: true, info: fromApi };
    }

    if (!pkg?.downloadUrl) {
      return {
        success: false,
        error:
          'Runtime não encontrado localmente. Publique os pacotes no CDN Polaris (GitHub Releases) ou instale uma suite compatível e use Importar.',
      };
    }

    try {
      emit({
        phase: 'downloading',
        percent: 20,
        message: status.updateAvailable ? 'Baixando atualização...' : 'Baixando runtime...',
      });
      const engineDir = this.getEngineDir(engine);
      const archivePath = join(engineDir, basename(pkg.downloadUrl.split('?')[0] ?? 'runtime.zip'));

      await downloadFile(pkg.downloadUrl, archivePath, (pct) => {
        emit({ phase: 'downloading', percent: 20 + Math.round(pct * 0.5), message: `Baixando... ${pct}%` });
      });

      emit({ phase: 'extracting', percent: 75, message: 'Extraindo arquivos...' });
      const { execFile } = await import('child_process');
      const { promisify } = await import('util');
      const execFileAsync = promisify(execFile);

      if (archivePath.endsWith('.zip')) {
        await execFileAsync(
          'powershell',
          ['-NoProfile', '-Command', `Expand-Archive -Force -Path '${archivePath}' -DestinationPath '${engineDir}'`],
          { windowsHide: true },
        );
      }

      const exePath = findExecutableInDir(engineDir, pkg.executable);
      if (!exePath) {
        throw new Error(`Executável ${pkg.executable} não encontrado após extração`);
      }

      const info: BrowserRuntimeInstallInfo = {
        engine,
        version: pkg.version,
        installedAt: new Date().toISOString(),
        executablePath: exePath,
        source: 'download',
      };
      this.registerInstall(info);
      emit({ phase: 'done', percent: 100, message: status.updateAvailable ? 'Atualização concluída' : 'Instalação concluída' });
      return { success: true, info };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha na instalação';
      emit({ phase: 'error', percent: 0, message });
      return { success: false, error: message };
    }
  }

  async installAll(
    onProgress?: (p: BrowserInstallProgress) => void,
  ): Promise<Record<AntidetectEngine, { success: boolean; error?: string; info?: BrowserRuntimeInstallInfo }>> {
    const engines: AntidetectEngine[] = ['sunbrowser', 'flowerbrowser'];
    const results = {} as Record<
      AntidetectEngine,
      { success: boolean; error?: string; info?: BrowserRuntimeInstallInfo }
    >;

    for (const engine of engines) {
      results[engine] = await this.install(engine, onProgress);
    }

    return results;
  }

  async bootstrap(): Promise<void> {
    await this.refreshManifest();
    for (const engine of ['sunbrowser', 'flowerbrowser'] as AntidetectEngine[]) {
      const status = this.getStatus(engine);
      if (!status.installed) {
        this.tryImport(engine);
        continue;
      }
      const pkg = this.getPackage(engine);
      if (pkg && !this.getInstalled()[engine]) {
        const exe = findExecutableInDir(this.getEngineDir(engine), pkg.executable) ?? status.path;
        if (exe && existsSync(exe)) {
          this.registerInstall({
            engine,
            version: pkg.version,
            installedAt: new Date().toISOString(),
            executablePath: exe,
            source: 'import',
          });
        }
      }
    }
  }
}

export const browserRuntimeService = new BrowserRuntimeService();

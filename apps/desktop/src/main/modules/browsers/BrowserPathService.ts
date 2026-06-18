import { join } from 'path';
import { existsSync } from 'fs';
import type { BrowserEngine, BrowserPaths, DetectedBrowsers } from '@polaris/shared';
import { getDatabase } from '../../database/connection';
import { appSettings } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { browserRuntimeService } from './BrowserRuntimeService';
import { findInAdsPowerInstalls } from './AdsPowerDiscovery';

const SETTINGS_KEY = 'browser_paths';

const DEFAULT_PATHS_WIN: Record<BrowserEngine, string[]> = {
  chrome: [
    join(process.env['PROGRAMFILES'] ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['PROGRAMFILES(X86)'] ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['LOCALAPPDATA'] ?? '', 'Google/Chrome/Application/chrome.exe'),
  ],
  sunbrowser: [
    join(process.env['LOCALAPPDATA'] ?? '', 'SunBrowser/SunBrowser.exe'),
    join(process.env['PROGRAMFILES'] ?? '', 'SunBrowser/SunBrowser.exe'),
    join(process.env['PROGRAMFILES'] ?? '', 'AdsPower Global/sunbrowser.exe'),
    join(process.env['LOCALAPPDATA'] ?? '', 'AdsPower Global/sunbrowser.exe'),
    'C:\\Program Files\\SunBrowser\\SunBrowser.exe',
  ],
  flowerbrowser: [
    join(process.env['LOCALAPPDATA'] ?? '', 'FlowerBrowser/FlowerBrowser.exe'),
    join(process.env['PROGRAMFILES'] ?? '', 'FlowerBrowser/FlowerBrowser.exe'),
    join(process.env['PROGRAMFILES'] ?? '', 'Flower Browser/FlowerBrowser.exe'),
    'C:\\Program Files\\FlowerBrowser\\FlowerBrowser.exe',
  ],
};

const DEFAULT_PATHS_MAC: Record<BrowserEngine, string[]> = {
  chrome: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  sunbrowser: [
    '/Applications/SunBrowser.app/Contents/MacOS/SunBrowser',
    '/Applications/AdsPower Global.app/Contents/MacOS/sunbrowser',
  ],
  flowerbrowser: ['/Applications/FlowerBrowser.app/Contents/MacOS/FlowerBrowser'],
};

export class BrowserPathService {
  detect(): DetectedBrowsers {
    const custom = this.getCustomPaths();
    const paths: BrowserPaths = {
      chrome: this.resolveEngine('chrome', custom.chrome),
      sunbrowser: this.resolveEngine('sunbrowser', custom.sunbrowser),
      flowerbrowser: this.resolveEngine('flowerbrowser', custom.flowerbrowser),
    };

    return {
      chrome: !!paths.chrome,
      sunbrowser: !!paths.sunbrowser,
      flowerbrowser: !!paths.flowerbrowser,
      paths,
    };
  }

  resolve(engine: BrowserEngine): string {
    const custom = this.getCustomPaths();
    const customPath = custom[engine];
    const resolved = this.resolveEngine(engine, customPath);
    if (!resolved) {
      throw new Error(
        `${engine} não encontrado. Baixe em Configurações → Navegadores ou configure o caminho manualmente.`,
      );
    }
    return resolved;
  }

  setCustomPath(engine: BrowserEngine, path: string | null): void {
    const current = this.getCustomPaths();
    current[engine] = path;
    this.saveCustomPaths(current);
  }

  getCustomPaths(): BrowserPaths {
    const db = getDatabase();
    const row = db.select().from(appSettings).where(eq(appSettings.key, SETTINGS_KEY)).get();
    if (!row) {
      return { chrome: null, sunbrowser: null, flowerbrowser: null };
    }
    try {
      return JSON.parse(row.value) as BrowserPaths;
    } catch {
      return { chrome: null, sunbrowser: null, flowerbrowser: null };
    }
  }

  private saveCustomPaths(paths: BrowserPaths): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.insert(appSettings)
      .values({ key: SETTINGS_KEY, value: JSON.stringify(paths), updatedAt: now })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: JSON.stringify(paths), updatedAt: now },
      })
      .run();
  }

  private resolveEngine(engine: BrowserEngine, customPath: string | null): string | null {
    if (customPath && existsSync(customPath)) return customPath;

    const runtime = browserRuntimeService.getInstalled()[engine as 'sunbrowser' | 'flowerbrowser'];
    if (runtime?.executablePath && existsSync(runtime.executablePath)) {
      return runtime.executablePath;
    }

    if (engine === 'sunbrowser' || engine === 'flowerbrowser') {
      const adsPowerPath = findInAdsPowerInstalls(engine);
      if (adsPowerPath) return adsPowerPath;
    }

    const candidates =
      process.platform === 'darwin' ? DEFAULT_PATHS_MAC[engine] : DEFAULT_PATHS_WIN[engine];

    for (const p of candidates) {
      if (p && existsSync(p)) return p;
    }

    return null;
  }
}

export const browserPathService = new BrowserPathService();

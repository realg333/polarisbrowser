import type { AntidetectEngine } from './profile';

export type BrowserRuntimePlatform = 'win32-x64' | 'darwin-arm64' | 'darwin-x64' | 'linux-x64';

export interface BrowserRuntimePackage {
  version: string;
  kernelMajor?: string;
  downloadUrl?: string;
  sha256?: string;
  executable: string;
  importCandidates?: string[];
}

export interface BrowserRuntimeManifestEntry {
  label: string;
  description: string;
  kernelFamily: 'chromium' | 'firefox';
  /** Tipo usado por suites anti-detect (Chrome → SunBrowser, Firefox → Flower). */
  kernelApiType: 'Chrome' | 'Firefox';
  platforms: Partial<Record<BrowserRuntimePlatform, BrowserRuntimePackage>>;
}

export interface BrowserRuntimeManifest {
  manifestVersion: number;
  updatedAt: string;
  remoteManifestUrl?: string;
  /** Base URL de releases Polaris (ex.: GitHub Releases tag `runtimes-v1`). */
  cdnBaseUrl?: string;
  /** Template do arquivo zip — tokens: {engine}, {platform}, {version} */
  cdnPathTemplate?: string;
  engines: Record<AntidetectEngine, BrowserRuntimeManifestEntry>;
}

export interface BrowserRuntimeInstallInfo {
  engine: AntidetectEngine;
  version: string;
  installedAt: string;
  executablePath: string;
  source: 'download' | 'import' | 'local-api';
}

export interface BrowserRuntimeStatus {
  engine: AntidetectEngine;
  label: string;
  installed: boolean;
  version: string | null;
  path: string | null;
  updateAvailable: boolean;
  latestVersion: string | null;
  kernelFamily: 'chromium' | 'firefox';
  /** Download direto disponível via CDN Polaris. */
  downloadAvailable: boolean;
}

export interface BrowserInstallProgress {
  engine: AntidetectEngine;
  phase: 'checking' | 'downloading' | 'extracting' | 'importing' | 'done' | 'error';
  percent: number;
  message: string;
}

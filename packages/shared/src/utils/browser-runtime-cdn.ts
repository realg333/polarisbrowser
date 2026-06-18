import type { AntidetectEngine } from '../types/profile';
import type { BrowserRuntimeManifest, BrowserRuntimePackage, BrowserRuntimePlatform } from '../types/browser-runtime';

const DEFAULT_CDN_TEMPLATE = '{engine}-{platform}-{version}.zip';

export function resolveRuntimeDownloadUrl(
  manifest: BrowserRuntimeManifest,
  engine: AntidetectEngine,
  platform: BrowserRuntimePlatform,
  pkg: BrowserRuntimePackage,
): string | null {
  if (pkg.downloadUrl?.trim()) return pkg.downloadUrl.trim();
  if (!manifest.cdnBaseUrl?.trim()) return null;

  const template = manifest.cdnPathTemplate?.trim() || DEFAULT_CDN_TEMPLATE;
  const fileName = template
    .replace(/\{engine\}/g, engine)
    .replace(/\{platform\}/g, platform)
    .replace(/\{version\}/g, pkg.version);

  const base = manifest.cdnBaseUrl.replace(/\/$/, '');
  return `${base}/${fileName}`;
}

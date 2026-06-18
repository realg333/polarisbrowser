import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { AntidetectEngine } from '@polaris/shared';

function expandEnvPath(template: string): string {
  return template
    .replace(/%LOCALAPPDATA%/g, process.env.LOCALAPPDATA ?? '')
    .replace(/%APPDATA%/g, process.env.APPDATA ?? '')
    .replace(/%PROGRAMFILES%/g, process.env.PROGRAMFILES ?? '')
    .replace(/%PROGRAMFILES\(X86\)%/g, process.env['PROGRAMFILES(X86)'] ?? '')
    .replace(/%USERPROFILE%/g, process.env.USERPROFILE ?? '');
}

const KNOWN_ADSPOWER_ROOTS = [
  '%APPDATA%/adspower_global/cwd_global',
  '%LOCALAPPDATA%/AdsPower Global',
  '%PROGRAMFILES%/AdsPower Global',
  '%PROGRAMFILES(X86)%/AdsPower Global',
];

const EXECUTABLE_ALIASES: Record<AntidetectEngine, string[]> = {
  sunbrowser: ['sunbrowser.exe', 'SunBrowser.exe'],
  flowerbrowser: ['flowerbrowser.exe', 'FlowerBrowser.exe'],
};

const KERNEL_DIR_PREFIX: Record<AntidetectEngine, string> = {
  sunbrowser: 'chrome_',
  flowerbrowser: 'firefox_',
};

export function findExecutableInDir(
  dir: string,
  executable: string,
  maxDepth = 6,
  depth = 0,
): string | null {
  if (!existsSync(dir) || depth > maxDepth) return null;

  const direct = join(dir, executable);
  if (existsSync(direct)) return direct;

  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isFile() && entry.name.toLowerCase() === executable.toLowerCase()) return full;
      if (entry.isDirectory()) {
        const nested = findExecutableInDir(full, executable, maxDepth, depth + 1);
        if (nested) return nested;
      }
    }
  } catch {
    // ignore unreadable dirs
  }
  return null;
}

function parseKernelVersion(dirName: string, prefix: string): number {
  const match = dirName.match(new RegExp(`^${prefix.replace('_', '_')}(\\d+)`, 'i'));
  return match ? Number.parseInt(match[1] ?? '0', 10) : 0;
}

export function getAdsPowerCwdGlobalDir(): string {
  return join(process.env.APPDATA ?? '', 'adspower_global', 'cwd_global');
}

export function findLatestKernelDir(engine: AntidetectEngine): string | null {
  const cwd = getAdsPowerCwdGlobalDir();
  if (!existsSync(cwd)) return null;

  const prefix = KERNEL_DIR_PREFIX[engine];
  let best: { version: number; path: string } | null = null;

  try {
    for (const entry of readdirSync(cwd, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.toLowerCase().startsWith(prefix)) continue;
      const version = parseKernelVersion(entry.name, prefix);
      const full = join(cwd, entry.name);
      const aliases = EXECUTABLE_ALIASES[engine];
      const hasExe = aliases.some((name) => existsSync(join(full, name)) || !!findExecutableInDir(full, name, 2));
      if (!hasExe) continue;
      if (!best || version > best.version) best = { version, path: full };
    }
  } catch {
    return null;
  }

  return best?.path ?? null;
}

export function discoverAdsPowerRoots(): string[] {
  const roots = new Set<string>();

  for (const template of KNOWN_ADSPOWER_ROOTS) {
    const resolved = expandEnvPath(template.replace(/\//g, '\\'));
    if (resolved && existsSync(resolved)) roots.add(resolved);
  }

  const cwd = getAdsPowerCwdGlobalDir();
  if (existsSync(cwd)) roots.add(cwd);

  if (process.platform === 'win32') {
    for (let code = 65; code <= 90; code++) {
      const letter = String.fromCharCode(code);
      for (const suffix of ['AdsPower\\AdsPower Global', 'AdsPower Global', 'AdsPower']) {
        const candidate = `${letter}:\\${suffix}`;
        if (existsSync(candidate)) roots.add(candidate);
      }
    }
  }

  return [...roots];
}

export function findInAdsPowerInstalls(engine: AntidetectEngine): string | null {
  const latestKernel = findLatestKernelDir(engine);
  if (latestKernel) {
    for (const name of EXECUTABLE_ALIASES[engine]) {
      const found = findExecutableInDir(latestKernel, name, 3);
      if (found) return found;
    }
  }

  const aliases = EXECUTABLE_ALIASES[engine];
  for (const root of discoverAdsPowerRoots()) {
    for (const name of aliases) {
      const found = findExecutableInDir(root, name);
      if (found) return found;
    }
  }
  return null;
}

export function getAdsPowerImportCandidates(engine: AntidetectEngine): string[] {
  const paths: string[] = [];
  const latestKernel = findLatestKernelDir(engine);
  if (latestKernel) {
    for (const name of EXECUTABLE_ALIASES[engine]) {
      paths.push(join(latestKernel, name));
    }
  }

  for (const root of discoverAdsPowerRoots()) {
    for (const name of EXECUTABLE_ALIASES[engine]) {
      paths.push(join(root, name));
    }
  }

  return paths;
}

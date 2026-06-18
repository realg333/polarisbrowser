#!/usr/bin/env npx tsx
/**
 * Atualiza versões Chrome nos presets de fingerprint.
 *
 * Uso: npx tsx scripts/update-chrome-versions.ts [--dry-run]
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PRESET_LIB = join(ROOT, 'packages/shared/src/utils/fingerprint-preset-library.ts');
const FINGERPRINT_TS = join(ROOT, 'packages/shared/src/utils/fingerprint.ts');

const dryRun = process.argv.includes('--dry-run');

interface ChromeRelease {
  tag_name: string;
}

async function fetchLatestChromeVersions(count = 5): Promise<string[]> {
  const res = await fetch('https://api.github.com/repos/parallel-web/parallel-web-tools/releases/latest');
  // Fallback: Chrome releases blog / chromestatus — use known stable from Google blog atom
  const blogRes = await fetch('https://chromereleases.googleblog.com/feeds/posts/default?alt=json&max-results=5');
  const blog = (await blogRes.json()) as {
    feed: { entry: Array<{ title: { $t: string }; content: { $t: string } }> };
  };

  const versions: string[] = [];
  for (const entry of blog.feed.entry ?? []) {
    const title = entry.title?.$t ?? '';
    const content = entry.content?.$t ?? '';
    const match =
      content.match(/updated to (\d+\.\d+\.\d+\.\d+)/i) ??
      title.match(/(\d+)\.0\.(\d+\.\d+)/);
    if (match?.[1]) {
      const full = match[1].includes('.') ? match[1] : `${match[1]}.0.0.0`;
      if (!versions.includes(full)) versions.push(full);
    }
  }

  if (versions.length === 0) {
    // hard fallback Jun 2026
    return ['150.0.7900.60', '149.0.7827.102', '148.0.7743.82', '147.0.7670.95', '146.0.7595.94'];
  }

  return versions.slice(0, count);
}

function bumpPresetVersions(content: string, versions: string[]): string {
  const [latest, v1, v2, v3, v4] = versions;
  const mapping: Record<string, string> = {
    V150: latest ?? v1 ?? '150.0.7900.60',
    V149: v1 ?? '149.0.7827.102',
    V148: v2 ?? '148.0.7743.82',
    V147: v3 ?? '147.0.7670.95',
    V146: v4 ?? '146.0.7595.94',
  };

  let next = content;
  for (const [key, ver] of Object.entries(mapping)) {
    next = next.replace(new RegExp(`const ${key} = '[^']+';`), `const ${key} = '${ver}';`);
  }
  return next;
}

function bumpChromeVersionsArray(content: string, versions: string[]): string {
  const list = versions.map((v) => `'${v}'`).join(',\n  ');
  return content.replace(
    /export const CHROME_VERSIONS = \[[\s\S]*?\] as const;/,
    `export const CHROME_VERSIONS = [\n  ${list},\n] as const;`,
  );
}

async function main(): Promise<void> {
  console.log('Buscando versões Chrome stable...');
  const versions = await fetchLatestChromeVersions();
  console.log('Versões:', versions.join(', '));

  const presetSrc = readFileSync(PRESET_LIB, 'utf-8');
  const fingerprintSrc = readFileSync(FINGERPRINT_TS, 'utf-8');

  const nextPreset = bumpPresetVersions(presetSrc, versions);
  const nextFingerprint = bumpChromeVersionsArray(fingerprintSrc, versions);

  if (dryRun) {
    console.log('\n[dry-run] Nenhum arquivo alterado.');
    return;
  }

  writeFileSync(PRESET_LIB, nextPreset, 'utf-8');
  writeFileSync(FINGERPRINT_TS, nextFingerprint, 'utf-8');
  console.log('Atualizado:', PRESET_LIB);
  console.log('Atualizado:', FINGERPRINT_TS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

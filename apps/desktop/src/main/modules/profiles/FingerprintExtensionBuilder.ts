import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { FingerprintConfig } from '@polaris/shared';
import { generateInjectionScript, fingerprintSeed } from '@polaris/shared';

const MANIFEST = {
  manifest_version: 3,
  name: 'Polaris Fingerprint Bridge',
  version: '1.0.0',
  description: 'Polaris Browser anti-detect fingerprint injection',
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['inject.js'],
      run_at: 'document_start',
      all_frames: true,
      world: 'MAIN',
    },
  ],
};

export class FingerprintExtensionBuilder {
  build(profileId: string, profileDir: string, fingerprint: FingerprintConfig): string {
    const extDir = join(profileDir, 'polaris-fingerprint-ext');
    if (!existsSync(extDir)) {
      mkdirSync(extDir, { recursive: true });
    }

    const seed = fingerprintSeed(profileId);
    const injectJs = generateInjectionScript(fingerprint, seed);

    writeFileSync(join(extDir, 'manifest.json'), JSON.stringify(MANIFEST, null, 2), 'utf-8');
    writeFileSync(join(extDir, 'inject.js'), injectJs, 'utf-8');

    return extDir;
  }
}

export const fingerprintExtensionBuilder = new FingerprintExtensionBuilder();

import type { FingerprintConfig, FingerprintOS, AntidetectEngine } from '../types/profile';
import {
  FINGERPRINT_PRESET_LIBRARY,
  type FingerprintPresetTemplate,
} from './fingerprint-preset-library';

/** Engines anti-detect suportados pelo Polaris (sem Chrome). */
export const ANTIDETECT_ENGINES: AntidetectEngine[] = ['sunbrowser', 'flowerbrowser'];

export type { FingerprintPresetTemplate };

/** Presets válidos e coerentes — UA, GPU, resolução e hardware alinhados. */
export const FINGERPRINT_PRESETS: FingerprintPresetTemplate[] = FINGERPRINT_PRESET_LIBRARY;

export function getPresetsForOs(os: FingerprintOS): FingerprintPresetTemplate[] {
  return FINGERPRINT_PRESETS.filter((p) => p.os === os);
}

export function getPresetById(id: string): FingerprintPresetTemplate | undefined {
  return FINGERPRINT_PRESETS.find((p) => p.id === id);
}

export function pickRandomPreset(
  os: FingerprintOS,
  seed?: number,
  excludeId?: string,
): FingerprintPresetTemplate {
  let pool = getPresetsForOs(os);
  if (excludeId && pool.length > 1) {
    pool = pool.filter((p) => p.id !== excludeId);
  }
  if (pool.length === 0) return FINGERPRINT_PRESETS[0]!;
  if (seed !== undefined) {
    return pool[seed % pool.length]!;
  }
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Gera fingerprint completo automaticamente — usuário não precisa configurar manualmente. */
export function generateAutoFingerprint(
  os: FingerprintOS = 'windows',
  options?: { presetId?: string; seed?: number; excludePresetId?: string },
): FingerprintConfig {
  const preset = options?.presetId
    ? getPresetById(options.presetId) ?? pickRandomPreset(os, options.seed, options.excludePresetId)
    : pickRandomPreset(os, options?.seed, options?.excludePresetId);

  return {
    os: preset.os,
    presetId: preset.id,
    osVersion: preset.osVersion,
    browserVersion: preset.browserVersion,
    browserKernel: 'chrome',
    userAgent: preset.userAgent,
    screenWidth: preset.screenWidth,
    screenHeight: preset.screenHeight,
    hardwareConcurrency: preset.hardwareConcurrency,
    deviceMemory: preset.deviceMemory,
    platform: preset.platform,
    webglVendor: preset.webglVendor,
    webglRenderer: preset.webglRenderer,
    webrtc: 'fake',
    doNotTrack: true,
    portScanProtection: true,
    canvas: 'noise',
    webgl: 'mask',
    audioContext: 'noise',
    clientRects: 'noise',
    geolocation: { mode: 'block' },
    fonts: { mode: 'custom', list: preset.fonts },
    mediaDevices: 'fake',
  };
}

export function regenerateFingerprint(current: FingerprintConfig): FingerprintConfig {
  return generateAutoFingerprint(current.os, { excludePresetId: current.presetId });
}

import type {
  FingerprintConfig,
  FingerprintOS,
  WebRtcMode,
  CanvasMode,
  WebGlMode,
  AudioContextMode,
} from '../types/profile';
import { generateAutoFingerprint } from './fingerprint-presets';

export const WINDOWS_VERSIONS = [
  { id: '10', label: 'Windows 10', nt: '10.0' },
  { id: '11', label: 'Windows 11', nt: '10.0' },
] as const;

export const CHROME_VERSIONS = [
  '150.0.7900.60',
  '149.0.7827.102',
  '148.0.7743.82',
  '147.0.7670.95',
  '146.0.7595.94',
] as const;

export const WEBRTC_LABELS: Record<WebRtcMode, string> = {
  real: 'Real (IP do proxy)',
  disabled: 'Desabilitado',
  fake: 'Substituído (anti-leak)',
  forward: 'Encaminhar (proxy)',
};

export const CANVAS_LABELS: Record<CanvasMode, string> = {
  real: 'Real',
  noise: 'Ruído',
  block: 'Bloqueado',
};

export const WEBGL_LABELS: Record<WebGlMode, string> = {
  real: 'Real',
  noise: 'Ruído',
  mask: 'Mascarado',
};

export const AUDIO_LABELS: Record<AudioContextMode, string> = {
  real: 'Real',
  noise: 'Ruído',
};

export const GEOLOCATION_LABELS: Record<import('../types/profile').GeolocationMode, string> = {
  block: 'Bloquear',
  prompt: 'Perguntar',
  allow: 'Permitir (coordenadas fixas)',
};

export const MEDIA_DEVICES_LABELS: Record<import('../types/profile').MediaDevicesMode, string> = {
  real: 'Real',
  fake: 'Dispositivos simulados',
  block: 'Bloqueado',
};

export const WINDOWS_FONT_PRESETS = [
  'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas',
  'Courier New', 'Georgia', 'Impact', 'Segoe UI', 'Tahoma', 'Times New Roman',
  'Trebuchet MS', 'Verdana',
];

export const DEFAULT_WEBGL_BY_OS: Record<FingerprintOS, { vendor: string; renderer: string }> = {
  windows: {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)',
  },
  macos: {
    vendor: 'Apple Inc.',
    renderer: 'Apple M1',
  },
  ios: {
    vendor: 'Apple Inc.',
    renderer: 'Apple GPU',
  },
  android: {
    vendor: 'Qualcomm',
    renderer: 'Adreno (TM) 640',
  },
};

export function buildUserAgent(
  config: Pick<FingerprintConfig, 'os' | 'osVersion' | 'browserVersion' | 'browserKernel' | 'userAgent'>,
): string {
  if (config.userAgent?.trim()) return config.userAgent.trim();

  const chromeVersion = config.browserVersion ?? '149.0.7827.102';
  const kernel = config.browserKernel ?? 'chrome';

  switch (config.os) {
    case 'windows': {
      const nt = config.osVersion === '11' ? '10.0' : '10.0';
      return `Mozilla/5.0 (Windows NT ${nt}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    }
    case 'macos':
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    case 'ios': {
      const safariVersion = chromeVersion.split('.')[0] ?? '17';
      return `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVersion}.0 Mobile/15E148 Safari/604.1`;
    }
    case 'android':
      return `Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36`;
    default:
      if (kernel === 'chrome') {
        return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      }
      return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  }
}

export function resolveFingerprint(config: Partial<FingerprintConfig> | undefined): FingerprintConfig {
  const os: FingerprintOS = config?.os ?? 'windows';

  if (!config?.userAgent) {
    const base = generateAutoFingerprint(os, { presetId: config?.presetId });
    return { ...base, ...config, os, userAgent: base.userAgent };
  }

  const isMobile = os === 'ios' || os === 'android';

  const base: FingerprintConfig = {
    os,
    presetId: config?.presetId,
    osVersion: config?.osVersion ?? '10',
    browserVersion: config?.browserVersion ?? '149.0.7827.102',
    browserKernel: config?.browserKernel ?? 'chrome',
    screenWidth: config?.screenWidth ?? (isMobile ? 390 : 1920),
    screenHeight: config?.screenHeight ?? (isMobile ? 844 : 1080),
    timezone: config?.timezone,
    language: config?.language,
    webrtc: config?.webrtc ?? 'fake',
    doNotTrack: config?.doNotTrack ?? true,
    portScanProtection: config?.portScanProtection ?? true,
    canvas: config?.canvas ?? 'noise',
    webgl: config?.webgl ?? 'noise',
    audioContext: config?.audioContext ?? 'noise',
    clientRects: config?.clientRects ?? 'noise',
    hardwareConcurrency: config?.hardwareConcurrency ?? (isMobile ? 6 : 8),
    deviceMemory: config?.deviceMemory ?? (isMobile ? 4 : 8),
    platform: config?.platform ?? (os === 'windows' ? 'Win32' : os === 'macos' ? 'MacIntel' : os === 'ios' ? 'iPhone' : 'Linux armv8l'),
    webglVendor: config?.webglVendor ?? DEFAULT_WEBGL_BY_OS[os].vendor,
    webglRenderer: config?.webglRenderer ?? DEFAULT_WEBGL_BY_OS[os].renderer,
    geolocation: config?.geolocation ?? { mode: 'block' },
    fonts: config?.fonts ?? { mode: 'default', list: WINDOWS_FONT_PRESETS },
    mediaDevices: config?.mediaDevices ?? 'fake',
  };

  return {
    ...base,
    userAgent: buildUserAgent({ ...base, userAgent: config?.userAgent }),
  };
}

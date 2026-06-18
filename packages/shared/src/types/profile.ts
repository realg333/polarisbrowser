export type ProfileStatus = 'idle' | 'running' | 'archived';

import type { ProxyConfig } from './proxy';

export type BrowserEngine = 'chrome' | 'sunbrowser' | 'flowerbrowser';

export type AntidetectEngine = 'sunbrowser' | 'flowerbrowser';

export type FingerprintOS = 'windows' | 'macos' | 'ios' | 'android';

export type WebRtcMode = 'real' | 'disabled' | 'fake' | 'forward';
export type CanvasMode = 'real' | 'noise' | 'block';
export type WebGlMode = 'real' | 'noise' | 'mask';
export type AudioContextMode = 'real' | 'noise';
export type ClientRectsMode = 'real' | 'noise';
export type BrowserKernel = 'chrome' | 'firefox';
export type GeolocationMode = 'block' | 'prompt' | 'allow';
export type FontsMode = 'default' | 'custom';
export type MediaDevicesMode = 'real' | 'fake' | 'block';

export interface GeolocationConfig {
  mode: GeolocationMode;
  lat?: number;
  lng?: number;
  accuracy?: number;
}

export interface FontsConfig {
  mode: FontsMode;
  list?: string[];
}

export interface FingerprintConfig {
  os: FingerprintOS;
  presetId?: string;
  userAgent?: string;
  osVersion?: string;
  browserVersion?: string;
  browserKernel?: BrowserKernel;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
  webrtc?: WebRtcMode;
  doNotTrack?: boolean;
  portScanProtection?: boolean;
  canvas?: CanvasMode;
  webgl?: WebGlMode;
  webglVendor?: string;
  webglRenderer?: string;
  audioContext?: AudioContextMode;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  platform?: string;
  clientRects?: ClientRectsMode;
  geolocation?: GeolocationConfig;
  fonts?: FontsConfig;
  mediaDevices?: MediaDevicesMode;
}

export interface Profile {
  id: string;
  name: string;
  description: string | null;
  status: ProfileStatus;
  folderId: string | null;
  browserEngine: BrowserEngine;
  fingerprint: FingerprintConfig;
  startUrl: string;
  language: string;
  timezone: string;
  locale: string;
  adBlocker: boolean;
  proxy: ProxyConfig | null;
  userAgent: string | null;
  notes: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  cloudId: string | null;
  syncVersion: number;
}

export interface ProfileWithMeta extends Profile {
  tags: Tag[];
  folderName: string | null;
}

export interface CreateProfileInput {
  name: string;
  description?: string;
  startUrl?: string;
  language?: string;
  timezone?: string;
  locale?: string;
  adBlocker?: boolean;
  proxy?: ProxyConfig | null;
  folderId?: string;
  notes?: string;
  browserEngine?: BrowserEngine;
  fingerprint?: Partial<FingerprintConfig>;
  tagIds?: string[];
}

export interface UpdateProfileInput {
  name?: string;
  description?: string | null;
  startUrl?: string;
  language?: string;
  timezone?: string;
  locale?: string;
  adBlocker?: boolean;
  proxy?: ProxyConfig | null;
  folderId?: string | null;
  notes?: string | null;
  status?: ProfileStatus;
  browserEngine?: BrowserEngine;
  fingerprint?: Partial<FingerprintConfig>;
  tagIds?: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  sortOrder: number;
  createdAt: string;
  profileCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface BrowserPaths {
  chrome: string | null;
  sunbrowser: string | null;
  flowerbrowser: string | null;
}

export interface DetectedBrowsers {
  chrome: boolean;
  sunbrowser: boolean;
  flowerbrowser: boolean;
  paths: BrowserPaths;
}

export type PlanSlug = 'starter' | 'unlimited' | 'enterprise';

export interface LicenseInfo {
  plan: PlanSlug;
  maxProfiles: number;
  activeProfiles: number;
  expiresAt: string | null;
}

export interface SystemMetrics {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  activeProfiles: number;
  totalProfiles: number;
}

export const PLAN_LIMITS: Record<PlanSlug, { maxProfiles: number; maxMembers: number }> = {
  starter: { maxProfiles: 10, maxMembers: 3 },
  unlimited: { maxProfiles: -1, maxMembers: 20 },
  enterprise: { maxProfiles: -1, maxMembers: -1 },
};

export const FINGERPRINT_OS_LABELS: Record<FingerprintOS, string> = {
  windows: 'Windows',
  macos: 'macOS (Apple)',
  ios: 'iOS (iPhone/iPad)',
  android: 'Android',
};

export const BROWSER_ENGINE_LABELS: Record<BrowserEngine, string> = {
  chrome: 'Google Chrome',
  sunbrowser: 'SunBrowser',
  flowerbrowser: 'Flower Browser',
};

/** Engines expostos na UI de criação/edição de perfil (apenas anti-detect). */
export const ANTIDETECT_ENGINE_LABELS: Record<AntidetectEngine, string> = {
  sunbrowser: 'SunBrowser',
  flowerbrowser: 'Flower Browser',
};

export const DEFAULT_FINGERPRINT_UA: Record<FingerprintOS, string> = {
  windows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  macos:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
};

export const FOLDER_COLORS = [
  '#38BDF8', // sky polar
  '#67E8F9', // cyan ice
  '#A5F3FC', // frost
  '#818CF8', // soft indigo
  '#94A3B8', // slate snow
  '#E2E8F0', // white smoke
];

export const TAG_COLORS = [
  '#0EA5E9',
  '#06B6D4',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
];

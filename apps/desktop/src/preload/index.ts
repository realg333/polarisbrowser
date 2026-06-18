import { contextBridge, ipcRenderer } from 'electron';
import type {
  CreateProfileInput,
  ProfileWithMeta,
  SystemMetrics,
  UpdateProfileInput,
  Folder,
  Tag,
  DetectedBrowsers,
  BrowserEngine,
  BrowserPaths,
  AuthState,
  AuthSession,
  LicenseInfo,
  PlanSlug,
  ProxyConfig,
  GeoSyncPatch,
  GeoLookupResult,
} from '@polaris/shared';

export interface PolarisAPI {
  profiles: {
    list: (options?: {
      search?: string;
      status?: string;
      folderId?: string | null;
      tagId?: string;
    }) => Promise<ProfileWithMeta[]>;
    get: (id: string) => Promise<ProfileWithMeta | null>;
    create: (input: CreateProfileInput) => Promise<{ profile?: ProfileWithMeta; error?: string }>;
    update: (id: string, input: UpdateProfileInput) => Promise<ProfileWithMeta | null | { error: string }>;
    delete: (id: string) => Promise<boolean>;
    duplicate: (id: string) => Promise<ProfileWithMeta | null>;
    archive: (id: string) => Promise<ProfileWithMeta | null>;
    launch: (id: string) => Promise<{ success: boolean; error?: string }>;
    launchValidation: (id: string) => Promise<{ success: boolean; error?: string }>;
    stop: (id: string) => Promise<boolean>;
    stats: () => Promise<{
      total: number;
      active: number;
      idle: number;
      archived: number;
      running: number;
    }>;
  };
  folders: {
    list: () => Promise<Folder[]>;
    create: (input: { name: string; parentId?: string | null; color?: string }) => Promise<{ folder?: Folder; error?: string }>;
    update: (id: string, input: { name?: string; color?: string }) => Promise<Folder | null>;
    delete: (id: string) => Promise<boolean>;
  };
  tags: {
    list: () => Promise<Tag[]>;
    create: (input: { name: string; color?: string }) => Promise<{ tag?: Tag; error?: string }>;
    delete: (id: string) => Promise<boolean>;
  };
  browsers: {
    detect: () => Promise<DetectedBrowsers>;
    setPath: (engine: BrowserEngine, path: string | null) => Promise<DetectedBrowsers>;
    getPaths: () => Promise<BrowserPaths>;
    getRuntimeStatus: () => Promise<import('@polaris/shared').BrowserRuntimeStatus[]>;
    installRuntime: (
      engine: import('@polaris/shared').AntidetectEngine,
    ) => Promise<{ success: boolean; error?: string; info?: import('@polaris/shared').BrowserRuntimeInstallInfo }>;
    importRuntime: (
      engine: import('@polaris/shared').AntidetectEngine,
    ) => Promise<{
      success: boolean;
      error?: string;
      detected: DetectedBrowsers;
      info?: import('@polaris/shared').BrowserRuntimeInstallInfo;
    }>;
    checkRuntimeUpdates: () => Promise<import('@polaris/shared').BrowserRuntimeStatus[]>;
    installAllRuntimes: () => Promise<
      Record<
        import('@polaris/shared').AntidetectEngine,
        { success: boolean; error?: string; info?: import('@polaris/shared').BrowserRuntimeInstallInfo }
      >
    >;
    onInstallProgress: (callback: (progress: import('@polaris/shared').BrowserInstallProgress) => void) => () => void;
  };
  monitor: {
    metrics: () => Promise<SystemMetrics>;
  };
  auth: {
    state: () => Promise<AuthState>;
    login: (input: { email: string; password: string }) => Promise<{ session?: AuthSession; error?: string }>;
    register: (input: { email: string; password: string; name: string }) => Promise<{ session?: AuthSession; error?: string }>;
    refresh: () => Promise<{ session?: AuthSession; error?: string }>;
    logout: () => Promise<{ success: boolean }>;
    checkout: (input: { plan: PlanSlug; cycle: 'monthly' | 'yearly' }) => Promise<{ success?: boolean; sessionId?: string; error?: string }>;
    portal: () => Promise<{ success?: boolean; error?: string }>;
  };
  license: {
    info: () => Promise<LicenseInfo>;
    sync: () => Promise<{ success: boolean; error?: string }>;
  };
  proxy: {
    syncGeo: (proxy: ProxyConfig) => Promise<
      | { success: true; geo: GeoLookupResult; patch: GeoSyncPatch }
      | { success: false; error: string }
    >;
    test: (proxy: ProxyConfig) => Promise<
      | { success: true; geo: GeoLookupResult }
      | { success: false; error: string }
    >;
  };
  app: {
    getVersion: () => string;
    getPlatform: () => NodeJS.Platform;
  };
}

const api: PolarisAPI = {
  profiles: {
    list: (options) => ipcRenderer.invoke('profiles:list', options),
    get: (id) => ipcRenderer.invoke('profiles:get', id),
    create: (input) => ipcRenderer.invoke('profiles:create', input),
    update: (id, input) => ipcRenderer.invoke('profiles:update', id, input),
    delete: (id) => ipcRenderer.invoke('profiles:delete', id),
    duplicate: (id) => ipcRenderer.invoke('profiles:duplicate', id),
    archive: (id) => ipcRenderer.invoke('profiles:archive', id),
    launch: (id) => ipcRenderer.invoke('profiles:launch', id),
    launchValidation: (id) => ipcRenderer.invoke('profiles:launchValidation', id),
    stop: (id) => ipcRenderer.invoke('profiles:stop', id),
    stats: () => ipcRenderer.invoke('profiles:stats'),
  },
  folders: {
    list: () => ipcRenderer.invoke('folders:list'),
    create: (input) => ipcRenderer.invoke('folders:create', input),
    update: (id, input) => ipcRenderer.invoke('folders:update', id, input),
    delete: (id) => ipcRenderer.invoke('folders:delete', id),
  },
  tags: {
    list: () => ipcRenderer.invoke('tags:list'),
    create: (input) => ipcRenderer.invoke('tags:create', input),
    delete: (id) => ipcRenderer.invoke('tags:delete', id),
  },
  browsers: {
    detect: () => ipcRenderer.invoke('browsers:detect'),
    setPath: (engine, path) => ipcRenderer.invoke('browsers:setPath', engine, path),
    getPaths: () => ipcRenderer.invoke('browsers:getPaths'),
    getRuntimeStatus: () => ipcRenderer.invoke('browsers:getRuntimeStatus'),
    installRuntime: (engine) => ipcRenderer.invoke('browsers:installRuntime', engine),
    importRuntime: (engine) => ipcRenderer.invoke('browsers:importRuntime', engine),
    checkRuntimeUpdates: () => ipcRenderer.invoke('browsers:checkRuntimeUpdates'),
    installAllRuntimes: () => ipcRenderer.invoke('browsers:installAllRuntimes'),
    onInstallProgress: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: import('@polaris/shared').BrowserInstallProgress) =>
        callback(progress);
      ipcRenderer.on('browsers:installProgress', handler);
      return () => ipcRenderer.removeListener('browsers:installProgress', handler);
    },
  },
  monitor: {
    metrics: () => ipcRenderer.invoke('monitor:metrics'),
  },
  auth: {
    state: () => ipcRenderer.invoke('auth:state'),
    login: (input) => ipcRenderer.invoke('auth:login', input),
    register: (input) => ipcRenderer.invoke('auth:register', input),
    refresh: () => ipcRenderer.invoke('auth:refresh'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    checkout: (input) => ipcRenderer.invoke('auth:checkout', input),
    portal: () => ipcRenderer.invoke('auth:portal'),
  },
  license: {
    info: () => ipcRenderer.invoke('license:info'),
    sync: () => ipcRenderer.invoke('license:sync'),
  },
  proxy: {
    syncGeo: (proxy) => ipcRenderer.invoke('proxy:syncGeo', proxy),
    test: (proxy) => ipcRenderer.invoke('proxy:test', proxy),
  },
  app: {
    getVersion: () => process.env.npm_package_version ?? '0.1.0',
    getPlatform: () => process.platform,
  },
};

contextBridge.exposeInMainWorld('polaris', api);

declare global {
  interface Window {
    polaris: PolarisAPI;
  }
}

import type { BrowserRuntimeManifest } from '../types/browser-runtime';

/** Manifest embutido — atualizado via remoteManifestUrl ou releases Polaris. */
export const BUNDLED_BROWSER_RUNTIME_MANIFEST: BrowserRuntimeManifest = {
  manifestVersion: 1,
  updatedAt: '2026-06-17',
  remoteManifestUrl:
    'https://raw.githubusercontent.com/realg333/polarisbrowser/main/apps/desktop/resources/browser-runtimes.manifest.json',
  cdnBaseUrl: 'https://github.com/realg333/polarisbrowser/releases/download/runtimes-v1',
  cdnPathTemplate: '{engine}-{platform}-{version}.zip',
  engines: {
    sunbrowser: {
      label: 'SunBrowser',
      description: 'Motor Chromium anti-detect para fingerprints',
      kernelFamily: 'chromium',
      kernelApiType: 'Chrome',
      platforms: {
        'win32-x64': {
          version: '148.0.7778.97',
          kernelMajor: '148',
          executable: 'SunBrowser.exe',
          importCandidates: [
            '%LOCALAPPDATA%/SunBrowser/SunBrowser.exe',
            '%PROGRAMFILES%/SunBrowser/SunBrowser.exe',
            '%LOCALAPPDATA%/AdsPower Global/sunbrowser.exe',
            '%PROGRAMFILES%/AdsPower Global/sunbrowser.exe',
          ],
        },
      },
    },
    flowerbrowser: {
      label: 'Flower Browser',
      description: 'Motor Firefox anti-detect para fingerprints',
      kernelFamily: 'firefox',
      kernelApiType: 'Firefox',
      platforms: {
        'win32-x64': {
          version: '128.0.0.0',
          kernelMajor: '128',
          executable: 'FlowerBrowser.exe',
          importCandidates: [
            '%LOCALAPPDATA%/FlowerBrowser/FlowerBrowser.exe',
            '%PROGRAMFILES%/FlowerBrowser/FlowerBrowser.exe',
            '%PROGRAMFILES%/Flower Browser/FlowerBrowser.exe',
            '%LOCALAPPDATA%/AdsPower Global/FlowerBrowser.exe',
          ],
        },
      },
    },
  },
};

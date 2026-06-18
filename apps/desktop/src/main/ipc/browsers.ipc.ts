import { ipcMain, type WebContents } from 'electron';
import type { AntidetectEngine, BrowserEngine } from '@polaris/shared';
import { browserPathService } from '../modules/browsers/BrowserPathService';
import { browserRuntimeService } from '../modules/browsers/BrowserRuntimeService';

function sendProgress(webContents: WebContents, payload: unknown): void {
  if (!webContents.isDestroyed()) {
    webContents.send('browsers:installProgress', payload);
  }
}

export function registerBrowserIpc(): void {
  ipcMain.handle('browsers:detect', () => browserPathService.detect());

  ipcMain.handle('browsers:setPath', (_event, engine: BrowserEngine, path: string | null) => {
    browserPathService.setCustomPath(engine, path);
    return browserPathService.detect();
  });

  ipcMain.handle('browsers:getPaths', () => browserPathService.getCustomPaths());

  ipcMain.handle('browsers:getRuntimeStatus', async () => {
    await browserRuntimeService.refreshManifest();
    return browserRuntimeService.getAllStatus();
  });

  ipcMain.handle('browsers:installRuntime', async (event, engine: AntidetectEngine) => {
    const wc = event.sender;
    return browserRuntimeService.install(engine, (progress) => sendProgress(wc, progress));
  });

  ipcMain.handle('browsers:importRuntime', (_event, engine: AntidetectEngine) => {
    const info = browserRuntimeService.tryImport(engine);
    return {
      success: !!info,
      info,
      detected: browserPathService.detect(),
      error: info ? undefined : 'Não encontrado. Use Baixar tudo na Central de Download ou informe o caminho do .exe.',
    };
  });

  ipcMain.handle('browsers:checkRuntimeUpdates', async () => {
    await browserRuntimeService.refreshManifest();
    return browserRuntimeService.getAllStatus();
  });

  ipcMain.handle('browsers:installAllRuntimes', async (event) => {
    const wc = event.sender;
    return browserRuntimeService.installAll((progress) => sendProgress(wc, progress));
  });
}

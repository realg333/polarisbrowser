import 'dotenv/config';
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { createMainWindow } from './window';
import { registerProfileIpc } from './ipc/profiles.ipc';
import { registerMonitorIpc } from './ipc/monitor.ipc';
import { registerFolderIpc } from './ipc/folders.ipc';
import { registerTagIpc } from './ipc/tags.ipc';
import { registerBrowserIpc } from './ipc/browsers.ipc';
import { registerAuthIpc, registerLicenseIpc } from './ipc/auth.ipc';
import { registerProxyIpc } from './ipc/proxy.ipc';
import { initDatabase } from './database/connection';
import { licenseValidator } from './modules/license/LicenseValidator';
import { browserRuntimeService } from './modules/browsers/BrowserRuntimeService';

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    initDatabase();
    await browserRuntimeService.bootstrap();
    registerProfileIpc();
    registerMonitorIpc();
    registerFolderIpc();
    registerTagIpc();
    registerBrowserIpc();
    registerProxyIpc();
    registerAuthIpc();
    registerLicenseIpc();

    licenseValidator.applyOfflineCache();
    await licenseValidator.sync().catch(() => undefined);

    mainWindow = createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  });
}

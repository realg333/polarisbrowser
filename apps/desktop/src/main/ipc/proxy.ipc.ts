import { ipcMain } from 'electron';
import type { ProxyConfig } from '@polaris/shared';
import { buildGeoSyncPatch } from '@polaris/shared';
import { proxyGeoService } from '../modules/proxy/ProxyGeoService';

export function registerProxyIpc(): void {
  ipcMain.handle('proxy:syncGeo', async (_event, proxy: ProxyConfig) => {
    try {
      const geo = await proxyGeoService.resolveFromProxy(proxy);
      return { success: true as const, geo, patch: buildGeoSyncPatch(geo) };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sincronizar geo';
      return { success: false as const, error: message };
    }
  });

  ipcMain.handle('proxy:test', async (_event, proxy: ProxyConfig) => {
    try {
      const geo = await proxyGeoService.resolveFromProxy(proxy);
      return { success: true as const, geo };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Proxy inacessível';
      return { success: false as const, error: message };
    }
  });
}

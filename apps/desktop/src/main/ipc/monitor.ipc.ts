import os from 'os';
import { ipcMain } from 'electron';
import type { SystemMetrics } from '@polaris/shared';
import { profileManager } from '../modules/profiles/ProfileManager';

function getSystemMetrics(): SystemMetrics {
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce(
    (acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq,
    0,
  );
  const cpuPercent = Math.round((1 - totalIdle / totalTick) * 100);

  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const memoryUsedMb = Math.round((totalMem - freeMem) / 1024 / 1024);
  const memoryTotalMb = Math.round(totalMem / 1024 / 1024);

  const stats = profileManager.getStats();

  return {
    cpuPercent,
    memoryUsedMb,
    memoryTotalMb,
    activeProfiles: stats.running,
    totalProfiles: stats.total,
  };
}

export function registerMonitorIpc(): void {
  ipcMain.handle('monitor:metrics', () => getSystemMetrics());
}

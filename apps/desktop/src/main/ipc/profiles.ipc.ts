import { ipcMain } from 'electron';
import { createProfileSchema, updateProfileSchema } from '@polaris/shared';
import { profileManager } from '../modules/profiles/ProfileManager';

export function registerProfileIpc(): void {
  ipcMain.handle('profiles:list', (_event, options?: { search?: string; status?: string; folderId?: string | null; tagId?: string }) => {
    return profileManager.list(options);
  });

  ipcMain.handle('profiles:get', (_event, id: string) => {
    return profileManager.getById(id);
  });

  ipcMain.handle('profiles:create', (_event, input: unknown) => {
    const parsed = createProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };
    }
    return profileManager.create(parsed.data);
  });

  ipcMain.handle('profiles:update', (_event, id: string, input: unknown) => {
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };
    }
    return profileManager.update(id, parsed.data);
  });

  ipcMain.handle('profiles:delete', (_event, id: string) => {
    return profileManager.delete(id);
  });

  ipcMain.handle('profiles:duplicate', (_event, id: string) => {
    return profileManager.duplicate(id);
  });

  ipcMain.handle('profiles:archive', (_event, id: string) => {
    return profileManager.archive(id);
  });

  ipcMain.handle('profiles:launch', (_event, id: string) => {
    return profileManager.launch(id);
  });

  ipcMain.handle('profiles:launchValidation', (_event, id: string) => {
    return profileManager.launch(id, { validation: true });
  });

  ipcMain.handle('profiles:stop', (_event, id: string) => {
    return profileManager.stop(id);
  });

  ipcMain.handle('profiles:stats', () => {
    return profileManager.getStats();
  });
}

import { ipcMain } from 'electron';
import { createFolderSchema } from '@polaris/shared';
import { FolderRepository } from '../modules/folders/FolderRepository';

const folderRepo = new FolderRepository();

export function registerFolderIpc(): void {
  ipcMain.handle('folders:list', () => folderRepo.findAll());

  ipcMain.handle('folders:create', (_event, input: unknown) => {
    const parsed = createFolderSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };
    }
    return { folder: folderRepo.create(parsed.data) };
  });

  ipcMain.handle('folders:update', (_event, id: string, input: { name?: string; color?: string }) => {
    return folderRepo.update(id, input);
  });

  ipcMain.handle('folders:delete', (_event, id: string) => folderRepo.delete(id));
}

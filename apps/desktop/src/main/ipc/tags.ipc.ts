import { ipcMain } from 'electron';
import { createTagSchema } from '@polaris/shared';
import { TagRepository } from '../modules/tags/TagRepository';

const tagRepo = new TagRepository();

export function registerTagIpc(): void {
  ipcMain.handle('tags:list', () => tagRepo.findAll());

  ipcMain.handle('tags:create', (_event, input: unknown) => {
    const parsed = createTagSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dados inválidos' };
    }
    try {
      return { tag: tagRepo.create(parsed.data) };
    } catch {
      return { error: 'Tag já existe ou nome inválido' };
    }
  });

  ipcMain.handle('tags:delete', (_event, id: string) => tagRepo.delete(id));
}

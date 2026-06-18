import { eq, asc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { Folder } from '@polaris/shared';
import { getDatabase } from '../../database/connection';
import { folders, profiles } from '../../database/schema';
import type { DbFolder } from '../../database/schema';

function mapFolder(row: DbFolder, profileCount?: number): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    color: row.color,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    profileCount,
  };
}

export class FolderRepository {
  findAll(): Folder[] {
    const db = getDatabase();
    const rows = db.select().from(folders).orderBy(asc(folders.sortOrder), asc(folders.name)).all();

    const counts = db
      .select({
        folderId: profiles.folderId,
        count: sql<number>`count(*)`,
      })
      .from(profiles)
      .where(sql`${profiles.status} != 'archived'`)
      .groupBy(profiles.folderId)
      .all();

    const countMap = new Map(counts.map((c) => [c.folderId, c.count]));

    return rows.map((row) => mapFolder(row, countMap.get(row.id) ?? 0));
  }

  findById(id: string): Folder | null {
    const db = getDatabase();
    const row = db.select().from(folders).where(eq(folders.id, id)).get();
    return row ? mapFolder(row) : null;
  }

  create(input: { name: string; parentId?: string | null; color?: string }): Folder {
    const db = getDatabase();
    const now = new Date().toISOString();
    const maxOrder = db
      .select({ max: sql<number>`coalesce(max(${folders.sortOrder}), 0)` })
      .from(folders)
      .get();

    const row: DbFolder = {
      id: uuidv4(),
      name: input.name,
      parentId: input.parentId ?? null,
      color: input.color ?? '#38BDF8',
      sortOrder: (maxOrder?.max ?? 0) + 1,
      createdAt: now,
    };

    db.insert(folders).values(row).run();
    return mapFolder(row, 0);
  }

  update(id: string, input: { name?: string; color?: string; parentId?: string | null }): Folder | null {
    const db = getDatabase();
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: Partial<DbFolder> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.color !== undefined) updates.color = input.color;
    if (input.parentId !== undefined) updates.parentId = input.parentId;

    db.update(folders).set(updates).where(eq(folders.id, id)).run();
    return this.findById(id);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    db.update(profiles).set({ folderId: null }).where(eq(profiles.folderId, id)).run();
    const result = db.delete(folders).where(eq(folders.id, id)).run();
    return result.changes > 0;
  }
}

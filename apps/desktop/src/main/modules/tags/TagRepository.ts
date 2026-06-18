import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { Tag } from '@polaris/shared';
import { getDatabase } from '../../database/connection';
import { tags, profileTags } from '../../database/schema';
import type { DbTag } from '../../database/schema';

function mapTag(row: DbTag): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.createdAt,
  };
}

export class TagRepository {
  findAll(): Tag[] {
    const db = getDatabase();
    return db.select().from(tags).orderBy(asc(tags.name)).all().map(mapTag);
  }

  findByProfileId(profileId: string): Tag[] {
    const db = getDatabase();
    const rows = db
      .select({ tag: tags })
      .from(profileTags)
      .innerJoin(tags, eq(profileTags.tagId, tags.id))
      .where(eq(profileTags.profileId, profileId))
      .all();

    return rows.map((r) => mapTag(r.tag));
  }

  create(input: { name: string; color?: string }): Tag {
    const db = getDatabase();
    const now = new Date().toISOString();

    const row: DbTag = {
      id: uuidv4(),
      name: input.name.toLowerCase().trim(),
      color: input.color ?? '#0EA5E9',
      createdAt: now,
    };

    db.insert(tags).values(row).run();
    return mapTag(row);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.delete(tags).where(eq(tags.id, id)).run();
    return result.changes > 0;
  }

  setProfileTags(profileId: string, tagIds: string[]): void {
    const db = getDatabase();
    db.delete(profileTags).where(eq(profileTags.profileId, profileId)).run();

    for (const tagId of tagIds) {
      db.insert(profileTags).values({ profileId, tagId }).run();
    }
  }
}

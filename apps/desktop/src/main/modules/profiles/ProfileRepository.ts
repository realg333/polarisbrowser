import { eq, desc, like, or, and, ne, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type {
  CreateProfileInput,
  Profile,
  ProfileWithMeta,
  UpdateProfileInput,
  FingerprintConfig,
  BrowserEngine,
  ProxyConfig,
} from '@polaris/shared';
import { resolveFingerprint } from '@polaris/shared';
import { getDatabase } from '../../database/connection';
import { profiles, folders, tags, profileTags } from '../../database/schema';
import type { DbProfile } from '../../database/schema';
import { TagRepository } from '../tags/TagRepository';

function parseFingerprint(json: string): FingerprintConfig {
  try {
    const parsed = JSON.parse(json) as Partial<FingerprintConfig>;
    return resolveFingerprint(parsed);
  } catch {
    return resolveFingerprint({ os: 'windows' });
  }
}

function parseProxy(json: string | null | undefined): ProxyConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ProxyConfig;
  } catch {
    return null;
  }
}

function mapProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status as Profile['status'],
    folderId: row.folderId,
    browserEngine: (row.browserEngine ?? 'sunbrowser') as BrowserEngine,
    fingerprint: parseFingerprint(row.fingerprintConfig ?? '{}'),
    startUrl: row.startUrl,
    language: row.language,
    timezone: row.timezone,
    locale: row.locale,
    adBlocker: row.adBlocker,
    proxy: parseProxy(row.proxyConfig),
    userAgent: row.userAgent,
    notes: row.notes,
    lastUsedAt: row.lastUsedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
    cloudId: row.cloudId,
    syncVersion: row.syncVersion,
  };
}

export class ProfileRepository {
  private readonly tagRepo = new TagRepository();

  findAll(options?: {
    search?: string;
    status?: string;
    folderId?: string | null;
    tagId?: string;
    includeArchived?: boolean;
  }): ProfileWithMeta[] {
    const db = getDatabase();
    const conditions = [];

    if (!options?.includeArchived) {
      conditions.push(ne(profiles.status, 'archived'));
    }

    if (options?.status) {
      conditions.push(eq(profiles.status, options.status));
    }

    if (options?.folderId !== undefined) {
      if (options.folderId === null) {
        conditions.push(sql`${profiles.folderId} IS NULL`);
      } else {
        conditions.push(eq(profiles.folderId, options.folderId));
      }
    }

    if (options?.search) {
      const term = `%${options.search}%`;
      conditions.push(or(like(profiles.name, term), like(profiles.notes, term))!);
    }

    let rows = db
      .select()
      .from(profiles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(profiles.lastUsedAt), desc(profiles.createdAt))
      .all();

    if (options?.tagId) {
      const tagged = db
        .select({ profileId: profileTags.profileId })
        .from(profileTags)
        .where(eq(profileTags.tagId, options.tagId))
        .all();
      const ids = new Set(tagged.map((t) => t.profileId));
      rows = rows.filter((r) => ids.has(r.id));
    }

    const folderMap = new Map(
      db.select().from(folders).all().map((f) => [f.id, f.name]),
    );

    return rows.map((row) => ({
      ...mapProfile(row),
      tags: this.tagRepo.findByProfileId(row.id),
      folderName: row.folderId ? (folderMap.get(row.folderId) ?? null) : null,
    }));
  }

  findById(id: string): ProfileWithMeta | null {
    const db = getDatabase();
    const row = db.select().from(profiles).where(eq(profiles.id, id)).get();
    if (!row) return null;

    const folder = row.folderId
      ? db.select().from(folders).where(eq(folders.id, row.folderId)).get()
      : null;

    return {
      ...mapProfile(row),
      tags: this.tagRepo.findByProfileId(id),
      folderName: folder?.name ?? null,
    };
  }

  countActive(): number {
    const db = getDatabase();
    const result = db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(ne(profiles.status, 'archived'))
      .get();
    return result?.count ?? 0;
  }

  create(input: CreateProfileInput): ProfileWithMeta {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = uuidv4();
    const fingerprint = resolveFingerprint({
      ...input.fingerprint,
      language: input.language ?? input.fingerprint?.language,
      timezone: input.timezone ?? input.fingerprint?.timezone,
    });

    const row: DbProfile = {
      id,
      name: input.name,
      description: input.description ?? null,
      status: 'idle',
      folderId: input.folderId ?? null,
      browserEngine: input.browserEngine ?? 'sunbrowser',
      fingerprintConfig: JSON.stringify(fingerprint),
      startUrl: input.startUrl ?? 'about:blank',
      language: input.language ?? 'pt-BR',
      timezone: input.timezone ?? 'America/Sao_Paulo',
      locale: input.locale ?? 'pt-BR',
      adBlocker: input.adBlocker ?? false,
      proxyConfig: input.proxy ? JSON.stringify(input.proxy) : null,
      userAgent: fingerprint.userAgent ?? null,
      notes: input.notes ?? null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
      cloudId: null,
      syncVersion: 1,
    };

    db.insert(profiles).values(row).run();

    if (input.tagIds?.length) {
      this.tagRepo.setProfileTags(id, input.tagIds);
    }

    return this.findById(id)!;
  }

  update(id: string, input: UpdateProfileInput): ProfileWithMeta | null {
    const db = getDatabase();
    const existing = this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updates: Partial<DbProfile> = {
      updatedAt: now,
      syncVersion: existing.syncVersion + 1,
    };

    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.startUrl !== undefined) updates.startUrl = input.startUrl;
    if (input.language !== undefined) updates.language = input.language;
    if (input.timezone !== undefined) updates.timezone = input.timezone;
    if (input.locale !== undefined) updates.locale = input.locale;
    if (input.adBlocker !== undefined) updates.adBlocker = input.adBlocker;
    if (input.proxy !== undefined) {
      updates.proxyConfig = input.proxy ? JSON.stringify(input.proxy) : null;
    }
    if (input.folderId !== undefined) updates.folderId = input.folderId;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.browserEngine !== undefined) updates.browserEngine = input.browserEngine;
    if (input.fingerprint !== undefined) {
      const fingerprint = resolveFingerprint({
        ...existing.fingerprint,
        ...input.fingerprint,
        language: input.language ?? input.fingerprint.language ?? existing.language,
        timezone: input.timezone ?? input.fingerprint.timezone ?? existing.timezone,
      });
      updates.fingerprintConfig = JSON.stringify(fingerprint);
      updates.userAgent = fingerprint.userAgent ?? null;
    }
    if (input.status !== undefined) {
      updates.status = input.status;
      updates.archivedAt = input.status === 'archived' ? now : null;
    }

    db.update(profiles).set(updates).where(eq(profiles.id, id)).run();

    if (input.tagIds !== undefined) {
      this.tagRepo.setProfileTags(id, input.tagIds);
    }

    return this.findById(id);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.delete(profiles).where(eq(profiles.id, id)).run();
    return result.changes > 0;
  }

  duplicate(id: string): ProfileWithMeta | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const copy = this.create({
      name: `${existing.name} (cópia)`,
      description: existing.description ?? undefined,
      startUrl: existing.startUrl,
      language: existing.language,
      timezone: existing.timezone,
      locale: existing.locale,
      adBlocker: existing.adBlocker,
      proxy: existing.proxy ?? undefined,
      folderId: existing.folderId ?? undefined,
      notes: existing.notes ?? undefined,
      browserEngine: existing.browserEngine,
      fingerprint: existing.fingerprint,
      tagIds: existing.tags.map((t) => t.id),
    });

    return copy;
  }

  markLaunched(id: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.update(profiles)
      .set({ status: 'running', lastUsedAt: now, updatedAt: now })
      .where(eq(profiles.id, id))
      .run();
  }

  markStopped(id: string): void {
    const db = getDatabase();
    db.update(profiles)
      .set({ status: 'idle', updatedAt: new Date().toISOString() })
      .where(eq(profiles.id, id))
      .run();
  }
}

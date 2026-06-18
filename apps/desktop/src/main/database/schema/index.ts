import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  color: text('color').notNull().default('#38BDF8'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('idle'),
  folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  browserEngine: text('browser_engine').notNull().default('sunbrowser'),
  fingerprintConfig: text('fingerprint_config').notNull().default('{}'),
  startUrl: text('start_url').notNull().default('about:blank'),
  language: text('language').notNull().default('pt-BR'),
  timezone: text('timezone').notNull().default('America/Sao_Paulo'),
  locale: text('locale').notNull().default('pt-BR'),
  adBlocker: integer('ad_blocker', { mode: 'boolean' }).notNull().default(false),
  proxyConfig: text('proxy_config'),
  userAgent: text('user_agent'),
  notes: text('notes'),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  archivedAt: text('archived_at'),
  cloudId: text('cloud_id'),
  syncVersion: integer('sync_version').notNull().default(1),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull().default('#0EA5E9'),
  createdAt: text('created_at').notNull(),
});

export const profileTags = sqliteTable('profile_tags', {
  profileId: text('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
});

export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const licenseCache = sqliteTable('license_cache', {
  id: text('id').primaryKey(),
  plan: text('plan').notNull(),
  maxProfiles: integer('max_profiles').notNull(),
  expiresAt: text('expires_at').notNull(),
  signature: text('signature').notNull(),
  payload: text('payload').notNull(),
  cachedAt: text('cached_at').notNull(),
});

export type DbProfile = typeof profiles.$inferSelect;
export type DbProfileInsert = typeof profiles.$inferInsert;
export type DbFolder = typeof folders.$inferSelect;
export type DbTag = typeof tags.$inferSelect;

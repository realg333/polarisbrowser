import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as schema from './schema';

let db: BetterSQLite3Database<typeof schema> | null = null;
let sqlite: Database.Database | null = null;

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  color TEXT NOT NULL DEFAULT '#6366F1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idle' CHECK(status IN ('idle','running','archived')),
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  start_url TEXT NOT NULL DEFAULT 'about:blank',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  ad_blocker INTEGER NOT NULL DEFAULT 0,
  user_agent TEXT,
  notes TEXT,
  last_used_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  cloud_id TEXT,
  sync_version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_folder ON profiles(folder_id);
CREATE INDEX IF NOT EXISTS idx_profiles_last_used ON profiles(last_used_at);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366F1',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile_tags (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, tag_id)
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS license_cache (
  id TEXT PRIMARY KEY,
  plan TEXT NOT NULL,
  max_profiles INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  signature TEXT NOT NULL,
  payload TEXT NOT NULL,
  cached_at TEXT NOT NULL
);
`;

export function initDatabase(): BetterSQLite3Database<typeof schema> {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbDir = join(userDataPath, 'data');

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = join(dbDir, 'polaris.db');
  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(MIGRATION_SQL);
  runMigrations(sqlite);

  db = drizzle(sqlite, { schema });
  return db;
}

function runMigrations(database: Database.Database): void {
  const columns = database.prepare(`PRAGMA table_info(profiles)`).all() as { name: string }[];
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has('browser_engine')) {
    database.exec(`ALTER TABLE profiles ADD COLUMN browser_engine TEXT NOT NULL DEFAULT 'sunbrowser'`);
  }
  if (!columnNames.has('fingerprint_config')) {
    database.exec(`ALTER TABLE profiles ADD COLUMN fingerprint_config TEXT NOT NULL DEFAULT '{"os":"windows"}'`);
  }
  if (!columnNames.has('proxy_config')) {
    database.exec(`ALTER TABLE profiles ADD COLUMN proxy_config TEXT`);
  }
}

export function getDatabase(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  sqlite?.close();
  sqlite = null;
  db = null;
}

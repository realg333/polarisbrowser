# 3. Banco de Dados — Polaris Browser

## Estratégia Dual-Database

| Banco | Uso | ORM |
|-------|-----|-----|
| **SQLite** (SQLCipher) | Dados locais, offline-first | Drizzle ORM |
| **PostgreSQL** | Sync cloud, multi-tenant, billing | Drizzle ORM + Supabase RLS |

---

## SQLite Local (Desktop)

### Diagrama ER

```mermaid
erDiagram
    profiles ||--o{ profile_tags : has
    profiles ||--o| proxy_assignments : uses
    profiles }o--|| folders : belongs_to
    profiles ||--o{ profile_sessions : launches
    profiles ||--o{ profile_bookmarks : has
    profiles ||--o{ profile_extensions : has
    tags ||--o{ profile_tags : tagged
    proxy_pools ||--o{ proxies : contains
    proxies ||--o{ proxy_assignments : assigned
    proxy_pools ||--o{ proxy_usage_logs : tracks
    sync_queue ||--|| profiles : syncs
    scheduled_tasks ||--o{ task_logs : executes

    profiles {
        text id PK
        text name
        text description
        text status
        text folder_id FK
        text start_url
        text language
        text timezone
        text locale
        boolean ad_blocker
        text user_agent
        text fingerprint_config
        text notes
        datetime last_used_at
        datetime created_at
        datetime updated_at
        datetime archived_at
        text cloud_id
        int sync_version
    }

    folders {
        text id PK
        text name
        text parent_id FK
        text color
        int sort_order
        datetime created_at
    }

    tags {
        text id PK
        text name
        text color
        datetime created_at
    }

    profile_tags {
        text profile_id FK
        text tag_id FK
    }

    proxy_pools {
        text id PK
        text name
        text provider
        text rotation_mode
        int rotation_interval
        datetime created_at
    }

    proxies {
        text id PK
        text pool_id FK
        text type
        text host
        int port
        text username
        text password_encrypted
        text country
        int latency_ms
        text status
        datetime last_checked_at
        datetime created_at
    }

    proxy_assignments {
        text id PK
        text profile_id FK
        text proxy_id FK
        text pool_id FK
        datetime assigned_at
    }

    proxy_usage_logs {
        text id PK
        text pool_id FK
        text proxy_id FK
        text profile_id FK
        int bytes_sent
        int bytes_received
        datetime started_at
        datetime ended_at
    }

    profile_sessions {
        text id PK
        text profile_id FK
        text pid
        text status
        datetime started_at
        datetime ended_at
        int memory_mb
        float cpu_percent
    }

    profile_bookmarks {
        text id PK
        text profile_id FK
        text title
        text url
        int sort_order
    }

    profile_extensions {
        text id PK
        text profile_id FK
        text extension_id
        text name
        boolean enabled
    }

    sync_queue {
        text id PK
        text entity_type
        text entity_id
        text operation
        text payload
        text status
        int retry_count
        datetime created_at
        datetime processed_at
    }

    scheduled_tasks {
        text id PK
        text name
        text type
        text cron_expression
        text payload
        boolean enabled
        datetime last_run_at
        datetime next_run_at
    }

    task_logs {
        text id PK
        text task_id FK
        text status
        text result
        datetime executed_at
    }

    app_settings {
        text key PK
        text value
        datetime updated_at
    }

    license_cache {
        text id PK
        text plan
        int max_profiles
        datetime expires_at
        text signature
        datetime cached_at
    }
```

### DDL SQLite (Principais Tabelas)

```sql
-- Perfis de navegação
CREATE TABLE profiles (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'idle'
                    CHECK(status IN ('idle','running','archived')),
    folder_id       TEXT REFERENCES folders(id) ON DELETE SET NULL,
    start_url       TEXT DEFAULT 'about:blank',
    language        TEXT DEFAULT 'pt-BR',
    timezone        TEXT DEFAULT 'America/Sao_Paulo',
    locale          TEXT DEFAULT 'pt-BR',
    ad_blocker      INTEGER NOT NULL DEFAULT 0,
    user_agent      TEXT,
    fingerprint_config TEXT,  -- JSON criptografado
    notes           TEXT,
    last_used_at    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    archived_at     TEXT,
    cloud_id        TEXT,
    sync_version    INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_folder ON profiles(folder_id);
CREATE INDEX idx_profiles_last_used ON profiles(last_used_at);

-- Fila de sincronização
CREATE TABLE sync_queue (
    id              TEXT PRIMARY KEY,
    entity_type     TEXT NOT NULL,
    entity_id       TEXT NOT NULL,
    operation       TEXT NOT NULL CHECK(operation IN ('create','update','delete')),
    payload         TEXT NOT NULL,  -- JSON
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','processing','done','failed')),
    retry_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    processed_at    TEXT
);

CREATE INDEX idx_sync_queue_status ON sync_queue(status);
```

---

## PostgreSQL Cloud

### Diagrama ER

```mermaid
erDiagram
    organizations ||--o{ workspaces : owns
    workspaces ||--o{ workspace_members : has
    workspaces ||--o{ subscriptions : billed
    workspaces ||--o{ sync_snapshots : versions
    workspaces ||--o{ activity_logs : tracks
    workspaces ||--o{ audit_logs : audits
    users ||--o{ workspace_members : joins
    users ||--o{ subscriptions : pays
    subscriptions ||--o{ invoices : generates
    subscriptions }o--|| plans : on
    coupons ||--o{ coupon_redemptions : used
    affiliates ||--o{ affiliate_referrals : refers
    webhooks ||--o{ webhook_deliveries : sends

    organizations {
        uuid id PK
        text name
        text slug
        datetime created_at
    }

    workspaces {
        uuid id PK
        uuid org_id FK
        text name
        text settings
        datetime created_at
    }

    users {
        uuid id PK
        text email
        text name
        text avatar_url
        text role
        datetime created_at
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        text role
        text permissions
        datetime invited_at
        datetime joined_at
    }

    plans {
        uuid id PK
        text name
        text slug
        int max_profiles
        int max_members
        int price_monthly_cents
        int price_yearly_cents
        text stripe_price_id_monthly
        text stripe_price_id_yearly
    }

    subscriptions {
        uuid id PK
        uuid workspace_id FK
        uuid plan_id FK
        text stripe_subscription_id
        text status
        text billing_cycle
        datetime current_period_start
        datetime current_period_end
        datetime canceled_at
    }

    sync_snapshots {
        uuid id PK
        uuid workspace_id FK
        uuid device_id
        text entity_type
        text entity_id
        int version
        text data_encrypted
        text checksum
        datetime created_at
    }

    activity_logs {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        text action
        text entity_type
        text entity_id
        text metadata
        datetime created_at
    }

    audit_logs {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        text event
        text ip_address
        text user_agent
        text before_state
        text after_state
        datetime created_at
    }

    webhooks {
        uuid id PK
        uuid workspace_id FK
        text url
        text secret
        text events
        boolean active
        datetime created_at
    }

    coupons {
        uuid id PK
        text code
        text type
        int value
        int max_uses
        int times_used
        datetime expires_at
    }

    affiliates {
        uuid id PK
        uuid user_id FK
        text code
        float commission_rate
        int total_referrals
        int total_earnings_cents
    }
```

### Row-Level Security (Supabase)

```sql
-- Membros só veem dados do seu workspace
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspace_isolation ON workspaces
    FOR ALL USING (
        id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- Audit logs são append-only
CREATE POLICY audit_read_only ON audit_logs
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid() AND role IN ('owner','admin')
        )
    );
```

### Planos Seed

```sql
INSERT INTO plans (id, name, slug, max_profiles, max_members, price_monthly_cents, price_yearly_cents) VALUES
    ('plan_starter',   'Starter',   'starter',   10,  3,  2990, 1990),
    ('plan_unlimited', 'Unlimited', 'unlimited', -1, 20,  4990, 3990);
```

---

## Estratégia de Sync

| Campo | Local (SQLite) | Cloud (PG) |
|-------|----------------|------------|
| Perfis | Fonte primária offline | Snapshot versionado |
| Proxies | Local only (segurança) | Não sincroniza credenciais |
| Settings | Merge por campo | Workspace-level defaults |
| Tags/Folders | Bidirectional sync | Sim |
| Sessions | Local only | Não |
| Audit | Push to cloud | Fonte de verdade |

### Fluxo de Conflito

```
1. Device A edita profile X → sync_version = 5
2. Device B edita profile X offline → sync_version = 5
3. Device A sync first → cloud version = 6
4. Device B sync → conflito detectado (version mismatch)
5. UI apresenta: "Manter local" | "Usar cloud" | "Mesclar"
```

---

## Índices de Performance

```sql
-- PostgreSQL
CREATE INDEX idx_activity_logs_workspace_date ON activity_logs(workspace_id, created_at DESC);
CREATE INDEX idx_sync_snapshots_lookup ON sync_snapshots(workspace_id, entity_type, entity_id, version DESC);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id, created_at DESC);
```

## Backup e Retenção

| Tipo | Frequência | Retenção |
|------|------------|----------|
| Sync snapshot | A cada sync | 30 versões por entidade |
| Full workspace backup | Diário | 90 dias |
| Audit logs | Contínuo | 2 anos (LGPD) |
| Local SQLite | A cada alteração | WAL mode + auto-vacuum |

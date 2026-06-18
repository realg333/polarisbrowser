# 2. Estrutura de Pastas — Polaris Browser

Monorepo gerenciado com **pnpm workspaces** + **Turborepo**.

```
polaris-browser/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, test, build
│   │   ├── release-desktop.yml       # Build Electron (Win/Mac)
│   │   └── deploy-api.yml            # Deploy API cloud
│   └── CODEOWNERS
│
├── apps/
│   ├── desktop/                      # Electron app
│   │   ├── src/
│   │   │   ├── main/                 # Main process
│   │   │   │   ├── index.ts
│   │   │   │   ├── window.ts
│   │   │   │   ├── ipc/              # IPC handlers
│   │   │   │   │   ├── profiles.ipc.ts
│   │   │   │   │   ├── proxy.ipc.ts
│   │   │   │   │   ├── sync.ipc.ts
│   │   │   │   │   ├── license.ipc.ts
│   │   │   │   │   └── monitor.ipc.ts
│   │   │   │   ├── modules/
│   │   │   │   │   ├── profiles/
│   │   │   │   │   │   ├── ProfileManager.ts
│   │   │   │   │   │   ├── BrowserLauncher.ts
│   │   │   │   │   │   └── ProfileRepository.ts
│   │   │   │   │   ├── proxy/
│   │   │   │   │   │   ├── ProxyManager.ts
│   │   │   │   │   │   ├── ProxyTester.ts
│   │   │   │   │   │   └── ProxyRotator.ts
│   │   │   │   │   ├── sync/
│   │   │   │   │   │   ├── SyncEngine.ts
│   │   │   │   │   │   └── ConflictResolver.ts
│   │   │   │   │   ├── license/
│   │   │   │   │   │   └── LicenseValidator.ts
│   │   │   │   │   ├── monitor/
│   │   │   │   │   │   └── SystemMonitor.ts
│   │   │   │   │   ├── scheduler/
│   │   │   │   │   │   └── TaskScheduler.ts
│   │   │   │   │   └── update/
│   │   │   │   │       └── UpdateManager.ts
│   │   │   │   ├── database/
│   │   │   │   │   ├── connection.ts
│   │   │   │   │   ├── migrations/
│   │   │   │   │   └── schema/
│   │   │   │   └── services/
│   │   │   │       ├── CryptoService.ts
│   │   │   │       └── TelemetryService.ts
│   │   │   │
│   │   │   ├── preload/
│   │   │   │   ├── index.ts
│   │   │   │   └── apis/
│   │   │   │       ├── profiles.api.ts
│   │   │   │       ├── proxy.api.ts
│   │   │   │       └── sync.api.ts
│   │   │   │
│   │   │   └── renderer/             # React frontend
│   │   │       ├── index.html
│   │   │       ├── main.tsx
│   │   │       ├── App.tsx
│   │   │       ├── routes/
│   │   │       │   ├── index.tsx
│   │   │       │   ├── dashboard.tsx
│   │   │       │   ├── profiles/
│   │   │       │   │   ├── index.tsx
│   │   │       │   │   ├── [id].tsx
│   │   │       │   │   └── bulk.tsx
│   │   │       │   ├── proxy/
│   │   │       │   ├── workspace/
│   │   │       │   ├── automation/
│   │   │       │   ├── monitor/
│   │   │       │   ├── learn/
│   │   │       │   ├── settings/
│   │   │       │   └── onboarding/
│   │   │       ├── components/
│   │   │       │   ├── ui/           # shadcn/ui
│   │   │       │   ├── layout/
│   │   │       │   │   ├── Sidebar.tsx
│   │   │       │   │   ├── Header.tsx
│   │   │       │   │   └── AppShell.tsx
│   │   │       │   ├── profiles/
│   │   │       │   ├── proxy/
│   │   │       │   └── shared/
│   │   │       │       ├── TooltipButton.tsx
│   │   │       │       ├── DataTable.tsx
│   │   │       │       └── EmptyState.tsx
│   │   │       ├── hooks/
│   │   │       ├── stores/
│   │   │       ├── lib/
│   │   │       └── styles/
│   │   │           ├── globals.css
│   │   │           └── tokens.css
│   │   │
│   │   ├── resources/                # Icons, assets
│   │   ├── electron-builder.yml
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/                          # Cloud REST API
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── app.ts
│   │   │   ├── plugins/
│   │   │   │   ├── auth.plugin.ts
│   │   │   │   ├── rate-limit.plugin.ts
│   │   │   │   └── swagger.plugin.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── workspaces/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── sync/
│   │   │   │   ├── webhooks/
│   │   │   │   ├── admin/
│   │   │   │   └── audit/
│   │   │   ├── middleware/
│   │   │   └── database/
│   │   │       ├── schema/
│   │   │       └── migrations/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── admin/                        # Admin web panel
│       ├── src/
│       │   ├── pages/
│       │   │   ├── dashboard.tsx
│       │   │   ├── customers/
│       │   │   ├── subscriptions/
│       │   │   ├── payments/
│       │   │   ├── coupons/
│       │   │   ├── affiliates/
│       │   │   └── metrics/
│       │   └── components/
│       └── package.json
│
├── packages/
│   ├── shared/                       # Tipos e utils compartilhados
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── profile.ts
│   │   │   │   ├── proxy.ts
│   │   │   │   ├── workspace.ts
│   │   │   │   ├── subscription.ts
│   │   │   │   └── sync.ts
│   │   │   ├── constants/
│   │   │   ├── validators/           # Zod schemas
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── database/                     # Drizzle schemas (local + cloud)
│   │   ├── src/
│   │   │   ├── local/                # SQLite schema
│   │   │   ├── cloud/                # PostgreSQL schema
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   ├── ui/                           # Design system compartilhado
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── themes/
│   │   └── package.json
│   │
│   └── config/                       # ESLint, TS, Tailwind configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docs/                             # Documentação do projeto
│   ├── 01-architecture.md
│   ├── 02-folder-structure.md
│   ├── 03-database.md
│   ├── 04-wireframes.md
│   ├── 05-roadmap-mvp.md
│   ├── 06-roadmap-v2.md
│   ├── 07-roadmap-enterprise.md
│   ├── 08-screens.md
│   ├── 09-onboarding.md
│   ├── 10-monetization.md
│   └── 11-growth-strategy.md
│
├── tests/
│   ├── unit/                         # Vitest
│   ├── integration/
│   └── e2e/                          # Playwright
│
├── scripts/
│   ├── seed.ts
│   ├── migrate.ts
│   └── generate-icons.ts
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── PROJECT.md
└── README.md
```

## Convenções de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes React | PascalCase | `ProfileCard.tsx` |
| Hooks | camelCase com `use` | `useProfiles.ts` |
| IPC channels | `domain:action` | `profiles:create` |
| API routes | REST kebab-case | `/api/v1/workspaces/:id/members` |
| DB tables | snake_case | `browser_profiles` |
| Enums | PascalCase | `ProfileStatus.Active` |
| Constantes | UPPER_SNAKE | `MAX_PROFILES_STARTER` |

## Scripts Principais (package.json root)

```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:desktop": "turbo dev --filter=desktop",
    "dev:api": "turbo dev --filter=api",
    "build": "turbo build",
    "test": "turbo test",
    "test:e2e": "playwright test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:migrate": "tsx scripts/migrate.ts",
    "release": "turbo build && electron-builder"
  }
}
```

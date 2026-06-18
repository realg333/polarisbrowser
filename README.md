# Polaris Browser

Desktop SaaS platform for managing multiple isolated browser profiles.

## Quick Start

```bash
# Install dependencies (uses npx if pnpm is not global)
npx pnpm@9.15.0 install

# Start development (Electron + hot reload)
npx pnpm@9.15.0 dev:desktop
```

## Project Structure

```
apps/desktop/     Electron app (main + preload + renderer)
packages/shared/  Shared types and validators
docs/             Architecture, roadmaps, wireframes
```

## Tech Stack

- **Electron 36** + **electron-vite**
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS** + **Radix UI**
- **SQLite** + **Drizzle ORM**
- **TanStack Query** + **Zustand**

## Sprint 3 Status (UX Core)

- [x] Pastas aninhadas com tree view, expand/collapse e CRUD
- [x] Tags com criação/exclusão via dialogs
- [x] Profile drawer (geral + navegação + fingerprint)
- [x] Dashboard com KPIs, perfis recentes e empty states
- [x] Checklist pós-onboarding no dashboard (7 dias / dismiss)
- [x] Onboarding 5 steps com workspace persistido e resumo final
- [x] Tag picker na criação de perfil

## Sprint 1 Status

- [x] Monorepo (pnpm + Turborepo)
- [x] Electron shell with security hardening
- [x] React UI with Dark/Light theme
- [x] App shell (sidebar + header + tooltips)
- [x] SQLite database + Drizzle schema
- [x] Profile CRUD + IPC bridge
- [x] Browser launcher (Chrome isolated profiles)
- [x] Dashboard + Profiles + Monitor + Settings
- [x] Onboarding flow (5 steps)

## Documentation

See [PROJECT.md](./PROJECT.md) and [docs/](./docs/) for full architecture, roadmaps, and specifications.

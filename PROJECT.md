# Polaris Browser

> Plataforma SaaS desktop para gerenciamento de múltiplos perfis de navegação — Windows e macOS.

## Visão

O **Polaris Browser** é uma plataforma profissional para empresas, agências de marketing, equipes de suporte, QA, e-commerce e operações digitais legítimas que precisam gerenciar dezenas ou centenas de perfis de navegação isolados, com proxies, automação e colaboração em equipe.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Desktop | Electron 33+ |
| Frontend | React 19 + TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui + Radix |
| Estado | Zustand + TanStack Query |
| Backend local | Node.js (main process) |
| API Cloud | Node.js + Fastify |
| Banco local | SQLite (better-sqlite3 + Drizzle ORM) |
| Banco cloud | PostgreSQL (Supabase) |
| Auth | Supabase Auth + JWT |
| Pagamentos | Stripe |
| Updates | electron-updater |
| Testes | Vitest + Playwright |

## Documentação

| # | Documento | Descrição |
|---|-----------|-----------|
| 1 | [Arquitetura](./docs/01-architecture.md) | Diagramas, módulos, fluxos de dados |
| 2 | [Estrutura de Pastas](./docs/02-folder-structure.md) | Monorepo completo |
| 3 | [Banco de Dados](./docs/03-database.md) | SQLite local + PostgreSQL cloud |
| 4 | [Wireframes](./docs/04-wireframes.md) | Layouts ASCII e fluxos visuais |
| 5 | [Roadmap MVP](./docs/05-roadmap-mvp.md) | Fase 1 — 12 semanas |
| 6 | [Roadmap V2](./docs/06-roadmap-v2.md) | Fase 2 — automação e proxies |
| 7 | [Roadmap Enterprise](./docs/07-roadmap-enterprise.md) | Fase 3 — multi-tenant e admin |
| 8 | [Telas Detalhadas](./docs/08-screens.md) | Especificação UI/UX por tela |
| 9 | [Onboarding](./docs/09-onboarding.md) | Fluxo completo de novos usuários |
| 10 | [Monetização](./docs/10-monetization.md) | Planos, pricing, unit economics |
| 11 | [Crescimento SaaS](./docs/11-growth-strategy.md) | Go-to-market e métricas |

## Planos de Assinatura

| Plano | Perfis | Mensal | Anual (por mês) |
|-------|--------|--------|-----------------|
| **Starter** | Até 10 | R$ 29,90 | R$ 19,90 |
| **Unlimited** | Ilimitados | R$ 49,90 | R$ 39,90 |

## Princípios de Design

- Estética **Linear / Arc / Notion** — minimalista, tipografia clara, espaçamento generoso
- **Dark Mode** e **Light Mode** com tokens semânticos
- **Tooltip em todo botão/ação** — explicação contextual ao hover
- Dashboard responsivo com sidebar colapsável
- Onboarding guiado em 5 passos para novos usuários

## Compliance

- OWASP Top 10
- Criptografia AES-256 local (SQLCipher)
- TLS 1.3 em trânsito
- LGPD + GDPR (consentimento, exportação, exclusão)
- Telemetria opt-in

# 5. Roadmap MVP — Polaris Browser

**Duração:** 12 semanas (3 meses)  
**Objetivo:** Produto funcional para early adopters com gestão de perfis, billing e sync básico.

---

## Escopo MVP

### Incluído ✅

- App Electron (Windows + macOS)
- CRUD de perfis individuais
- Launch de perfil Chromium isolado
- Pastas e tags
- Busca básica
- Dark/Light mode
- Tooltips em todas as ações
- Onboarding 5 steps
- Auth (email + senha)
- Planos Starter/Unlimited via Stripe
- Sync cloud básico (perfis + pastas + tags)
- Dashboard com KPIs básicos
- Atualizações automáticas
- Licenciamento online

### Fora do MVP ❌

- Proxies (V2)
- Automação/webhooks (V2)
- Workspace multi-usuário (V2)
- Ações em lote (V2)
- Admin panel (Enterprise)
- Central de aprendizado (V2)
- Monitoramento avançado (V2)
- Integrações Zapier/Make (V2)

---

## Timeline por Sprint (2 semanas cada)

### Sprint 1–2: Fundação (Semanas 1–4)

| Semana | Entregável | Detalhe |
|--------|------------|---------|
| 1 | Monorepo setup | pnpm + Turborepo + ESLint + Prettier + TS strict |
| 1 | Electron shell | Main + Preload + Renderer com hot reload |
| 2 | Design system | shadcn/ui + tokens dark/light + TooltipButton |
| 2 | App shell | Sidebar + Header + routing + ⌘K palette |
| 3 | SQLite + Drizzle | Schema local, migrations, CRUD profiles |
| 3 | ProfileManager | Criar/editar/excluir perfil + user-data-dir |
| 4 | BrowserLauncher | Launch Chromium isolado com flags |
| 4 | Lista de perfis | DataTable com sort, filter, pagination |

**Marco:** Primeiro perfil criado e lançado localmente.

### Sprint 3: UX Core (Semanas 5–6)

| Semana | Entregável | Detalhe |
|--------|------------|---------|
| 5 | Pastas + Tags | Tree view, CRUD, associação a perfis |
| 5 | Profile drawer | Detalhe lateral com tabs (geral, navegação) |
| 6 | Dashboard | KPI cards, perfis recentes, empty states |
| 6 | Onboarding | 5 steps completos com checklist pós-onboarding |

**Marco:** Fluxo completo do onboarding ao dashboard.

### Sprint 4: Cloud + Billing (Semanas 7–8)

| Semana | Entregável | Detalhe |
|--------|------------|---------|
| 7 | API cloud | Fastify + Supabase Auth + PostgreSQL schema |
| 7 | Auth flow | Login, registro, refresh token no desktop |
| 8 | Stripe integration | Checkout, webhooks, planos Starter/Unlimited |
| 8 | LicenseValidator | Enforcement local de limites por plano |

**Marco:** Usuário pode assinar e ter limites enforced.

### Sprint 5: Sync + Polish (Semanas 9–10)

| Semana | Entregável | Detalhe |
|--------|------------|---------|
| 9 | SyncEngine | Push/pull deltas, sync_queue, offline-first |
| 9 | Conflict resolution | UI básica: manter local vs cloud |
| 10 | Settings page | Geral, aparência, sync, billing, sobre |
| 10 | Export/Import perfil | JSON bundle com config (sem cookies) |

**Marco:** Dados sincronizam entre 2 devices.

### Sprint 6: Release (Semanas 11–12)

| Semana | Entregável | Detalhe |
|--------|------------|---------|
| 11 | electron-updater | Auto-update Win/Mac via CDN |
| 11 | Testes E2E | Playwright: onboarding, CRUD, billing |
| 12 | Security audit | CSP, sandbox, OWASP checklist |
| 12 | Beta release | 50 early adopters, feedback loop |

**Marco:** MVP publicado para beta fechado.

---

## Equipe MVP (Mínima)

| Role | Qty | Responsabilidade |
|------|-----|------------------|
| Full-stack lead | 1 | Electron + API + arquitetura |
| Frontend dev | 1 | React UI + design system |
| Backend dev | 1 | API + Stripe + Supabase |
| Designer | 0.5 | UI/UX + wireframes |
| QA | 0.5 | Testes manuais + E2E |

---

## Critérios de Aceite MVP

| # | Critério | Verificação |
|---|----------|-------------|
| 1 | Criar perfil em < 30s | Timer no onboarding |
| 2 | Launch perfil isolado | Cookies não vazam entre perfis |
| 3 | Assinar plano Starter | Stripe checkout completo |
| 4 | Limite 10 perfis enforced | Bloqueio ao tentar criar 11º |
| 5 | Sync entre 2 devices | Editar no A, aparece no B |
| 6 | Auto-update funcional | Nova versão instalada sem re-download manual |
| 7 | Dark + Light mode | Toggle instantâneo sem flash |
| 8 | Todo botão tem tooltip | Audit automatizado |
| 9 | Onboarding > 70% completion | Analytics |
| 10 | Zero crashes em 1h de uso | Sentry monitoring |

---

## Riscos MVP

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Chromium profile isolation falha | Alto | Testes automatizados de cookie leak |
| Stripe webhook delays | Médio | Polling fallback + grace period 24h |
| Sync conflicts complexos | Médio | LWW simples no MVP, UI de merge na V2 |
| App size > 200MB | Baixo | Electron builder optimization |
| Rejeição Mac notarization | Médio | CI pipeline com Apple credentials early |

---

## KPIs de Sucesso MVP (30 dias pós-beta)

| Métrica | Target |
|---------|--------|
| Beta signups | 100 |
| Paid conversions | 20 (20%) |
| D7 retention | 40% |
| NPS | > 30 |
| Crash-free rate | > 99% |
| Support tickets/user | < 0.5 |

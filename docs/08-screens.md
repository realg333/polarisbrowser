# 8. Telas Detalhadas — Polaris Browser

Especificação UI/UX por tela. Todas as ações possuem **tooltip obrigatório**.

---

## Design System

### Tokens de Cor

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--bg-primary` | `#0A0A0B` | `#FFFFFF` | Background principal |
| `--bg-secondary` | `#141415` | `#F7F7F8` | Cards, sidebar |
| `--bg-tertiary` | `#1C1C1E` | `#EFEFF1` | Hover states |
| `--border` | `#2A2A2D` | `#E4E4E7` | Bordas |
| `--text-primary` | `#FAFAFA` | `#18181B` | Texto principal |
| `--text-secondary` | `#A1A1AA` | `#71717A` | Texto secundário |
| `--accent` | `#6366F1` | `#4F46E5` | Ações primárias (Indigo) |
| `--success` | `#22C55E` | `#16A34A` | Status ativo |
| `--warning` | `#F59E0B` | `#D97706` | Alertas |
| `--danger` | `#EF4444` | `#DC2626` | Exclusão, erro |

### Tipografia

| Elemento | Font | Size | Weight |
|----------|------|------|--------|
| H1 | Inter | 24px | 600 |
| H2 | Inter | 20px | 600 |
| H3 | Inter | 16px | 600 |
| Body | Inter | 14px | 400 |
| Small | Inter | 12px | 400 |
| Mono | JetBrains Mono | 13px | 400 |

### Componentes Base

- **TooltipButton** — wrapper que exige `tooltip` prop
- **DataTable** — tabela com sort, filter, pagination, bulk select
- **EmptyState** — ilustração + CTA para telas vazias
- **StatusBadge** — `idle` (cinza), `running` (verde pulse), `archived` (amarelo)
- **CommandPalette** — ⌘K para busca global
- **DrawerPanel** — painel lateral para detalhes (480px)

---

## Tela 1: Login / Sign Up

**Rota:** `/auth/login`

| Elemento | Comportamento |
|----------|---------------|
| Logo Polaris | Centralizado, animação sutil de entrada |
| Email + Senha | Validação Zod inline |
| "Entrar" | Supabase Auth, loading state |
| "Criar conta" | Tab switch para registro |
| "Esqueci senha" | Email de reset via Supabase |
| OAuth Google | Botão secundário (opcional MVP) |
| Toggle tema | Canto superior direito |

**Tooltip examples:**
- "Entrar" → "Acessar sua conta Polaris com email e senha"
- Google → "Entrar rapidamente com sua conta Google"

---

## Tela 2: Dashboard

**Rota:** `/dashboard`

| Seção | Componentes | Dados |
|-------|-------------|-------|
| Header | Saudação + nome, botão "+ Perfil" | `user.name`, hora do dia |
| KPI Cards (4) | Total perfis, Ativos, Inativos, Latência proxy | Queries em tempo real |
| Perfis Recentes | Lista compacta com Launch rápido | Top 5 by `last_used_at` |
| Uso de Recursos | Barras CPU/RAM | `SystemMonitor` polling 5s |
| Atividade Recente | Timeline | `activity_logs` últimas 10 |

**Estados:**
- **Empty:** ilustração + "Crie seu primeiro perfil" + CTA
- **Loading:** skeleton cards
- **Error:** toast + retry

**Responsividade:** KPI cards 4→2→1 colunas

---

## Tela 3: Lista de Perfis

**Rota:** `/profiles`

| Elemento | Detalhe |
|----------|---------|
| Sidebar pastas | Tree view colapsável, drag-and-drop reorder |
| Barra de busca | Full-text search (nome, tags, notas) |
| Filtros | Status, Tags (multi-select), Pasta |
| Tabela | Colunas: checkbox, nome, status, tags, proxy, último uso, ações |
| Bulk bar | Aparece ao selecionar ≥1 perfil (fixo no bottom) |
| Paginação | 25/50/100 por página |

**Ações por linha (tooltip em cada):**
| Ícone | Tooltip | Ação |
|-------|---------|------|
| ▶ | "Abrir este perfil no navegador isolado" | Launch |
| ✏ | "Editar configurações do perfil" | Abre drawer |
| ⎘ | "Criar cópia com mesmas configurações" | Duplicate |
| ⋯ | Menu: Exportar, Arquivar, Excluir | Dropdown |

**Atalhos:**
- `N` → Novo perfil
- `⌘F` → Focus busca
- `Delete` → Excluir selecionados (com confirmação)

---

## Tela 4: Detalhe do Perfil (Drawer)

**Rota:** `/profiles/:id` (drawer overlay)

| Tab | Campos |
|-----|--------|
| Geral | Nome, descrição, notas, pasta, tags |
| Navegação | URL inicial, idioma, fuso, locale, ad blocker |
| Proxy | Pool selector, proxy individual, teste latência |
| Extensões | Lista toggle on/off, adicionar por ID Chrome Web Store |
| Favoritos | Lista editável drag-and-drop |
| Avançado | User-agent custom, fingerprint config (JSON editor) |
| Histórico | Sessões anteriores, duração, consumo |

**Validação:** autosave com debounce 1s + indicador "Salvo ✓"

---

## Tela 5: Ações em Lote

**Rota:** `/profiles/bulk`

| Step | Conteúdo |
|------|----------|
| 1. Seleção | Perfis selecionados (chips removíveis) |
| 2. Ação | Radio: Aplicar config / Mover pasta / Excluir |
| 3. Config | Checkboxes para campos a alterar |
| 4. Preview | Diff antes/depois |
| 5. Confirm | Botão com contagem "Aplicar a N perfis" |

**Importação CSV:**
```
name,start_url,language,timezone,tags,proxy_pool
"Loja A","https://loja-a.com","pt-BR","America/Sao_Paulo","shop;br","BR Residential"
```

---

## Tela 6: Proxies

**Rota:** `/proxy`

| Seção | Detalhe |
|-------|---------|
| Pools | Cards com métricas: total, online, latência média |
| Pool detail | Tabela de proxies com health check |
| Consumo | Gráfico de barras mensal (GB usado) |
| Import | Colar lista ou upload CSV |
| Provider API | Config de integração (Bright Data, Smartproxy, etc.) |

**Teste de proxy:**
1. Click "Testar" → spinner
2. Resultado: latência (ms), IP detectado, país, status
3. Auto-refresh a cada 6h (configurável)

---

## Tela 7: Workspace

**Rota:** `/workspace`

| Tab | Conteúdo |
|-----|----------|
| Membros | Tabela + convite por email |
| Permissões | Matrix role × permission (read-only visual) |
| Atividade | Timeline filtrável por membro/ação/data |
| Auditoria | Log imutável com before/after state |

**Convite flow:**
1. Email + role selector
2. Enviar → email com link de aceite
3. Status: pendente / aceito / expirado

---

## Tela 8: Automação

**Rota:** `/automation`

| Seção | Detalhe |
|-------|---------|
| Tarefas | CRUD com cron builder visual |
| Launch múltiplo | Selecionar perfis + delay entre launches |
| Webhooks | URL + eventos + secret + test button |
| API | Key management + link docs Swagger |

**Eventos webhook disponíveis:**
- `profile.created`, `profile.launched`, `profile.archived`
- `proxy.offline`, `proxy.latency_high`
- `sync.completed`, `sync.failed`
- `subscription.upgraded`, `subscription.canceled`

---

## Tela 9: Monitoramento

**Rota:** `/monitor`

| Widget | Dados | Refresh |
|--------|-------|---------|
| CPU gauge | % uso sistema + por perfil | 5s |
| RAM gauge | MB alocado / total | 5s |
| Perfis ativos | Lista com PID, uptime, consumo | 5s |
| Perfis inativos | >7 dias sem uso, sugestão arquivar | 1min |
| Alertas | Threshold configurável (CPU>80%, RAM>90%) | Event-driven |

**Alertas:** toast in-app + notificação desktop (opcional)

---

## Tela 10: Central de Aprendizado

**Rota:** `/learn`

| Seção | Conteúdo |
|-------|----------|
| Busca | Full-text em tutoriais, guias, FAQ |
| Vídeos | Grid de thumbnails com duração |
| Guias | Step-by-step com screenshots |
| FAQ | Accordion por categoria |
| Base de conhecimento | Artigos markdown renderizados |

**Categorias:** Primeiros passos, Perfis, Proxies, Automação, Workspace, Billing

---

## Tela 11: Configurações

**Rota:** `/settings`

| Tab | Campos |
|-----|--------|
| Geral | Nome, email, idioma app, startup behavior |
| Aparência | Dark/Light/System, sidebar collapsed default |
| Sincronização | Auto-sync toggle, intervalo, device name |
| Notificações | Desktop alerts, email digest |
| Segurança | 2FA, exportar dados (LGPD), excluir conta |
| Billing | Plano atual, upgrade, histórico faturas, cancelar |
| Sobre | Versão, changelog, check updates, licença |

---

## Tela 12: Admin Panel (Web App)

**Rota:** `admin.polarisbrowser.app`

| Página | KPIs / Ações |
|--------|-------------|
| Dashboard | MRR, ARR, clientes ativos, churn, novos (30d) |
| Clientes | Busca, detalhe, impersonate (support) |
| Assinaturas | Status, upgrade/downgrade manual, cancel |
| Pagamentos | Faturas Stripe, reembolsos |
| Cupons | CRUD, % ou valor fixo, limite usos, expiração |
| Afiliados | Código, comissão, referrals, payout |
| Métricas | Gráficos: MRR trend, cohort retention, LTV, CAC |

---

## Padrões de Interação Globais

| Padrão | Implementação |
|--------|---------------|
| Tooltip | Radix Tooltip, delay 300ms, max-width 280px |
| Confirmação destrutiva | AlertDialog com texto "Digite EXCLUIR" |
| Toast | Sonner — success (3s), error (5s), action button |
| Loading | Skeleton para listas, spinner para ações |
| Empty state | Ilustração SVG + título + descrição + CTA |
| Keyboard | ⌘K command palette, Esc fecha drawers/modals |
| Drag & drop | @dnd-kit para pastas, favoritos, reordenação |

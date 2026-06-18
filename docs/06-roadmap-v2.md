# 6. Roadmap V2 — Polaris Browser

**Duração:** 16 semanas (4 meses) pós-MVP  
**Objetivo:** Diferenciação competitiva com proxies, automação, equipe e operações em massa.

---

## Temas V2

1. **Proxies** — gestão completa com pools e rotação
2. **Bulk Operations** — operações em massa para power users
3. **Workspace** — colaboração multi-usuário
4. **Automação** — tarefas, webhooks, API pública
5. **Monitoramento** — recursos do sistema e alertas
6. **Central de Aprendizado** — reduzir suporte e churn

---

## Timeline por Quarter

### Q1 pós-MVP: Proxies + Bulk (Semanas 1–8)

#### Sprint 7–8: Proxy Engine

| Entrega | Detalhe |
|---------|---------|
| ProxyManager | CRUD proxy individual (HTTP, HTTPS, SOCKS5) |
| Proxy pools | Agrupamento, rotação (round-robin, sticky, random) |
| ProxyTester | Teste latência + disponibilidade + IP detectado |
| ProxyRotator | Rotação automática por intervalo ou por sessão |
| Associação perfil↔proxy | UI no drawer + bulk assign |
| Provider API | Integração Bright Data, Smartproxy (adapter pattern) |
| Dashboard consumo | Gráfico GB/mês por pool |
| Import CSV | Lista de proxies em massa |

**Marco:** 10 proxies testados e associados a perfis em < 5 min.

#### Sprint 9–10: Bulk Operations

| Entrega | Detalhe |
|---------|---------|
| Seleção múltipla | Checkbox + shift-click range na DataTable |
| Bulk bar | Bottom bar fixa com ações |
| Criação em lote | Form com quantidade + template config |
| Import CSV perfis | Parser + preview + validação |
| Edição em lote | Apply config parcial (checkbox por campo) |
| Exclusão em lote | Confirmação com contagem |
| Duplicar em lote | N cópias com sufixo auto |
| Arquivar em lote | Move para archived status |

**Marco:** Importar 50 perfis via CSV em < 2 min.

---

### Q2 pós-MVP: Workspace + Automação (Semanas 9–16)

#### Sprint 11–12: Workspace Empresarial

| Entrega | Detalhe |
|---------|---------|
| Convite por email | Resend + link de aceite + expiração 7d |
| RBAC | Owner, Admin, Member, Viewer |
| Permission matrix | Granular: create, launch, proxy, invite, billing |
| Activity logs | Timeline por workspace |
| Audit trail | Before/after state imutável |
| Member management | Promover, rebaixar, remover |
| Workspace settings | Defaults para novos perfis |

**Marco:** 3 membros colaborando no mesmo workspace.

#### Sprint 13–14: Automação

| Entrega | Detalhe |
|---------|---------|
| Launch múltiplo | Selecionar N perfis + delay configurável |
| Task scheduler | Cron builder visual + cron expressions |
| Tarefas pré-built | "Abrir perfis manhã", "Testar proxies", "Backup" |
| Webhooks | CRUD + event selection + HMAC signature |
| REST API v1 | OpenAPI spec + API keys + rate limiting |
| Zapier integration | Triggers: profile.launched, proxy.offline |
| Make integration | Modules equivalentes |

**Marco:** Webhook dispara ao launch perfil → recebido em Zapier.

#### Sprint 15–16: Monitor + Learn

| Entrega | Detalhe |
|---------|---------|
| SystemMonitor | CPU/RAM polling 5s via Node os module |
| Per-profile metrics | PID tracking, memory per session |
| Inactive detection | Flag perfis >7 dias sem uso |
| Alert system | Threshold CPU/RAM + toast + desktop notification |
| Monitor dashboard | Gauges + charts + perfis ativos list |
| Learn center | CMS simples (markdown articles) |
| Video library | Embed YouTube/Vimeo |
| FAQ | Accordion por categoria |
| Smart search | Full-text em artigos + FAQ |

**Marco:** Alerta dispara quando CPU > 80% por 30s.

---

## Melhorias Transversais V2

| Área | Melhoria |
|------|----------|
| Sync | Merge UI para conflitos (3-way) |
| Search | Busca avançada: operadores `tag:`, `status:`, `proxy:` |
| Extensions | Gerenciador de extensões Chrome por perfil |
| Favoritos | Bookmarks default por perfil |
| Fingerprint | Config básica de fingerprint (UA, WebGL, canvas) |
| i18n | en-US completo além de pt-BR |
| Performance | Virtual scroll para 1000+ perfis |
| Telemetry | PostHog opt-in com dashboard interno |

---

## Critérios de Aceite V2

| # | Critério |
|---|----------|
| 1 | Pool de 100 proxies importado e testado em < 10 min |
| 2 | 50 perfis criados via CSV sem erro |
| 3 | 3 membros no workspace com roles diferentes |
| 4 | Webhook entrega evento em < 2s |
| 5 | API responde em < 200ms p95 |
| 6 | Monitor atualiza CPU/RAM a cada 5s |
| 7 | Artigo da central responde 80% das dúvidas de suporte |
| 8 | Sync conflict resolvido via UI merge |

---

## KPIs V2 (60 dias pós-release)

| Métrica | Target |
|---------|--------|
| Upgrade Starter→Unlimited | 15% |
| Perfis por usuário (média) | 25 |
| Proxies por usuário (média) | 10 |
| Workspace adoption | 30% dos Unlimited |
| API calls/day | 500 |
| Support ticket reduction | -40% vs MVP |
| MRR growth | +50% vs MVP |

---

## Pricing V2 (sem alteração)

Planos mantidos. Proxies e automação disponíveis em ambos, com limites:

| Recurso | Starter | Unlimited |
|---------|---------|-----------|
| Proxies no pool | 5 | 100 |
| Bulk import | 10/vez | 500/vez |
| Webhooks | 1 | 10 |
| API rate | 100/min | 1000/min |
| Membros | 3 | 20 |

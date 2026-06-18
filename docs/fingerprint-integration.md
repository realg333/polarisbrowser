# Integração de Fingerprint — Nativo vs Extensão

Este documento mapeia como cada campo de fingerprint é aplicado no Polaris (SunBrowser / FlowerBrowser).

## Visão geral

```
Profile (SQLite)
    │
    ├─► EngineFingerprintBridge ──► polaris-fingerprint.json + Chromium flags + env
    │
    ├─► FingerprintExtensionBuilder ──► MV3 extension (inject.js @ document_start)
    │
    └─► BrowserLauncher ──► --user-agent, --proxy-server, --window-size, spawn()
```

## `polaris-fingerprint.json`

Escrito em `{userData}/profiles/{profileId}/polaris-fingerprint.json` a cada launch.

| Campo | SunBrowser / Flower (nativo) | Fallback extensão / Chromium |
|-------|------------------------------|------------------------------|
| `userAgent` | `--polaris-fingerprint` (engine) | `--user-agent` |
| `timezone` | Engine + `--timezone` + `TZ` | Não injeta `Intl` em JS |
| `language` / `locale` | `--lang` | `navigator.language` via extensão |
| `screen` | `--window-size` | — |
| `webrtc` | Chromium flags (`disable_non_proxied_udp`) | Não patcha RTCPeerConnection |
| `canvas` | Engine (se suportado) | Ruído em `HTMLCanvasElement` |
| `webgl` | Engine (se suportado) | `getParameter(UNMASKED_*)` mask |
| `audioContext` | Engine (se suportado) | Ruído em `AudioBuffer` |
| `hardware` | Engine (se suportado) | `navigator.hardwareConcurrency`, etc. |
| `geolocation` | Engine (se suportado) | `navigator.geolocation` patch |
| `fonts` | Engine (se suportado) | `document.fonts.check` custom list |
| `mediaDevices` | — | Lista fake / block |
| `doNotTrack` | `--enable-do-not-track` | `navigator.doNotTrack` |

### Variáveis de ambiente (launch)

| Variável | Engine |
|----------|--------|
| `POLARIS_FINGERPRINT_CONFIG` | Todos |
| `SUNBROWSER_FINGERPRINT` | SunBrowser |
| `FLOWER_FINGERPRINT` | FlowerBrowser |
| `TZ` | Chromium |

### Flags Chromium relevantes

- `--lang={language}`
- `--timezone={IANA}`
- `--force-webrtc-ip-handling-policy=disable_non_proxied_udp`
- `--disable-blink-features=AutomationControlled`
- `--proxy-server={scheme}://[user:pass@]host:port`

## Extensão `polaris-fingerprint-ext`

Gerada em `{profileDir}/polaris-fingerprint-ext/`.

**Injeta (MAIN world, document_start):**

- DNT, hardware, platform, language
- Canvas / WebGL / Audio / ClientRects noise
- Geolocation block ou coordenadas fixas
- Media devices fake/block
- Font list custom

**Não injeta:**

- User-Agent (launch arg)
- Timezone / `Intl` (apenas nativo Chromium)
- WebRTC (apenas flags Chromium)

## Proxy → Geo sync (POL-6)

1. UI: `ProxyConfigPanel` → `proxy:syncGeo` IPC
2. Main: `ProxyGeoService` consulta IP de saída via proxy (`ip-api.com`)
3. `buildGeoSyncPatch` atualiza `timezone`, `language`, `locale`, `fingerprint.geolocation`
4. No launch: geo re-sincronizado automaticamente antes de spawn

## Validação (POL-9)

- `profiles:launchValidation` abre `polaris-validation.html` local
- Links para browserleaks (WebRTC, Canvas, WebGL, Geo) e CreepJS
- Botão shield no `ProfileDetailSheet`

## Prioridade recomendada (POL-7 backlog)

1. Confirmar com engine quais chaves de `polaris-fingerprint.json` Sun/Flower leem nativamente
2. Mover canvas/webgl para nativo quando disponível (menos detectável que extensão)
3. Adicionar spoof de `Intl.DateTimeFormat` na extensão se engine não cobrir timezone

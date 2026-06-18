import { join } from 'path';
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { FINGERPRINT_VALIDATION_CHECKS, FINGERPRINT_VALIDATION_HUB_URL } from '@polaris/shared';

/** Gera página local com links para browserleaks / creepjs. */
export function writeValidationHub(profileDir: string): string {
  const filePath = join(profileDir, FINGERPRINT_VALIDATION_HUB_URL);
  const checks = FINGERPRINT_VALIDATION_CHECKS.map(
    (c) =>
      `<li><a href="${c.url}" target="_blank" rel="noopener"><strong>${c.label}</strong></a> — ${c.description}</li>`,
  ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Polaris — Validação de Fingerprint</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; background: #0b1220; color: #e2e8f0; }
    h1 { font-size: 1.25rem; color: #38bdf8; }
    ul { line-height: 1.8; }
    a { color: #67e8f9; }
    p { color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Polaris — Checklist de fingerprint</h1>
  <p>Abra cada teste em nova aba. Confirme que UA, WebGL, Canvas, WebRTC e geo batem com o preset do perfil.</p>
  <ul>${checks}</ul>
</body>
</html>`;

  writeFileSync(filePath, html, 'utf-8');
  return pathToFileURL(filePath).href;
}

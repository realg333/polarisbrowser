export interface FingerprintValidationCheck {
  id: string;
  label: string;
  url: string;
  description: string;
}

/** Checklist de validação pós-launch — abrir no perfil para auditar fingerprint. */
export const FINGERPRINT_VALIDATION_CHECKS: FingerprintValidationCheck[] = [
  {
    id: 'webrtc',
    label: 'WebRTC leak',
    url: 'https://browserleaks.com/webrtc',
    description: 'Verifica vazamento de IP local e candidatos WebRTC',
  },
  {
    id: 'canvas',
    label: 'Canvas hash',
    url: 'https://browserleaks.com/canvas',
    description: 'Hash e consistência do canvas fingerprint',
  },
  {
    id: 'webgl',
    label: 'WebGL vendor',
    url: 'https://browserleaks.com/webgl',
    description: 'Vendor e renderer WebGL mascarados',
  },
  {
    id: 'geo',
    label: 'Geolocation',
    url: 'https://browserleaks.com/geo',
    description: 'Coordenadas e timezone do perfil',
  },
  {
    id: 'creepjs',
    label: 'CreepJS score',
    url: 'https://abrahamjuliot.github.io/creepjs/',
    description: 'Score geral de consistência anti-detect',
  },
];

export const FINGERPRINT_VALIDATION_HUB_URL = 'polaris-validation.html';

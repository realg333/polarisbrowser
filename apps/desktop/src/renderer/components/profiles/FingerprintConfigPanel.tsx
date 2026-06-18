import type { FingerprintConfig, FingerprintOS } from '@polaris/shared';
import {
  FINGERPRINT_OS_LABELS,
  resolveFingerprint,
  getPresetsForOs,
  generateAutoFingerprint,
  regenerateFingerprint,
} from '@polaris/shared';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { cn } from '@/lib/utils';
import { RefreshCw, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FingerprintConfigPanelProps {
  fingerprint: FingerprintConfig;
  onChange: (fingerprint: FingerprintConfig) => void;
}

export function FingerprintConfigPanel({
  fingerprint,
  onChange,
}: FingerprintConfigPanelProps): React.ReactElement {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fp = resolveFingerprint(fingerprint);
  const presets = getPresetsForOs(fp.os);

  const selectOs = (os: FingerprintOS): void => {
    onChange(generateAutoFingerprint(os));
  };

  const selectPreset = (presetId: string): void => {
    onChange(generateAutoFingerprint(fp.os, { presetId }));
  };

  const randomize = (): void => {
    onChange(regenerateFingerprint(fp));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Fingerprint automático</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Escolha o sistema operacional e o Polaris gera UA, GPU, resolução, WebRTC, Canvas e
          demais parâmetros de forma coerente.
        </p>
      </div>

      <Section title="Sistema operacional">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FINGERPRINT_OS_LABELS) as FingerprintOS[]).map((os) => (
            <button
              key={os}
              type="button"
              onClick={() => selectOs(os)}
              className={cn(
                'rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors',
                fp.os === os ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
              )}
            >
              {FINGERPRINT_OS_LABELS[os]}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Perfil de dispositivo">
        <p className="text-xs text-muted-foreground">
          Selecione um agente válido para {FINGERPRINT_OS_LABELS[fp.os]} — todos os campos são
          gerados automaticamente.
        </p>
        <div className="space-y-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(preset.id)}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                fp.presetId === preset.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent',
              )}
            >
              <span className="font-medium">{preset.label}</span>
              <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                {preset.screenWidth}×{preset.screenHeight} · Chrome {preset.browserVersion.split('.')[0]}
              </p>
            </button>
          ))}
        </div>
        <TooltipButton
          tooltip="Gerar outro perfil aleatório para este sistema operacional"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={randomize}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Randomizar fingerprint
        </TooltipButton>
      </Section>

      <Section title="Resumo gerado">
        <SummaryRow label="User-Agent" value={fp.userAgent ?? '—'} mono />
        <SummaryRow label="Resolução" value={`${fp.screenWidth} × ${fp.screenHeight}`} />
        <SummaryRow label="CPU / RAM" value={`${fp.hardwareConcurrency} cores · ${fp.deviceMemory} GB`} />
        <SummaryRow label="WebGL" value={fp.webglRenderer ?? '—'} />
        <SummaryRow label="WebRTC" value="Anti-leak (substituído)" />
        <SummaryRow label="Canvas / Áudio" value="Ruído automático" />
        <SummaryRow label="DNT" value={fp.doNotTrack ? 'Ativado' : 'Desativado'} />
      </Section>

      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        Configurações avançadas (opcional)
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="space-y-2 rounded-xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
          <p>WebRTC: {fp.webrtc} · Canvas: {fp.canvas} · WebGL: {fp.webgl}</p>
          <p>Geolocation: {fp.geolocation?.mode} · Mídia: {fp.mediaDevices}</p>
          <p className="font-mono break-all">{fp.userAgent}</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/40 py-2 last:border-0">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn('text-xs', mono && 'font-mono break-all')}>{value}</span>
    </div>
  );
}

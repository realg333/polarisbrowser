import { useState } from 'react';
import type { ProxyConfig, GeoSyncPatch } from '@polaris/shared';
import { Input } from '@/components/ui/input';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { cn } from '@/lib/utils';
import { Globe, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_PROXY: ProxyConfig = {
  enabled: false,
  type: 'http',
  host: '',
  port: 8080,
};

interface ProxyConfigPanelProps {
  proxy: ProxyConfig | null;
  onChange: (proxy: ProxyConfig | null) => void;
  onGeoSync?: (patch: GeoSyncPatch) => void;
}

export function ProxyConfigPanel({
  proxy,
  onChange,
  onGeoSync,
}: ProxyConfigPanelProps): React.ReactElement {
  const [syncing, setSyncing] = useState(false);
  const value = proxy ?? EMPTY_PROXY;

  const update = (patch: Partial<ProxyConfig>): void => {
    onChange({ ...value, ...patch, enabled: patch.enabled ?? value.enabled ?? false });
  };

  const syncGeo = async (): Promise<void> => {
    if (!value.host) {
      toast.error('Informe host e porta do proxy');
      return;
    }
    setSyncing(true);
    try {
      const result = await window.polaris.proxy.syncGeo({ ...value, enabled: true });
      if (!result.success) {
        toast.error('error' in result ? result.error : 'Falha ao sincronizar geo');
        return;
      }
      if (!result.patch) {
        toast.error('Falha ao sincronizar geo');
        return;
      }
      onGeoSync?.(result.patch);
      toast.success(
        `Geo sincronizado: ${result.geo?.timezone ?? result.patch.timezone} · ${result.patch.language}`,
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        Usar proxy neste perfil
      </label>

      {value.enabled && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select
                className="mt-1 flex h-9 w-full cursor-pointer rounded-lg border border-input bg-background/60 px-2 text-sm"
                value={value.type}
                onChange={(e) => update({ type: e.target.value as ProxyConfig['type'] })}
              >
                <option value="http">HTTP</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">País (fallback)</label>
              <Input
                className="mt-1 h-9"
                placeholder="BR"
                maxLength={2}
                value={value.country ?? ''}
                onChange={(e) => update({ country: e.target.value.toUpperCase() || undefined })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Host</label>
              <Input
                className="mt-1 h-9"
                placeholder="proxy.exemplo.com"
                value={value.host}
                onChange={(e) => update({ host: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Porta</label>
              <Input
                className="mt-1 h-9"
                type="number"
                value={value.port}
                onChange={(e) => update({ port: Number(e.target.value) || 8080 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Usuário</label>
              <Input
                className="mt-1 h-9"
                value={value.username ?? ''}
                onChange={(e) => update({ username: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Senha</label>
              <Input
                className="mt-1 h-9"
                type="password"
                value={value.password ?? ''}
                onChange={(e) => update({ password: e.target.value || undefined })}
              />
            </div>
          </div>
          <TooltipButton
            tooltip="Detecta IP de saída e ajusta timezone, idioma e geolocation"
            variant="outline"
            className={cn('w-full', syncing && 'opacity-70')}
            onClick={() => void syncGeo()}
            disabled={syncing}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
            Sincronizar geo do proxy
          </TooltipButton>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Ao iniciar o perfil, timezone e geolocation são re-sincronizados automaticamente.
          </p>
        </>
      )}
    </div>
  );
}

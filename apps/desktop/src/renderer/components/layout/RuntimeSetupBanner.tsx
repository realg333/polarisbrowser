import { useEffect, useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ANTIDETECT_ENGINE_LABELS } from '@polaris/shared';
import { Button } from '@/components/ui/button';
import { useBrowserRuntimes } from '@/hooks/useBrowserRuntimes';

const DISMISS_KEY = 'polaris.runtime-setup-dismissed';

export function RuntimeSetupBanner(): React.ReactElement | null {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');
  const {
    pending,
    pendingCount,
    progressMap,
    busy,
    installAll,
    isInstallingAll,
    isLoading,
  } = useBrowserRuntimes();

  useEffect(() => {
    if (pendingCount === 0) localStorage.removeItem(DISMISS_KEY);
  }, [pendingCount]);

  if (dismissed || isLoading || pendingCount === 0) return null;

  const dismiss = (): void => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-6 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Prepare os navegadores anti-detect</p>
          <p className="text-xs text-muted-foreground">
            {pendingCount} runtime(s) pendente(s) — SunBrowser e Flower Browser para lançar perfis.
            {pending.some((p) => p.downloadAvailable) && ' Download direto via Polaris disponível.'}
          </p>
          {busy && (
            <ul className="mt-2 space-y-1">
              {pending.map((r) => {
                const progress = progressMap[r.engine];
                if (!progress) return null;
                return (
                  <li key={r.engine} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {ANTIDETECT_ENGINE_LABELS[r.engine]}: {progress.message}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            disabled={isInstallingAll || busy}
            onClick={() => installAll()}
          >
            <Download className="h-3.5 w-3.5" />
            {isInstallingAll || busy ? 'Preparando...' : 'Baixar tudo'}
          </Button>
          <Link to="/settings" className="text-xs text-primary hover:underline">
            Configurações
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dispensar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

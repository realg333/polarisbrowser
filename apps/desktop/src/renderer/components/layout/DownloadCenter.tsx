import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowUpFromLine, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AntidetectEngine, BrowserRuntimeStatus } from '@polaris/shared';
import { ANTIDETECT_ENGINE_LABELS } from '@polaris/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getRuntimeActionLabel, useBrowserRuntimes } from '@/hooks/useBrowserRuntimes';

const ENGINES: AntidetectEngine[] = ['sunbrowser', 'flowerbrowser'];

export function DownloadCenter(): React.ReactElement {
  const {
    runtimes,
    pending,
    pendingCount,
    progressMap,
    busy,
    install,
    installAll,
    isInstallingAll,
    isInstalling,
    installingEngine,
    refresh,
    isRefreshing,
  } = useBrowserRuntimes();

  const showBadge = pendingCount > 0 || busy;

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && refresh()}>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" title="Central de Download">
          <ArrowUpFromLine className="h-[1.1rem] w-[1.1rem]" />
          {showBadge && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {busy ? '…' : pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[340px] overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-0 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <h3 className="text-sm font-semibold">Central de Download</h3>
            {pendingCount > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                disabled={isInstallingAll || busy}
                onClick={() => installAll()}
              >
                {isInstallingAll ? 'Baixando...' : 'Baixar tudo'}
              </button>
            ) : (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                disabled={isRefreshing}
                onClick={() => refresh()}
              >
                {isRefreshing ? 'Verificando...' : 'Verificar'}
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            {pending.length === 0 && !busy ? (
              <div className="px-3 py-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success/80" />
                <p className="text-sm text-muted-foreground">Tudo pronto</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  SunBrowser e Flower Browser detectados ou instalados.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {ENGINES.map((engine) => {
                  const status = runtimes.find((r) => r.engine === engine);
                  const progress = progressMap[engine];
                  return (
                    <DownloadItem
                      key={engine}
                      engine={engine}
                      status={status}
                      progress={progress}
                      installing={isInstalling && installingEngine === engine}
                      onInstall={() => install(engine)}
                    />
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border/60 px-4 py-2.5">
            <Link
              to="/settings"
              className="text-[11px] text-muted-foreground hover:text-primary hover:underline"
            >
              Configurações → Navegadores anti-detect
            </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function DownloadItem({
  engine,
  status,
  progress,
  installing,
  onInstall,
}: {
  engine: AntidetectEngine;
  status?: BrowserRuntimeStatus;
  progress?: { percent: number; message: string; phase: string };
  installing: boolean;
  onInstall: () => void;
}): React.ReactElement {
  const label = ANTIDETECT_ENGINE_LABELS[engine];
  const needsAction = !status?.installed || status.updateAvailable;
  const actionLabel = getRuntimeActionLabel(status);

  return (
    <li className="rounded-lg border border-border/50 bg-card/40 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">
            {status?.kernelFamily === 'firefox' ? 'Firefox' : 'Chromium'}
            {status?.version ? ` · v${status.version}` : ''}
            {status?.updateAvailable && status.latestVersion ? ` → v${status.latestVersion}` : ''}
          </p>
          {status?.path && (
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/70">{status.path}</p>
          )}
        </div>

        {needsAction ? (
          <button
            type="button"
            onClick={onInstall}
            disabled={installing || progress?.phase === 'downloading' || progress?.phase === 'extracting'}
            className="shrink-0 text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {installing || progress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              actionLabel
            )}
          </button>
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        )}
      </div>

      {progress && progress.phase !== 'done' && progress.phase !== 'error' && (
        <div className="mt-2">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">{progress.message}</p>
        </div>
      )}

      {!status?.installed && !progress && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Download className="h-3 w-3" />
          Download via CDN Polaris ou importação local opcional
        </p>
      )}
    </li>
  );
}

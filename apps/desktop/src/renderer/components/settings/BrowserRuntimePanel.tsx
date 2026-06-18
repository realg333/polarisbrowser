import { useEffect, useState } from 'react';

import { RefreshCw, Search, CheckCircle2, XCircle } from 'lucide-react';

import type { AntidetectEngine, BrowserRuntimeStatus } from '@polaris/shared';

import { ANTIDETECT_ENGINE_LABELS } from '@polaris/shared';

import { Input } from '@/components/ui/input';

import { TooltipButton } from '@/components/shared/TooltipButton';

import { cn } from '@/lib/utils';

import { useBrowserRuntimes } from '@/hooks/useBrowserRuntimes';



const ANTIDETECT_ENGINES: AntidetectEngine[] = ['sunbrowser', 'flowerbrowser'];



interface BrowserRuntimePanelProps {

  onPathSave: (engine: AntidetectEngine, path: string) => void;

}



export function BrowserRuntimePanel({ onPathSave }: BrowserRuntimePanelProps): React.ReactElement {

  const {

    runtimes,

    progressMap,

    install,

    importEngine,

    refresh,

    isInstalling,

    installingEngine,

    isRefreshing,

  } = useBrowserRuntimes();



  return (

    <div className="space-y-3">

      <div className="flex items-center justify-between gap-2">

        <p className="text-xs text-muted-foreground">

          Baixe pela Central de Download (CDN Polaris). Importar só funciona se você já tiver uma suite instalada no PC.

        </p>

        <TooltipButton

          tooltip="Verificar atualizações no manifest"

          variant="outline"

          size="sm"

          onClick={() => refresh()}

          disabled={isRefreshing}

        >

          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />

        </TooltipButton>

      </div>



      {ANTIDETECT_ENGINES.map((engine) => {

        const status = runtimes.find((r) => r.engine === engine);

        const progress = progressMap[engine];

        return (

          <RuntimeCard

            key={engine}

            engine={engine}

            status={status}

            progress={progress ? `${progress.message} (${progress.percent}%)` : ''}

            onInstall={() => install(engine)}

            onImport={() => importEngine(engine)}

            onPathSave={(path) => onPathSave(engine, path)}

            installing={isInstalling && installingEngine === engine}

          />

        );

      })}

    </div>

  );

}



function RuntimeCard({

  engine,

  status,

  progress,

  onInstall,

  onImport,

  onPathSave,

  installing,

}: {

  engine: AntidetectEngine;

  status?: BrowserRuntimeStatus;

  progress?: string;

  onInstall: () => void;

  onImport: () => void;

  onPathSave: (path: string) => void;

  installing: boolean;

}): React.ReactElement {

  const [customPath, setCustomPath] = useState(status?.path ?? '');

  const label = ANTIDETECT_ENGINE_LABELS[engine];

  const installed = status?.installed ?? false;

  useEffect(() => {
    setCustomPath(status?.path ?? '');
  }, [status?.path]);

  return (

    <div className="rounded-xl border border-border/60 bg-card/30 p-3.5">

      <div className="flex items-center justify-between gap-2">

        <div className="flex items-center gap-2">

          {installed ? (

            <CheckCircle2 className="h-4 w-4 text-success" />

          ) : (

            <XCircle className="h-4 w-4 text-muted-foreground" />

          )}

          <div>

            <span className="text-sm font-medium">{label}</span>

            <p className="text-[11px] text-muted-foreground">

              {status?.kernelFamily === 'firefox' ? 'Motor Firefox' : 'Motor Chromium'}

              {status?.version ? ` · v${status.version}` : ''}

              {status?.updateAvailable && status.latestVersion

                ? ` · atualização ${status.latestVersion} disponível`

                : ''}

            </p>

          </div>

        </div>

        <span

          className={cn(

            'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',

            installed ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-muted/50 text-muted-foreground',

          )}

        >

          {installed ? 'Pronto' : 'Ausente'}

        </span>

      </div>



      {status?.path && (

        <p className="mt-1.5 truncate font-mono text-[10px] text-muted-foreground">{status.path}</p>

      )}



      {progress && <p className="mt-2 text-xs text-primary">{progress}</p>}



      <div className="mt-3 flex flex-wrap gap-2">

        <TooltipButton

          tooltip={`Detectar ou baixar ${label}`}

          variant="gradient"

          size="sm"

          onClick={onInstall}

          disabled={installing}

        >

          {installing ? 'Instalando...' : status?.updateAvailable ? 'Atualizar' : 'Detectar / baixar'}

        </TooltipButton>

        <TooltipButton tooltip="Importar de AdsPower ou instalação existente" variant="outline" size="sm" onClick={onImport}>

          <Search className="h-3.5 w-3.5" />

          Importar

        </TooltipButton>

      </div>



      <div className="mt-2.5 flex gap-2">

        <Input

          placeholder="Caminho completo do .exe no seu PC"

          value={customPath}

          onChange={(e) => setCustomPath(e.target.value)}

          className="font-mono text-xs"

        />

        <TooltipButton

          tooltip="Salvar caminho"

          variant="outline"

          size="icon"

          onClick={() => onPathSave(customPath)}

        >

          OK

        </TooltipButton>

      </div>

    </div>

  );

}



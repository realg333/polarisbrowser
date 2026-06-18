import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AntidetectEngine, BrowserInstallProgress, BrowserRuntimeStatus } from '@polaris/shared';
import { ANTIDETECT_ENGINE_LABELS } from '@polaris/shared';

const ENGINES: AntidetectEngine[] = ['sunbrowser', 'flowerbrowser'];

export function useBrowserRuntimes() {
  const queryClient = useQueryClient();
  const [progressMap, setProgressMap] = useState<Record<string, BrowserInstallProgress>>({});

  const { data: runtimes = [], refetch, isLoading } = useQuery({
    queryKey: ['browser-runtimes'],
    queryFn: () => window.polaris.browsers.getRuntimeStatus(),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const unsub = window.polaris.browsers.onInstallProgress((p) => {
      setProgressMap((prev) => ({ ...prev, [p.engine]: p }));
      if (p.phase === 'done' || p.phase === 'error') {
        void refetch();
        queryClient.invalidateQueries({ queryKey: ['browsers'] });
        setTimeout(() => {
          setProgressMap((prev) => {
            const next = { ...prev };
            delete next[p.engine];
            return next;
          });
        }, 2500);
      }
    });
    return unsub;
  }, [queryClient, refetch]);

  const pending = runtimes.filter((r) => !r.installed || r.updateAvailable);
  const busy = Object.keys(progressMap).length > 0;

  const installMutation = useMutation({
    mutationFn: (engine: AntidetectEngine) => window.polaris.browsers.installRuntime(engine),
    onSuccess: (result, engine) => {
      if (result.success) {
        toast.success(`${ANTIDETECT_ENGINE_LABELS[engine]} pronto`);
        queryClient.invalidateQueries({ queryKey: ['browsers'] });
        queryClient.invalidateQueries({ queryKey: ['browser-runtimes'] });
      } else {
        toast.error(result.error ?? 'Falha na instalação');
      }
    },
  });

  const installAllMutation = useMutation({
    mutationFn: () => window.polaris.browsers.installAllRuntimes(),
    onSuccess: (results) => {
      const ok = ENGINES.filter((e) => results[e]?.success);
      const fail = ENGINES.filter((e) => !results[e]?.success);
      if (ok.length > 0) toast.success(`${ok.length} runtime(s) prontos`);
      if (fail.length > 0) toast.error(`${fail.length} runtime(s) pendentes — use a Central de Download ou informe o caminho manual`);
      queryClient.invalidateQueries({ queryKey: ['browsers'] });
      queryClient.invalidateQueries({ queryKey: ['browser-runtimes'] });
    },
  });

  const importMutation = useMutation({
    mutationFn: (engine: AntidetectEngine) => window.polaris.browsers.importRuntime(engine),
    onSuccess: (result, engine) => {
      if (result.success) {
        toast.success(`${ANTIDETECT_ENGINE_LABELS[engine]} importado`);
        queryClient.invalidateQueries({ queryKey: ['browsers'] });
        queryClient.invalidateQueries({ queryKey: ['browser-runtimes'] });
      } else {
        toast.error(result.error ?? 'Nada encontrado para importar');
      }
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => window.polaris.browsers.checkRuntimeUpdates(),
    onSuccess: (statuses) => {
      queryClient.setQueryData(['browser-runtimes'], statuses);
    },
  });

  return {
    runtimes,
    pending,
    pendingCount: pending.length,
    progressMap,
    busy,
    isLoading,
    install: (engine: AntidetectEngine) => installMutation.mutate(engine),
    installAll: () => installAllMutation.mutate(),
    importEngine: (engine: AntidetectEngine) => importMutation.mutate(engine),
    refresh: () => refreshMutation.mutate(),
    installingEngine: installMutation.variables,
    isInstalling: installMutation.isPending,
    isInstallingAll: installAllMutation.isPending,
    isRefreshing: refreshMutation.isPending,
    refetch,
  };
}

export function getRuntimeActionLabel(status?: BrowserRuntimeStatus): string {
  if (!status?.installed) return 'Baixar';
  if (status.updateAvailable) return 'Atualizar';
  return 'Pronto';
}

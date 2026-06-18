import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, FolderOpen, Check, Moon, Sun, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { BrowserEngine } from '@polaris/shared';
import { BROWSER_ENGINE_LABELS } from '@polaris/shared';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { BillingSection } from '@/components/settings/BillingSection';
import { BrowserRuntimePanel } from '@/components/settings/BrowserRuntimePanel';
import { cn } from '@/lib/utils';

export function SettingsPage(): React.ReactElement {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const resetTour = useAppStore((s) => s.resetTour);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: detected } = useQuery({
    queryKey: ['browsers'],
    queryFn: () => window.polaris.browsers.detect(),
  });

  const setPathMutation = useMutation({
    mutationFn: ({ engine, path }: { engine: BrowserEngine; path: string }) =>
      window.polaris.browsers.setPath(engine, path || null),
    onSuccess: () => {
      toast.success('Caminho atualizado');
      queryClient.invalidateQueries({ queryKey: ['browsers'] });
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 density-comfortable">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Preferências, navegadores e plano.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aparência</CardTitle>
          <CardDescription>Tema polar — claro como neve ou escuro como céu ártico</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <ThemeOption
            label="Escuro"
            description="Ártico — recomendado"
            icon={Moon}
            selected={theme === 'dark'}
            preview="from-[#0a0f1d] to-[#0c1830]"
            onClick={() => {
              setTheme('dark');
              document.documentElement.classList.add('dark');
            }}
          />
          <ThemeOption
            label="Claro"
            description="Neve polar"
            icon={Sun}
            selected={theme === 'light'}
            preview="from-[#eef4fb] to-[#dbeafe]"
            onClick={() => {
              setTheme('light');
              document.documentElement.classList.remove('dark');
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navegadores anti-detect</CardTitle>
          <CardDescription>
            SunBrowser (Chromium) e Flower Browser (Firefox) — baixe, importe ou atualize os runtimes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrowserRuntimePanel
            onPathSave={(engine, path) => setPathMutation.mutate({ engine, path })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Chrome</CardTitle>
          <CardDescription>Caminho opcional para perfis legados com Chrome.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <BrowserPathRow
            engine="chrome"
            label={BROWSER_ENGINE_LABELS.chrome}
            detected={detected?.chrome ?? false}
            path={detected?.paths.chrome ?? ''}
            onSave={(path) => setPathMutation.mutate({ engine: 'chrome', path })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tour guiado</CardTitle>
          <CardDescription>Reveja o tutorial interativo do Polaris Browser</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipButton
            tooltip="Iniciar tour guiado pelo app"
            variant="outline"
            onClick={() => {
              resetTour();
              navigate('/dashboard');
              toast.success('Tour iniciado');
            }}
          >
            <Sparkles className="h-4 w-4" />
            Refazer tour
          </TooltipButton>
        </CardContent>
      </Card>

      <BillingSection />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sobre</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Polaris Browser</span> v0.1.0
          </p>
          <p className="mt-1">Gerenciamento de perfis com SunBrowser, Flower Browser e Chrome.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeOption({
  label,
  description,
  icon: Icon,
  selected,
  preview,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  preview: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border p-3 text-left transition-all duration-200',
        selected ? 'border-primary/60 ring-2 ring-primary/30' : 'border-border hover:border-primary/40',
      )}
    >
      <div className={cn('mb-3 h-16 w-full rounded-lg bg-gradient-to-br', preview)} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-aurora text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  );
}

function BrowserPathRow({
  label,
  detected,
  path,
  onSave,
}: {
  engine: BrowserEngine;
  label: string;
  detected: boolean;
  path: string;
  onSave: (path: string) => void;
}): React.ReactElement {
  const [customPath, setCustomPath] = useState(path);

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {detected ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[11px] font-medium',
            detected ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-muted/50 text-muted-foreground',
          )}
        >
          {detected ? 'Detectado' : 'Não encontrado'}
        </span>
      </div>
      {path && <p className="mt-1.5 truncate font-mono text-[10px] text-muted-foreground">{path}</p>}
      <div className="mt-2.5 flex gap-2">
        <Input
          placeholder="C:\caminho\para\navegador.exe"
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
          className="font-mono text-xs"
        />
        <TooltipButton
          tooltip={`Salvar caminho personalizado do ${label}`}
          variant="outline"
          size="icon"
          onClick={() => onSave(customPath)}
        >
          <FolderOpen className="h-4 w-4" />
        </TooltipButton>
      </div>
    </div>
  );
}

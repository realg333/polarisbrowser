import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Fingerprint, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AntidetectEngine, FingerprintConfig, ProxyConfig, GeoSyncPatch } from '@polaris/shared';
import {
  ANTIDETECT_ENGINE_LABELS,
  ANTIDETECT_ENGINES,
  generateAutoFingerprint,
} from '@polaris/shared';
import { Input } from '@/components/ui/input';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { FingerprintConfigPanel } from '@/components/profiles/FingerprintConfigPanel';
import { ProxyConfigPanel } from '@/components/profiles/ProxyConfigPanel';
import { cn } from '@/lib/utils';
import { TagPicker } from '@/components/profiles/TagFilterBar';

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (profileId: string) => void;
}

type DialogTab = 'basic' | 'fingerprint';

export function CreateProfileDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateProfileDialogProps): React.ReactElement | null {
  const [tab, setTab] = useState<DialogTab>('basic');
  const [name, setName] = useState('');
  const [startUrl, setStartUrl] = useState('https://google.com');
  const [browserEngine, setBrowserEngine] = useState<AntidetectEngine>('sunbrowser');
  const [fingerprint, setFingerprint] = useState<FingerprintConfig>(() => generateAutoFingerprint('windows'));
  const [proxy, setProxy] = useState<ProxyConfig | null>(null);
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [locale, setLocale] = useState('pt-BR');
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: () => window.polaris.folders.list(),
    enabled: open,
  });

  const [folderId, setFolderId] = useState<string>('');
  const [tagIds, setTagIds] = useState<string[]>([]);

  const resetForm = (): void => {
    setTab('basic');
    setName('');
    setStartUrl('https://google.com');
    setBrowserEngine('sunbrowser');
    setFingerprint(generateAutoFingerprint('windows'));
    setProxy(null);
    setLanguage('pt-BR');
    setTimezone('America/Sao_Paulo');
    setLocale('pt-BR');
    setFolderId('');
    setTagIds([]);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      window.polaris.profiles.create({
        name: name.trim(),
        startUrl: startUrl || 'about:blank',
        browserEngine,
        fingerprint,
        proxy,
        language,
        timezone,
        locale,
        folderId: folderId || undefined,
        tagIds: tagIds.length ? tagIds : undefined,
      }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.profile) {
        toast.success('Perfil criado com fingerprint automático');
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
        queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
        onCreated?.(result.profile.id);
        resetForm();
        onOpenChange(false);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar perfil');
    },
  });

  const applyGeoSync = (patch: GeoSyncPatch): void => {
    setTimezone(patch.timezone);
    setLanguage(patch.language);
    setLocale(patch.locale);
    setFingerprint((fp) => ({ ...fp, ...patch.fingerprint }));
  };

  const handleCreate = (): void => {
    if (!name.trim()) {
      toast.error('Informe o nome do perfil para continuar');
      setTab('basic');
      return;
    }
    createMutation.mutate();
  };

  if (!open) return null;

  const tabs: { id: DialogTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'basic', label: 'Básico', icon: Settings2 },
    { id: 'fingerprint', label: 'Fingerprint', icon: Fingerprint },
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex animate-fade-in items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="glass-strong flex max-h-[92vh] w-full max-w-2xl animate-scale-in flex-col overflow-hidden rounded-2xl shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aurora text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Novo perfil</h2>
              <p className="text-xs text-muted-foreground">SunBrowser ou Flower — fingerprint gerado automaticamente</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Nome do perfil *</label>
            <Input
              className="mt-1.5"
              placeholder="Ex: Loja Principal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="mt-4 flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  tab === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent',
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-6">
          {tab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Navegador anti-detect</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ANTIDETECT_ENGINES.map((engine) => (
                    <button
                      key={engine}
                      type="button"
                      onClick={() => setBrowserEngine(engine)}
                      className={cn(
                        'rounded-lg border px-3 py-3 text-left text-sm transition-colors',
                        browserEngine === engine
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent',
                      )}
                    >
                      <span className="font-medium">{ANTIDETECT_ENGINE_LABELS[engine]}</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {engine === 'sunbrowser'
                          ? 'Recomendado · anti-detect nativo'
                          : 'Alternativa anti-detect'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">URL inicial</label>
                <Input className="mt-1" value={startUrl} onChange={(e) => setStartUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Pasta</label>
                <select
                  className="mt-1 flex h-10 w-full cursor-pointer rounded-lg border border-input bg-background/60 px-3 text-sm"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                >
                  <option value="">Sem pasta</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="mt-2">
                  <TagPicker selectedIds={tagIds} onChange={setTagIds} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Proxy</label>
                <div className="mt-2">
                  <ProxyConfigPanel proxy={proxy} onChange={setProxy} onGeoSync={applyGeoSync} />
                </div>
              </div>
            </div>
          )}

          {tab === 'fingerprint' && (
            <FingerprintConfigPanel fingerprint={fingerprint} onChange={setFingerprint} />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 bg-card/40 px-6 py-4 backdrop-blur-sm">
          {tab === 'basic' ? (
            <button
              type="button"
              className="cursor-pointer text-sm text-primary hover:underline"
              onClick={() => setTab('fingerprint')}
            >
              Ver fingerprint gerado →
            </button>
          ) : (
            <button
              type="button"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setTab('basic')}
            >
              ← Voltar ao básico
            </button>
          )}
          <div className="flex gap-2">
            <TooltipButton tooltip="Cancelar" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </TooltipButton>
            <TooltipButton
              tooltip={name.trim() ? 'Criar perfil' : 'Preencha o nome do perfil acima'}
              variant="gradient"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar perfil'}
            </TooltipButton>
          </div>
        </div>
      </div>
    </div>
  );
}

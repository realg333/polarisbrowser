import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Play, Copy, Archive, Save, Monitor, Globe, Fingerprint, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { ProfileWithMeta } from '@polaris/shared';
import {
  BROWSER_ENGINE_LABELS,
  FINGERPRINT_OS_LABELS,
  ANTIDETECT_ENGINE_LABELS,
  ANTIDETECT_ENGINES,
  resolveFingerprint,
  type FingerprintConfig,
} from '@polaris/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { TagBadges } from '@/components/profiles/TagFilterBar';
import { FingerprintConfigPanel } from '@/components/profiles/FingerprintConfigPanel';
import { ProxyConfigPanel } from '@/components/profiles/ProxyConfigPanel';
import { cn } from '@/lib/utils';

type Tab = 'geral' | 'navegacao' | 'fingerprint';

interface ProfileDetailSheetProps {
  profileId: string | null;
  onClose: () => void;
  initialTab?: Tab;
}

export function ProfileDetailSheet({ profileId, onClose, initialTab }: ProfileDetailSheetProps): React.ReactElement | null {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'geral');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab, profileId]);

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => (profileId ? window.polaris.profiles.get(profileId) : null),
    enabled: !!profileId,
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: () => window.polaris.folders.list(),
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => window.polaris.tags.list(),
  });

  const [form, setForm] = useState<Partial<ProfileWithMeta>>({});

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      window.polaris.profiles.update(profileId!, {
        name: form.name,
        description: form.description,
        startUrl: form.startUrl,
        language: form.language,
        timezone: form.timezone,
        locale: form.locale,
        proxy: form.proxy ?? null,
        adBlocker: form.adBlocker,
        folderId: form.folderId,
        notes: form.notes,
        browserEngine: form.browserEngine,
        fingerprint: form.fingerprint,
        tagIds: form.tags?.map((t) => t.id),
      }),
    onSuccess: () => {
      toast.success('Perfil salvo');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
    },
  });

  const launchMutation = useMutation({
    mutationFn: () => window.polaris.profiles.launch(profileId!),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Abrindo no ${BROWSER_ENGINE_LABELS[form.browserEngine ?? 'sunbrowser']}`);
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
      } else {
        const message = result.error ?? 'Erro ao iniciar';
        if (message.includes('não encontrado')) {
          toast.error(message, {
            action: {
              label: 'Configurações',
              onClick: () => navigate('/settings'),
            },
          });
        } else {
          toast.error(message);
        }
      }
    },
  });

  const launchValidationMutation = useMutation({
    mutationFn: () => window.polaris.profiles.launchValidation(profileId!),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Abrindo checklist de validação de fingerprint');
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
      } else {
        toast.error(result.error ?? 'Erro ao iniciar validação');
      }
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => window.polaris.profiles.duplicate(profileId!),
    onSuccess: () => {
      toast.success('Perfil duplicado');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onClose();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => window.polaris.profiles.archive(profileId!),
    onSuccess: () => {
      toast.success('Perfil arquivado');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onClose();
    },
  });

  if (!profileId || !profile) return null;

  const setFingerprint = (fingerprint: FingerprintConfig): void => {
    setForm((f) => ({ ...f, fingerprint }));
  };

  const toggleTag = (tagId: string): void => {
    setForm((f) => {
      const current = f.tags ?? [];
      const exists = current.some((t) => t.id === tagId);
      const tag = allTags.find((t) => t.id === tagId);
      if (!tag) return f;
      return {
        ...f,
        tags: exists ? current.filter((t) => t.id !== tagId) : [...current, tag],
      };
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'geral', label: 'Geral', icon: Monitor },
    { id: 'navegacao', label: 'Navegação', icon: Globe },
    { id: 'fingerprint', label: 'Fingerprint', icon: Fingerprint },
  ];

  const running = profile.status === 'running';
  const initial = (profile.name.trim()[0] ?? 'P').toUpperCase();

  return (
    <div className="fixed inset-0 z-[110] flex animate-fade-in justify-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong flex h-full w-full max-w-[640px] animate-slide-in-right flex-col border-l border-border/60 shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/20 to-transparent font-display text-base font-semibold text-primary">
                {initial}
              </div>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                  running ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-muted-foreground/50',
                )}
              />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-semibold">{profile.name}</h2>
              <p className="truncate text-xs text-muted-foreground">
                {BROWSER_ENGINE_LABELS[profile.browserEngine]} · {FINGERPRINT_OS_LABELS[profile.fingerprint.os]}
              </p>
            </div>
          </div>
          <TooltipButton tooltip="Fechar painel de detalhes" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </TooltipButton>
        </div>

        <div className="flex gap-1 border-b border-border/60 px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex cursor-pointer items-center gap-1.5 px-3 py-3 text-sm transition-colors duration-200',
                tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-aurora shadow-glow" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {tab === 'geral' && (
            <>
              <Field label="Nome">
                <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Pasta">
                <select
                  className="flex h-10 w-full cursor-pointer rounded-lg border border-input bg-background/60 px-3 text-sm transition-colors hover:border-border focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  value={form.folderId ?? ''}
                  onChange={(e) => setForm({ ...form, folderId: e.target.value || null })}
                >
                  <option value="">Sem pasta</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tags">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const selected = form.tags?.some((t) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs',
                          selected ? 'ring-2 ring-primary' : 'opacity-60',
                        )}
                        style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Notas">
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm transition-colors hover:border-border focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </>
          )}

          {tab === 'navegacao' && (
            <>
              <Field label="Navegador anti-detect">
                <div className="grid grid-cols-1 gap-2">
                  {ANTIDETECT_ENGINES.map((engine) => (
                    <button
                      key={engine}
                      type="button"
                      onClick={() => setForm({ ...form, browserEngine: engine })}
                      className={cn(
                        'rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                        form.browserEngine === engine
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-accent',
                      )}
                    >
                      <span className="font-medium">{ANTIDETECT_ENGINE_LABELS[engine]}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {engine === 'sunbrowser'
                          ? 'Recomendado para multi-conta e fingerprint'
                          : 'Alternativa anti-detect com perfis isolados'}
                      </p>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="URL inicial">
                <Input value={form.startUrl ?? ''} onChange={(e) => setForm({ ...form, startUrl: e.target.value })} />
              </Field>
              <Field label="Idioma">
                <Input value={form.language ?? ''} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </Field>
              <Field label="Timezone">
                <Input value={form.timezone ?? ''} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
              </Field>
              <Field label="Proxy">
                <ProxyConfigPanel
                  proxy={form.proxy ?? null}
                  onChange={(proxy) => setForm({ ...form, proxy })}
                  onGeoSync={(patch) =>
                    setForm((f) => ({
                      ...f,
                      timezone: patch.timezone,
                      language: patch.language,
                      locale: patch.locale,
                      fingerprint: f.fingerprint
                        ? { ...f.fingerprint, ...patch.fingerprint }
                        : f.fingerprint,
                    }))
                  }
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.adBlocker ?? false}
                  onChange={(e) => setForm({ ...form, adBlocker: e.target.checked })}
                />
                Bloqueador de anúncios
              </label>
            </>
          )}

          {tab === 'fingerprint' && form.fingerprint && (
            <FingerprintConfigPanel
              fingerprint={resolveFingerprint(form.fingerprint)}
              onChange={setFingerprint}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 p-4">
          <div className="flex gap-1">
            <TooltipButton
              tooltip="Abrir perfil no navegador selecionado"
              variant="gradient"
              onClick={() => launchMutation.mutate()}
              disabled={profile.status === 'archived'}
            >
              <Play className="h-4 w-4" />
              Launch
            </TooltipButton>
            <TooltipButton
              tooltip="Abrir checklist browserleaks / creepjs"
              variant="outline"
              size="icon"
              onClick={() => launchValidationMutation.mutate()}
              disabled={profile.status === 'archived'}
            >
              <ShieldCheck className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton tooltip="Duplicar perfil" variant="outline" size="icon" onClick={() => duplicateMutation.mutate()}>
              <Copy className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton tooltip="Arquivar perfil" variant="outline" size="icon" onClick={() => archiveMutation.mutate()}>
              <Archive className="h-4 w-4" />
            </TooltipButton>
          </div>
          <TooltipButton
            tooltip="Salvar alterações do perfil"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4" />
            Salvar
          </TooltipButton>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

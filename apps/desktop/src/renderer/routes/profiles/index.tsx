import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Play, Copy, Archive, Trash2, Search, LayoutGrid, List, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { ProfileWithMeta } from '@polaris/shared';
import { BROWSER_ENGINE_LABELS, FINGERPRINT_OS_LABELS } from '@polaris/shared';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { formatRelativeTime, cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { CreateProfileDialog } from '@/components/profiles/CreateProfileDialog';
import { FolderTree, FolderChips } from '@/components/profiles/FolderTree';
import { TagFilterBar, TagBadges } from '@/components/profiles/TagFilterBar';
import { ProfileDetailSheet } from '@/components/profiles/ProfileDetailSheet';
import { ProfileCard } from '@/components/profiles/ProfileCard';

export function ProfilesPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const showCreate = searchParams.get('new') === 'true';
  const queryClient = useQueryClient();

  const profileViewMode = useAppStore((s) => s.profileViewMode);
  const setProfileViewMode = useAppStore((s) => s.setProfileViewMode);
  const selectedFolderId = useAppStore((s) => s.selectedFolderId);
  const selectedTagId = useAppStore((s) => s.selectedTagId);
  const selectedProfileId = useAppStore((s) => s.selectedProfileId);
  const setSelectedProfileId = useAppStore((s) => s.setSelectedProfileId);

  const profileParam = searchParams.get('profile');
  const tabParam = searchParams.get('tab');
  const detailTab = tabParam === 'fingerprint' ? 'fingerprint' : tabParam === 'navegacao' ? 'navegacao' : undefined;

  useEffect(() => {
    if (profileParam) {
      setSelectedProfileId(profileParam);
    }
  }, [profileParam, setSelectedProfileId]);

  const folderFilter =
    selectedFolderId === 'all' ? undefined : selectedFolderId === 'none' ? null : selectedFolderId;

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles', search, folderFilter, selectedTagId],
    queryFn: () =>
      window.polaris.profiles.list({
        search: search || undefined,
        folderId: folderFilter,
        tagId: selectedTagId ?? undefined,
      }),
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: () => window.polaris.folders.list(),
  });

  const launchMutation = useMutation({
    mutationFn: (id: string) => window.polaris.profiles.launch(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Perfil iniciado');
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
      } else {
        toast.error(result.error ?? 'Erro ao iniciar perfil');
      }
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => window.polaris.profiles.duplicate(id),
    onSuccess: () => {
      toast.success('Perfil duplicado');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: () => toast.error('Limite de perfis atingido ou erro ao duplicar'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => window.polaris.profiles.archive(id),
    onSuccess: () => {
      toast.success('Perfil arquivado');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.polaris.profiles.delete(id),
    onSuccess: () => {
      toast.success('Perfil excluído');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const profileActions = (profile: ProfileWithMeta) => ({
    onOpen: () => setSelectedProfileId(profile.id),
    onLaunch: () => launchMutation.mutate(profile.id),
    onDuplicate: () => duplicateMutation.mutate(profile.id),
    onArchive: () => archiveMutation.mutate(profile.id),
    onDelete: () => {
      if (confirm(`Excluir perfil "${profile.name}"?`)) deleteMutation.mutate(profile.id);
    },
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="glass h-full rounded-xl p-2">
          <FolderTree />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col space-y-4 density-compact" data-tour="tour-profiles-area">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Perfis</h1>
            <p className="text-sm text-muted-foreground">Gerencie perfis com SunBrowser, Flower ou Chrome.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-card/40 p-0.5 backdrop-blur-sm">
              <TooltipButton
                tooltip="Visualização em tabela compacta"
                size="icon"
                variant={profileViewMode === 'table' ? 'secondary' : 'ghost'}
                className="h-8 w-8"
                onClick={() => setProfileViewMode('table')}
              >
                <List className="h-4 w-4" />
              </TooltipButton>
              <TooltipButton
                tooltip="Visualização em cards"
                size="icon"
                variant={profileViewMode === 'cards' ? 'secondary' : 'ghost'}
                className="h-8 w-8"
                onClick={() => setProfileViewMode('cards')}
              >
                <LayoutGrid className="h-4 w-4" />
              </TooltipButton>
            </div>
            <TooltipButton
              tooltip="Criar um novo perfil de navegação"
              variant="gradient"
              data-tour="tour-new-profile"
              onClick={() => setSearchParams({ new: 'true' })}
            >
              <Plus className="h-4 w-4" />
              Novo perfil
            </TooltipButton>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar perfis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <FolderChips folders={folders} />
        <TagFilterBar />

        {isLoading ? (
          <div className={cn(profileViewMode === 'cards' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-2')}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="shimmer h-24 rounded-xl border border-border/60 bg-muted/30" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <Card className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-aurora-soft">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold">Nenhum perfil encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? 'Tente outra busca ou limpe os filtros' : 'Crie seu primeiro perfil para começar'}
            </p>
            {!search && (
              <TooltipButton
                tooltip="Criar seu primeiro perfil de navegação"
                variant="gradient"
                className="mt-5"
                onClick={() => setSearchParams({ new: 'true' })}
              >
                <Plus className="h-4 w-4" />
                Criar primeiro perfil
              </TooltipButton>
            )}
          </Card>
        ) : profileViewMode === 'cards' ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} {...profileActions(profile)} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-[1fr_90px_100px_80px_100px_110px] gap-2 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Nome</span>
              <span>Navegador</span>
              <span>OS</span>
              <span>Tags</span>
              <span>Último uso</span>
              <span className="text-right">Ações</span>
            </div>
            {profiles.map((profile) => (
              <ProfileTableRow key={profile.id} profile={profile} {...profileActions(profile)} />
            ))}
          </Card>
        )}
      </div>

      <CreateProfileDialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) setSearchParams({});
        }}
        onCreated={(id) => {
          setSelectedProfileId(id);
          setSearchParams({ profile: id, tab: 'fingerprint' });
        }}
      />

      <ProfileDetailSheet
        profileId={selectedProfileId}
        initialTab={detailTab}
        onClose={() => {
          setSelectedProfileId(null);
          setSearchParams({});
        }}
      />
    </div>
  );
}

function ProfileTableRow({
  profile,
  onOpen,
  onLaunch,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  profile: ProfileWithMeta;
  onOpen: () => void;
  onLaunch: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const running = profile.status === 'running';

  return (
    <div
      className="compact-row grid cursor-pointer grid-cols-[1fr_90px_100px_80px_100px_110px] items-center gap-2 border-b border-border/40 px-4 py-2 transition-colors duration-150 last:border-0 hover:bg-accent/40"
      onClick={onOpen}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />}
          <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', running ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-muted-foreground/50')} />
        </span>
        <span className="truncate text-sm font-medium">{profile.name}</span>
      </div>
      <span className="truncate text-[11px] text-muted-foreground">
        {BROWSER_ENGINE_LABELS[profile.browserEngine].split(' ')[0]}
      </span>
      <span className="truncate text-[11px] text-muted-foreground">
        {FINGERPRINT_OS_LABELS[profile.fingerprint.os].split(' ')[0]}
      </span>
      <TagBadges tags={profile.tags} />
      <span className="text-[11px] text-muted-foreground">{formatRelativeTime(profile.lastUsedAt)}</span>
      <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
        <TooltipButton tooltip="Launch" size="icon" variant="ghost" className="h-7 w-7" onClick={onLaunch} disabled={profile.status === 'archived'}>
          <Play className="h-3.5 w-3.5" />
        </TooltipButton>
        <TooltipButton tooltip="Duplicar" size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" />
        </TooltipButton>
        <TooltipButton tooltip="Arquivar" size="icon" variant="ghost" className="h-7 w-7" onClick={onArchive}>
          <Archive className="h-3.5 w-3.5" />
        </TooltipButton>
        <TooltipButton tooltip="Excluir" size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </TooltipButton>
      </div>
    </div>
  );
}

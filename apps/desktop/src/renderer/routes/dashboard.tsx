import { useQuery } from '@tanstack/react-query';
import { Plus, Play, Users, Activity, Clock, Cpu, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { formatRelativeTime, cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { ProfileWithMeta } from '@polaris/shared';

type Accent = 'cyan' | 'emerald' | 'violet' | 'amber';

const ACCENT: Record<Accent, string> = {
  cyan: 'from-primary/25 to-primary/0 text-primary border-primary/25',
  emerald: 'from-success/25 to-success/0 text-success border-success/25',
  violet: 'from-aurora-2/25 to-aurora-2/0 text-aurora-2 border-aurora-2/25',
  amber: 'from-warning/25 to-warning/0 text-warning border-warning/25',
};

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const userName = useAppStore((s) => s.userName);
  const workspaceName = useAppStore((s) => s.workspaceName);
  const setSelectedProfileId = useAppStore((s) => s.setSelectedProfileId);

  const { data: stats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => window.polaris.profiles.stats(),
    refetchInterval: 5000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => window.polaris.profiles.list(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => window.polaris.monitor.metrics(),
    refetchInterval: 5000,
  });

  const recentProfiles = profiles.slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const displayName = userName.trim() || 'usuário';

  const openProfile = (id: string): void => {
    setSelectedProfileId(id);
    navigate(`/profiles?profile=${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4" data-tour="tour-dashboard-welcome">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {workspaceName.trim() || 'Polaris Workspace'}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {greeting}, <span className="text-gradient">{displayName}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus perfis de navegação isolados e mantenha tudo sob controle.
          </p>
        </div>
        <TooltipButton tooltip="Criar um novo perfil de navegação isolado" variant="gradient" size="lg" asChild>
          <Link to="/profiles?new=true">
            <Plus className="h-4 w-4" />
            Novo perfil
          </Link>
        </TooltipButton>
      </div>

      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Perfis totais" value={stats?.total ?? 0} icon={Users} subtitle={`${stats?.archived ?? 0} arquivados`} accent="cyan" />
        <StatCard title="Ativos agora" value={stats?.running ?? 0} icon={Activity} subtitle="Em execução" accent="emerald" live={(stats?.running ?? 0) > 0} />
        <StatCard title="Inativos" value={stats?.idle ?? 0} icon={Clock} subtitle="Aguardando launch" accent="violet" />
        <StatCard title="CPU" value={`${metrics?.cpuPercent ?? 0}%`} icon={Cpu} subtitle={`RAM: ${metrics?.memoryUsedMb ?? 0} MB`} accent="amber" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-semibold">Perfis recentes</h2>
            {profiles.length > 0 && <Badge variant="muted">{profiles.length}</Badge>}
          </div>
          <Link
            to="/profiles"
            className="group inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <CardContent className="p-3">
          {recentProfiles.length === 0 ? (
            <EmptyDashboard />
          ) : (
            <div className="space-y-1">
              {recentProfiles.map((profile) => (
                <ProfileRow key={profile.id} profile={profile} onOpen={() => openProfile(profile.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  accent,
  live,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
  accent: Accent;
  live?: boolean;
}): React.ReactElement {
  return (
    <Card className="group relative overflow-hidden p-5 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-glow">
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-primary/0 blur-2xl transition-colors duration-300 group-hover:bg-primary/10" />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br', ACCENT[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {live && <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))] animate-pulse" />}
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  );
}

function ProfileRow({ profile, onOpen }: { profile: ProfileWithMeta; onOpen: () => void }): React.ReactElement {
  const handleLaunch = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    const result = await window.polaris.profiles.launch(profile.id);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const running = profile.status === 'running';

  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-200 hover:border-border/60 hover:bg-accent/40"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />}
          <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', running ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-muted-foreground/50')} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{profile.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {profile.startUrl} · {formatRelativeTime(profile.lastUsedAt)}
          </p>
        </div>
      </div>
      <TooltipButton
        tooltip="Abrir este perfil no navegador isolado"
        size="sm"
        variant="outline"
        onClick={handleLaunch}
        disabled={profile.status === 'archived'}
      >
        <Play className="h-3 w-3" />
        Launch
      </TooltipButton>
    </div>
  );
}

function EmptyDashboard(): React.ReactElement {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-aurora-soft">
        <Users className="h-7 w-7 text-primary" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">Nenhum perfil ainda</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Crie seu primeiro perfil para começar a gerenciar sessões de navegação isoladas.
      </p>
      <TooltipButton tooltip="Criar seu primeiro perfil de navegação" variant="gradient" className="mt-5" asChild>
        <Link to="/profiles?new=true">
          <Plus className="h-4 w-4" />
          Criar primeiro perfil
        </Link>
      </TooltipButton>
    </div>
  );
}

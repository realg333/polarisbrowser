import { useQuery } from '@tanstack/react-query';
import { Cpu, MemoryStick, Activity, Users, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function MonitorPage(): React.ReactElement {
  const { data: metrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => window.polaris.monitor.metrics(),
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => window.polaris.profiles.stats(),
    refetchInterval: 5000,
  });

  const cpuPercent = metrics?.cpuPercent ?? 0;
  const memPercent = metrics ? Math.round((metrics.memoryUsedMb / metrics.memoryTotalMb) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-tour="tour-monitor">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Monitoramento</h1>
          <p className="text-sm text-muted-foreground">Uso de recursos e perfis ativos em tempo real.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))] animate-pulse" />
          Ao vivo
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GaugeCard title="Processador" icon={Cpu} value={`${cpuPercent}%`} percent={cpuPercent} subtitle="Uso total de CPU" />
        <GaugeCard
          title="Memória"
          icon={MemoryStick}
          value={`${memPercent}%`}
          percent={memPercent}
          subtitle={`${metrics?.memoryUsedMb ?? 0} MB de ${metrics?.memoryTotalMb ?? 0} MB`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat title="Perfis ativos" value={stats?.running ?? 0} icon={Activity} accent="emerald" live={(stats?.running ?? 0) > 0} />
        <MiniStat title="Total de perfis" value={stats?.total ?? 0} icon={Users} accent="cyan" />
        <MiniStat title="Inativos" value={stats?.idle ?? 0} icon={Moon} accent="muted" />
      </div>
    </div>
  );
}

function gaugeColor(percent: number): string {
  if (percent > 80) return 'hsl(var(--destructive))';
  if (percent > 55) return 'hsl(var(--warning))';
  return 'hsl(var(--success))';
}

function GaugeCard({
  title,
  icon: Icon,
  value,
  subtitle,
  percent,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  subtitle?: string;
  percent: number;
}): React.ReactElement {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const color = gaugeColor(clamped);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease', filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold tabular-nums">{value}</span>
          </div>
        </div>
        <div className="min-w-0">
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-3 h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all duration-700 ease-smooth" style={{ width: `${clamped}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniStat({
  title,
  value,
  icon: Icon,
  accent,
  live,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'emerald' | 'cyan' | 'muted';
  live?: boolean;
}): React.ReactElement {
  const accentCls =
    accent === 'emerald'
      ? 'text-success border-success/25 from-success/20'
      : accent === 'cyan'
        ? 'text-primary border-primary/25 from-primary/20'
        : 'text-muted-foreground border-border from-muted';

  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-br to-transparent', accentCls)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="flex items-center gap-2 font-display text-2xl font-bold tabular-nums">
          {value}
          {live && <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))] animate-pulse" />}
        </p>
      </div>
    </Card>
  );
}

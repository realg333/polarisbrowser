import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Globe,
  Zap,
  Activity,
  BookOpen,
  Building2,
  Settings,
  ChevronLeft,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tooltip: 'Visão geral dos seus perfis e métricas' },
  { to: '/profiles', icon: Users, label: 'Perfis', tooltip: 'Gerenciar perfis de navegação isolados' },
  { to: '/proxy', icon: Globe, label: 'Proxies', tooltip: 'Pools de proxy e rotação (V2)', disabled: true },
  { to: '/automation', icon: Zap, label: 'Automação', tooltip: 'Tarefas e webhooks (V2)', disabled: true },
  { to: '/monitor', icon: Activity, label: 'Monitor', tooltip: 'CPU, memória e perfis ativos' },
  { to: '/learn', icon: BookOpen, label: 'Aprender', tooltip: 'Tutoriais e base de conhecimento (V2)', disabled: true },
];

const bottomItems = [
  { to: '/workspace', icon: Building2, label: 'Workspace', tooltip: 'Equipe e permissões (V2)', disabled: true },
  { to: '/settings', icon: Settings, label: 'Configurações', tooltip: 'Preferências, sync e billing' },
];

export function Sidebar(): React.ReactElement {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      data-tour="tour-sidebar"
      className={cn(
        'relative z-10 flex h-full flex-col border-r border-sidebar-border/70 bg-sidebar/60 backdrop-blur-xl transition-[width] duration-300 ease-smooth',
        collapsed ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border/70 px-4">
        <PolarisMark />
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="truncate font-display text-[0.95rem] font-bold leading-tight tracking-tight">
              Polaris
            </p>
            <p className="truncate text-[11px] font-medium text-muted-foreground">Browser Manager</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-thin p-3">
        {!collapsed && <SectionLabel>Geral</SectionLabel>}
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        <div className="my-3 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />

        {!collapsed && <SectionLabel>Workspace</SectionLabel>}
        {bottomItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-aurora-soft p-3.5">
            <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-primary/25 blur-2xl" />
            <p className="text-xs font-semibold">Plano Starter</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Até 10 perfis ativos</p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full w-1/3 rounded-full bg-aurora" />
            </div>
            <Button size="sm" variant="gradient" className="mt-3 w-full" disabled>
              Fazer upgrade
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="border-t border-sidebar-border/70 p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn('w-full text-muted-foreground', collapsed && 'mx-auto')}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{collapsed ? 'Expandir' : 'Recolher'}</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

function PolarisMark(): React.ReactElement {
  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aurora shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.8)]">
      <div className="absolute inset-0 rounded-xl bg-aurora opacity-60 blur-md" />
      <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-primary-foreground" fill="currentColor" aria-hidden>
        <path d="M12 1.5l1.9 6.1a4 4 0 002.5 2.5l6.1 1.9-6.1 1.9a4 4 0 00-2.5 2.5L12 22.5l-1.9-6.1a4 4 0 00-2.5-2.5L1.5 12l6.1-1.9a4 4 0 002.5-2.5L12 1.5z" />
      </svg>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
      {children}
    </p>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  tooltip,
  collapsed,
  disabled,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tooltip: string;
  collapsed: boolean;
  disabled?: boolean;
}): React.ReactElement {
  const content = (
    <NavLink
      to={disabled ? '#' : to}
      data-tour={to === '/profiles' ? 'tour-nav-profiles' : to === '/monitor' ? 'tour-nav-monitor' : undefined}
      onClick={(e) => disabled && e.preventDefault()}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-smooth',
          disabled && 'cursor-not-allowed opacity-40',
          !disabled && 'cursor-pointer',
          isActive && !disabled
            ? 'bg-primary/12 font-medium text-foreground'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
          collapsed && 'justify-center px-2',
        )
      }
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive && !disabled && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-aurora shadow-glow" />
          )}
          <Icon
            className={cn(
              'h-[1.1rem] w-[1.1rem] shrink-0 transition-colors',
              isActive && !disabled && 'text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]',
            )}
          />
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && disabled && <Lock className="ml-auto h-3 w-3" />}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

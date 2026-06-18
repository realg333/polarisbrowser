import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, Lock, X, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

const CHECKLIST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  comingSoon?: boolean;
  href?: string;
  action?: () => void;
}

export function OnboardingChecklist(): React.ReactElement | null {
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const onboardingCompletedAt = useAppStore((s) => s.onboardingCompletedAt);
  const checklistDismissed = useAppStore((s) => s.checklistDismissed);
  const tourCompleted = useAppStore((s) => s.tourCompleted);
  const dismissChecklist = useAppStore((s) => s.dismissChecklist);
  const resetTour = useAppStore((s) => s.resetTour);
  const navigate = useNavigate();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => window.polaris.profiles.list(),
    enabled: onboardingCompleted && !checklistDismissed,
  });

  if (!onboardingCompleted || checklistDismissed) return null;

  const completedAt = onboardingCompletedAt ? new Date(onboardingCompletedAt).getTime() : Date.now();
  const expired = Date.now() - completedAt > CHECKLIST_TTL_MS;

  const activeProfiles = profiles.filter((p) => p.status !== 'archived');

  const items: ChecklistItem[] = [
    {
      id: 'tour',
      label: 'Completar tour guiado',
      done: tourCompleted,
      action: () => {
        resetTour();
        navigate('/dashboard');
      },
    },
    {
      id: 'first-profile',
      label: 'Criar primeiro perfil',
      done: activeProfiles.length >= 1,
      href: '/profiles?new=true',
    },
    {
      id: 'three-profiles',
      label: 'Criar 3 perfis',
      done: activeProfiles.length >= 3,
      href: '/profiles?new=true',
    },
    {
      id: 'proxy',
      label: 'Configurar um proxy',
      done: false,
      comingSoon: true,
    },
    {
      id: 'invite',
      label: 'Convidar um membro da equipe',
      done: false,
      comingSoon: true,
    },
  ];

  const actionableItems = items.filter((i) => !i.comingSoon);
  const completedCount = items.filter((i) => i.done).length;
  const allActionableDone = actionableItems.every((i) => i.done);
  const progress = Math.round((completedCount / items.length) * 100);

  if (expired && allActionableDone) return null;

  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="pointer-events-none absolute inset-0 bg-aurora-soft opacity-70" />
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aurora text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">Comece aqui</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-aurora transition-all duration-500 ease-smooth" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {completedCount}/{items.length}
            </span>
          </div>
          <TooltipButton tooltip="Dispensar checklist" size="icon" variant="ghost" className="h-7 w-7" onClick={dismissChecklist}>
            <X className="h-3.5 w-3.5" />
          </TooltipButton>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-0.5">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
        {!allActionableDone && (
          <p className="pt-2 text-xs text-muted-foreground">
            Complete os itens acima para dominar o Polaris Browser.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }): React.ReactElement {
  const content = (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
        (item.href || item.action) && !item.done && 'hover:bg-accent/50 cursor-pointer',
        item.comingSoon && 'opacity-60',
      )}
      onClick={item.action && !item.done ? item.action : undefined}
      onKeyDown={
        item.action && !item.done
          ? (e) => {
              if (e.key === 'Enter') item.action?.();
            }
          : undefined
      }
      role={item.action && !item.done ? 'button' : undefined}
      tabIndex={item.action && !item.done ? 0 : undefined}
    >
      {item.done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : item.comingSoon ? (
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className={cn(item.done && 'text-muted-foreground line-through')}>{item.label}</span>
      {item.comingSoon && (
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Em breve
        </span>
      )}
    </div>
  );

  if (item.href && !item.done && !item.comingSoon) {
    return <Link to={item.href}>{content}</Link>;
  }

  return content;
}

import { Play, Copy, Archive, Trash2, FolderOpen, Globe } from 'lucide-react';
import type { ProfileWithMeta } from '@polaris/shared';
import { BROWSER_ENGINE_LABELS, FINGERPRINT_OS_LABELS } from '@polaris/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { TagBadges } from '@/components/profiles/TagFilterBar';
import { formatRelativeTime, cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: ProfileWithMeta;
  onOpen: () => void;
  onLaunch: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ProfileCard({
  profile,
  onOpen,
  onLaunch,
  onDuplicate,
  onArchive,
  onDelete,
}: ProfileCardProps): React.ReactElement {
  const running = profile.status === 'running';
  const archived = profile.status === 'archived';
  const initial = (profile.name.trim()[0] ?? 'P').toUpperCase();

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden p-4 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
      onClick={onOpen}
    >
      <div className="pointer-events-none absolute -right-12 -top-14 h-28 w-28 rounded-full bg-primary/0 blur-2xl transition-colors duration-300 group-hover:bg-primary/10" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/20 to-transparent font-display text-sm font-semibold text-primary">
              {initial}
            </div>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                running ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : archived ? 'bg-muted-foreground/50' : 'bg-muted-foreground/40',
              )}
            />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium leading-tight">{profile.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.startUrl}</span>
            </p>
          </div>
        </div>
        <Badge variant={running ? 'success' : archived ? 'muted' : 'outline'} className="shrink-0">
          {running ? 'Ativo' : archived ? 'Arquivado' : 'Idle'}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-muted-foreground">
          {BROWSER_ENGINE_LABELS[profile.browserEngine]}
        </span>
        <span className="rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-muted-foreground">
          {FINGERPRINT_OS_LABELS[profile.fingerprint.os]}
        </span>
        {profile.folderName && (
          <span className="flex items-center gap-1 rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-muted-foreground">
            <FolderOpen className="h-3 w-3" />
            {profile.folderName}
          </span>
        )}
      </div>

      {profile.tags.length > 0 && (
        <div className="mt-2.5">
          <TagBadges tags={profile.tags} />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
        <span className="text-[11px] text-muted-foreground">{formatRelativeTime(profile.lastUsedAt)}</span>
        <div
          className="flex gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipButton tooltip="Launch" size="icon" variant="ghost" className="h-7 w-7" onClick={onLaunch} disabled={archived}>
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
    </Card>
  );
}

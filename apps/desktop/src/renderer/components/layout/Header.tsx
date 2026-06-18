import { Moon, Sun, Search, Bell } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DownloadCenter } from '@/components/layout/DownloadCenter';
import { cn } from '@/lib/utils';

export function Header(): React.ReactElement {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const userName = useAppStore((s) => s.userName);

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const initial = (userName.trim()[0] ?? 'P').toUpperCase();

  return (
    <header className="z-10 flex h-16 items-center justify-between border-b border-border/60 bg-background/40 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="group flex h-9 items-center gap-2.5 rounded-lg border border-border/70 bg-card/40 pl-3 pr-2.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden min-w-[140px] text-left sm:inline">Buscar perfis...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded-md border border-border bg-muted/70 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                ⌘K
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Busca global — perfis, pastas e configurações</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1.5">
        <DownloadCenter />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-[1.1rem] w-[1.1rem]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-aurora-2 shadow-[0_0_8px_hsl(var(--aurora-2))]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notificações</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              <Sun className={cn('h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0')} />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Alternar entre modo claro e escuro</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-6 w-px bg-border/70" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-aurora text-sm font-semibold text-primary-foreground shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.8)] ring-2 ring-background transition-transform duration-200 hover:scale-105"
            >
              {initial}
            </button>
          </TooltipTrigger>
          <TooltipContent>Conta e perfil do usuário</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

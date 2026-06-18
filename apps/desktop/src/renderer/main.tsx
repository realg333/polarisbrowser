import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppRoutes } from '@/routes';
import { useAppStore } from '@/stores/app-store';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ThemeInitializer({ children }: { children: React.ReactNode }): React.ReactElement {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}

function AppToaster(): React.ReactElement {
  const theme = useAppStore((s) => s.theme);
  return (
    <Toaster
      richColors
      position="bottom-right"
      theme={theme === 'light' ? 'light' : 'dark'}
      toastOptions={{
        classNames: {
          toast: 'glass-strong !rounded-xl !border-border/60',
        },
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ThemeInitializer>
          <HashRouter>
            <AppRoutes />
            <AppToaster />
          </HashRouter>
        </ThemeInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);

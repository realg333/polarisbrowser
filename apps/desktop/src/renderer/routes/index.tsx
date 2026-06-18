import { Navigate, Route, Routes } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/stores/app-store';
import { DashboardPage } from '@/routes/dashboard';
import { ProfilesPage } from '@/routes/profiles';
import { MonitorPage } from '@/routes/monitor';
import { SettingsPage } from '@/routes/settings';
import { OnboardingPage } from '@/routes/onboarding';
import { AuthPage } from '@/routes/auth';

function PlaceholderPage({ title }: { title: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-aurora-soft">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">Este recurso chega na próxima versão.</p>
      <span className="mt-4 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        Em breve · V2
      </span>
    </div>
  );
}

export function AppRoutes(): React.ReactElement {
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  if (!onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profiles" element={<ProfilesPage />} />
        <Route path="proxy" element={<PlaceholderPage title="Proxies" />} />
        <Route path="automation" element={<PlaceholderPage title="Automação" />} />
        <Route path="monitor" element={<MonitorPage />} />
        <Route path="learn" element={<PlaceholderPage title="Central de Aprendizado" />} />
        <Route path="workspace" element={<PlaceholderPage title="Workspace" />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

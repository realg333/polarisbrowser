import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuroraBackground } from './AuroraBackground';
import { AppTour } from '@/components/tour/AppTour';
import { RuntimeSetupBanner } from '@/components/layout/RuntimeSetupBanner';

export function AppShell(): React.ReactElement {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <AuroraBackground />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <RuntimeSetupBanner />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          <div className="mx-auto w-full max-w-[1400px] animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <AppTour />
    </div>
  );
}

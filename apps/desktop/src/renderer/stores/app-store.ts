import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ProfileViewMode = 'table' | 'cards';

interface AppState {
  theme: Theme;
  sidebarCollapsed: boolean;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
  checklistDismissed: boolean;
  tourActive: boolean;
  tourStep: number;
  tourCompleted: boolean;
  workspaceName: string;
  userName: string;
  profileViewMode: ProfileViewMode;
  selectedFolderId: string | null | 'all' | 'none';
  selectedTagId: string | null;
  selectedProfileId: string | null;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  completeOnboarding: () => void;
  dismissChecklist: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  setWorkspace: (workspaceName: string, userName: string) => void;
  setProfileViewMode: (mode: ProfileViewMode) => void;
  setSelectedFolderId: (id: string | null | 'all' | 'none') => void;
  setSelectedTagId: (id: string | null) => void;
  setSelectedProfileId: (id: string | null) => void;
}

export const TOUR_STEP_COUNT = 7;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      checklistDismissed: false,
      tourActive: false,
      tourStep: 0,
      tourCompleted: false,
      workspaceName: '',
      userName: '',
      profileViewMode: 'table',
      selectedFolderId: 'all',
      selectedTagId: null,
      selectedProfileId: null,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      completeOnboarding: () =>
        set({ onboardingCompleted: true, onboardingCompletedAt: new Date().toISOString() }),
      dismissChecklist: () => set({ checklistDismissed: true }),
      startTour: () =>
        set({ tourActive: true, tourStep: 0, tourCompleted: false, sidebarCollapsed: false }),
      nextTourStep: () =>
        set((s) => {
          if (s.tourStep >= TOUR_STEP_COUNT - 1) {
            return { tourActive: false, tourCompleted: true, tourStep: 0 };
          }
          return { tourStep: s.tourStep + 1 };
        }),
      prevTourStep: () => set((s) => ({ tourStep: Math.max(0, s.tourStep - 1) })),
      skipTour: () => set({ tourActive: false, tourCompleted: true, tourStep: 0 }),
      completeTour: () => set({ tourActive: false, tourCompleted: true, tourStep: 0 }),
      resetTour: () => set({ tourActive: true, tourStep: 0, tourCompleted: false, sidebarCollapsed: false }),
      setWorkspace: (workspaceName, userName) => set({ workspaceName, userName }),
      setProfileViewMode: (mode) => set({ profileViewMode: mode }),
      setSelectedFolderId: (id) => set({ selectedFolderId: id }),
      setSelectedTagId: (id) => set({ selectedTagId: id }),
      setSelectedProfileId: (id) => set({ selectedProfileId: id }),
    }),
    { name: 'polaris-app' },
  ),
);

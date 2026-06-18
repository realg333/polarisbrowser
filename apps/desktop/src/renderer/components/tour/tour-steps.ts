export interface TourStepConfig {
  id: string;
  route: string;
  target: string;
  title: string;
  description: string;
  placement?: 'right' | 'bottom' | 'top' | 'left';
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'sidebar',
    route: '/dashboard',
    target: 'tour-sidebar',
    title: 'Navegação principal',
    description:
      'Use a barra lateral para acessar Dashboard, Perfis, Monitor e Configurações. Tudo fica a um clique.',
    placement: 'right',
  },
  {
    id: 'profiles-nav',
    route: '/profiles',
    target: 'tour-nav-profiles',
    title: 'Área de Perfis',
    description:
      'Aqui você gerencia todos os perfis de navegação. Cada perfil tem cookies, cache e sessão totalmente isolados.',
    placement: 'right',
  },
  {
    id: 'new-profile',
    route: '/profiles',
    target: 'tour-new-profile',
    title: 'Criar um perfil',
    description:
      'Clique em "Novo perfil" para criar sua primeira identidade digital. Você pode ter dezenas de perfis independentes.',
    placement: 'bottom',
  },
  {
    id: 'fingerprint',
    route: '/profiles',
    target: 'tour-profiles-area',
    title: 'Fingerprint anti-detect',
    description:
      'Ao abrir os detalhes de um perfil, configure WebRTC, User-Agent, Canvas, WebGL e mais na aba Fingerprint.',
    placement: 'top',
  },
  {
    id: 'launch',
    route: '/profiles',
    target: 'tour-profiles-area',
    title: 'Launch do navegador',
    description:
      'Use o botão Launch para abrir o perfil no SunBrowser, Flower ou Chrome com o fingerprint configurado.',
    placement: 'top',
  },
  {
    id: 'monitor',
    route: '/monitor',
    target: 'tour-monitor',
    title: 'Monitoramento',
    description:
      'Acompanhe CPU, memória e quantos perfis estão ativos em tempo real. Ideal para operações com muitos perfis.',
    placement: 'bottom',
  },
  {
    id: 'finish',
    route: '/dashboard',
    target: 'tour-dashboard-welcome',
    title: 'Tudo pronto!',
    description:
      'Explore o Polaris no seu ritmo. Crie seu primeiro perfil quando quiser — o checklist no dashboard vai te guiar.',
    placement: 'bottom',
  },
];

import { useState } from 'react';

import { ArrowRight, ArrowLeft, Shield, Zap, Globe, Check } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/stores/app-store';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { TooltipButton } from '@/components/shared/TooltipButton';

import { AuroraBackground } from '@/components/layout/AuroraBackground';

import { cn } from '@/lib/utils';



const STEPS = ['Boas-vindas', 'Workspace'];



const VALUE_PROPS = [

  { icon: Shield, title: 'Perfis isolados', desc: 'Cookies e sessões separados por perfil' },

  { icon: Zap, title: 'Launch rápido', desc: 'Abra qualquer perfil em um clique' },

  { icon: Globe, title: 'Multi-navegador', desc: 'SunBrowser, Flower ou Chrome' },

];



export function OnboardingPage(): React.ReactElement {

  const [step, setStep] = useState(0);

  const navigate = useNavigate();

  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const startTour = useAppStore((s) => s.startTour);

  const workspaceName = useAppStore((s) => s.workspaceName);

  const userName = useAppStore((s) => s.userName);

  const setWorkspace = useAppStore((s) => s.setWorkspace);



  const finish = (): void => {

    completeOnboarding();

    startTour();

    navigate('/dashboard');

  };



  return (

    <div className="relative h-screen overflow-y-auto scrollbar-thin">

      <AuroraBackground />



      <div className="flex min-h-full flex-col items-center justify-center p-6">

        <div className="w-full max-w-lg animate-fade-in-up">

          <div className="mb-8 flex items-center justify-center gap-2">

            {STEPS.map((label, i) => (

              <div key={label} className="flex items-center gap-2">

                <div

                  className={cn(

                    'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300',

                    i < step

                      ? 'border-transparent bg-aurora text-primary-foreground'

                      : i === step

                        ? 'border-primary/60 bg-primary/15 text-primary ring-2 ring-primary/30'

                        : 'border-border bg-card/40 text-muted-foreground',

                  )}

                  title={label}

                >

                  {i < step ? <Check className="h-4 w-4" /> : i + 1}

                </div>

                {i < STEPS.length - 1 && (

                  <div className={cn('h-px w-8 transition-colors duration-300', i < step ? 'bg-primary' : 'bg-border')} />

                )}

              </div>

            ))}

          </div>



          <div className="glass-strong rounded-2xl p-8 shadow-glow-lg">

            {step === 0 && (

              <div className="text-center">

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-aurora shadow-glow-lg">

                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary-foreground" fill="currentColor" aria-hidden>

                    <path d="M12 1.5l1.9 6.1a4 4 0 002.5 2.5l6.1 1.9-6.1 1.9a4 4 0 00-2.5 2.5L12 22.5l-1.9-6.1a4 4 0 00-2.5-2.5L1.5 12l6.1-1.9a4 4 0 002.5-2.5L12 1.5z" />

                  </svg>

                </div>

                <h1 className="font-display text-2xl font-bold tracking-tight">

                  Bem-vindo ao <span className="text-gradient">Polaris</span>

                </h1>

                <p className="mt-2 text-muted-foreground">

                  Gerencie múltiplos perfis de navegação de forma profissional e segura.

                </p>

                <div className="mt-6 grid gap-2.5 text-left">

                  {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (

                    <div key={title} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-transparent text-primary">

                        <Icon className="h-5 w-5" />

                      </div>

                      <div>

                        <p className="text-sm font-medium">{title}</p>

                        <p className="text-xs text-muted-foreground">{desc}</p>

                      </div>

                    </div>

                  ))}

                </div>

                <TooltipButton tooltip="Iniciar configuração guiada do Polaris" variant="gradient" size="lg" className="mt-8 w-full" onClick={() => setStep(1)}>

                  Começar

                  <ArrowRight className="h-4 w-4" />

                </TooltipButton>

              </div>

            )}



            {step === 1 && (

              <div>

                <h2 className="font-display text-xl font-semibold">Configure seu workspace</h2>

                <p className="mt-1 text-sm text-muted-foreground">

                  Nome da sua empresa ou equipe. Em seguida, um tour rápido pelo app.

                </p>

                <div className="mt-6 space-y-4">

                  <div>

                    <label className="text-sm font-medium">Nome do workspace</label>

                    <Input

                      className="mt-1.5"

                      value={workspaceName}

                      onChange={(e) => setWorkspace(e.target.value, userName)}

                      placeholder="Agência Digital XYZ"

                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">Seu nome</label>

                    <Input

                      className="mt-1.5"

                      value={userName}

                      onChange={(e) => setWorkspace(workspaceName, e.target.value)}

                      placeholder="Ana Silva"

                    />

                  </div>

                </div>

                <div className="mt-8 flex justify-between">

                  <Button variant="outline" onClick={() => setStep(0)}>

                    <ArrowLeft className="h-4 w-4" /> Voltar

                  </Button>

                  <TooltipButton tooltip="Entrar no Polaris e iniciar tour guiado" variant="gradient" onClick={finish} disabled={!workspaceName.trim()}>

                    Entrar no Polaris

                    <ArrowRight className="h-4 w-4" />

                  </TooltipButton>

                </div>

              </div>

            )}

          </div>



          <p className="mt-6 text-center text-xs text-muted-foreground">

            Passo {step + 1} de {STEPS.length}

          </p>

        </div>

      </div>

    </div>

  );

}


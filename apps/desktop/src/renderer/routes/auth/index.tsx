import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { AuroraBackground } from '@/components/layout/AuroraBackground';

function PolarisMark(): React.ReactElement {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora shadow-glow-lg">
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary-foreground" fill="currentColor" aria-hidden>
        <path d="M12 1.5l1.9 6.1a4 4 0 002.5 2.5l6.1 1.9-6.1 1.9a4 4 0 00-2.5 2.5L12 22.5l-1.9-6.1a4 4 0 00-2.5-2.5L1.5 12l6.1-1.9a4 4 0 002.5-2.5L12 1.5z" />
      </svg>
    </div>
  );
}

export function AuthPage(): React.ReactElement {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { data: authState } = useQuery({
    queryKey: ['auth'],
    queryFn: () => window.polaris.auth.state(),
  });

  const loginMutation = useMutation({
    mutationFn: () => window.polaris.auth.login({ email, password }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Login realizado');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['license'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => window.polaris.auth.register({ email, password, name }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Conta criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['license'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => window.polaris.auth.logout(),
    onSuccess: () => {
      toast.success('Logout realizado');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['license'] });
    },
  });

  if (authState?.isAuthenticated && authState.session) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-y-auto scrollbar-thin p-6">
        <AuroraBackground />
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader>
            <CardTitle>Conta conectada</CardTitle>
            <CardDescription>Sincronização cloud e billing ativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aurora font-display text-sm font-semibold text-primary-foreground">
                {(authState.session.user.name?.[0] ?? authState.session.user.email[0] ?? 'U').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{authState.session.user.name ?? 'Usuário'}</p>
                <p className="truncate text-sm text-muted-foreground">{authState.session.user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipButton tooltip="Encerrar sessão neste dispositivo" variant="outline" onClick={() => logoutMutation.mutate()}>
                Sair
              </TooltipButton>
              <Button asChild variant="ghost">
                <Link to="/settings">Voltar às configurações</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-y-auto scrollbar-thin p-6">
      <AuroraBackground />
      <div className="w-full max-w-md animate-fade-in-up space-y-6">
        <div className="text-center">
          <PolarisMark />
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Entrar no Polaris' : 'Criar conta'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Acesse sync cloud, billing e limites do seu plano'
              : 'Comece com 14 dias de trial Unlimited'}
          </p>
        </div>

        <Card className="shadow-glow-lg">
          <CardContent className="space-y-4 pt-6">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-1.5" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="mt-1.5"
              />
            </div>

            <TooltipButton
              tooltip={mode === 'login' ? 'Entrar com e-mail e senha' : 'Criar nova conta Polaris'}
              variant="gradient"
              className="w-full"
              onClick={() => (mode === 'login' ? loginMutation.mutate() : registerMutation.mutate())}
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </TooltipButton>

            <button
              type="button"
              className="w-full cursor-pointer text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/settings" className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Continuar sem conta (modo offline)
          </Link>
        </p>
      </div>
    </div>
  );
}

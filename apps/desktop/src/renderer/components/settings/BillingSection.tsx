import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { PlanSlug } from '@polaris/shared';
import { PLANS, formatPlanPrice } from '@polaris/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipButton } from '@/components/shared/TooltipButton';

function BillingSection(): React.ReactElement {
  const queryClient = useQueryClient();

  const { data: license } = useQuery({
    queryKey: ['license'],
    queryFn: () => window.polaris.license.info(),
  });

  const { data: authState } = useQuery({
    queryKey: ['auth'],
    queryFn: () => window.polaris.auth.state(),
  });

  const syncMutation = useMutation({
    mutationFn: () => window.polaris.license.sync(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Licença sincronizada');
        queryClient.invalidateQueries({ queryKey: ['license'] });
      } else if (result.error) {
        toast.error(result.error);
      }
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ plan, cycle }: { plan: PlanSlug; cycle: 'monthly' | 'yearly' }) =>
      window.polaris.auth.checkout({ plan, cycle }),
    onSuccess: (result) => {
      if (result.error) toast.error(result.error);
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => window.polaris.auth.portal(),
    onSuccess: (result) => {
      if (result.error) toast.error(result.error);
    },
  });

  const plan = license?.plan ?? 'starter';
  const planDef = PLANS[plan];
  const maxLabel = planDef.maxProfiles < 0 ? 'Ilimitados' : String(planDef.maxProfiles);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plano e billing</CardTitle>
        <CardDescription>
          {authState?.isAuthenticated
            ? `${planDef.name} — até ${maxLabel} perfis ativos`
            : 'Faça login para sincronizar seu plano'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-aurora-soft p-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold">{planDef.name}</p>
                {plan !== 'starter' && (
                  <span className="rounded-full bg-aurora px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    PRO
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{formatPlanPrice(planDef.priceMonthlyCents)}</span>/mês
                {license && (
                  <span className="ml-2">
                    · {license.activeProfiles}/{maxLabel} perfis
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!authState?.isAuthenticated ? (
                <Button asChild variant="gradient" size="sm">
                  <Link to="/auth">Entrar</Link>
                </Button>
              ) : plan === 'starter' ? (
                <TooltipButton
                  tooltip="Assinar Unlimited via Stripe Checkout"
                  variant="gradient"
                  size="sm"
                  onClick={() => checkoutMutation.mutate({ plan: 'unlimited', cycle: 'monthly' })}
                >
                  Upgrade
                </TooltipButton>
              ) : (
                <TooltipButton
                  tooltip="Gerenciar assinatura no portal Stripe"
                  variant="outline"
                  size="sm"
                  onClick={() => portalMutation.mutate()}
                >
                  Gerenciar
                </TooltipButton>
              )}
            </div>
          </div>
        </div>

        {authState?.isAuthenticated && (
          <TooltipButton
            tooltip="Sincronizar licença com a API cloud"
            variant="ghost"
            size="sm"
            onClick={() => syncMutation.mutate()}
          >
            Sincronizar licença
          </TooltipButton>
        )}
      </CardContent>
    </Card>
  );
}

export { BillingSection };

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X, Sparkles } from 'lucide-react';
import { useAppStore, TOUR_STEP_COUNT } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { TooltipButton } from '@/components/shared/TooltipButton';
import { TOUR_STEPS } from '@/components/tour/tour-steps';
import { cn } from '@/lib/utils';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TOOLTIP_GAP = 16;

export function AppTour(): React.ReactElement | null {
  const tourActive = useAppStore((s) => s.tourActive);
  const tourStep = useAppStore((s) => s.tourStep);
  const nextTourStep = useAppStore((s) => s.nextTourStep);
  const prevTourStep = useAppStore((s) => s.prevTourStep);
  const skipTour = useAppStore((s) => s.skipTour);
  const completeTour = useAppStore((s) => s.completeTour);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const modalOpen = searchParams.get('new') === 'true' || searchParams.has('profile');

  const step = TOUR_STEPS[tourStep];
  const isLast = tourStep === TOUR_STEP_COUNT - 1;

  const measureTarget = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    });
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (!tourActive || !step) return;
    if (location.pathname !== step.route) {
      navigate(step.route);
      return;
    }
    const timer = setTimeout(measureTarget, 350);
    return () => clearTimeout(timer);
  }, [tourActive, tourStep, step, location.pathname, navigate, measureTarget]);

  useEffect(() => {
    if (!tourActive) return;
    const onResize = (): void => measureTarget();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [tourActive, measureTarget]);

  if (!tourActive || !step || modalOpen) return null;

  const handleNext = (): void => {
    if (isLast) completeTour();
    else nextTourStep();
  };

  const tooltipStyle = getTooltipStyle(targetRect, step.placement ?? 'bottom');

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Tour guiado do Polaris">
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-spotlight-mask)"
          className="pointer-events-auto"
          onClick={skipTour}
        />
      </svg>

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-primary shadow-glow-lg transition-all duration-300 ease-smooth"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute z-[101] w-[min(360px,calc(100vw-2rem))] animate-fade-in-up"
        style={tooltipStyle}
      >
        <div className="glass-strong rounded-2xl border border-primary/25 p-5 shadow-glow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aurora text-primary-foreground shadow-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <TooltipButton
              tooltip="Pular tutorial"
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={skipTour}
            >
              <X className="h-3.5 w-3.5" />
            </TooltipButton>
          </div>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Tutorial · {tourStep + 1} de {TOUR_STEP_COUNT}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

          <div className="mt-4 flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === tourStep ? 'w-6 bg-primary' : i < tourStep ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-muted-foreground/30',
                )}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              type="button"
              className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={skipTour}
            >
              Pular tutorial
            </button>
            <div className="flex gap-2">
              {tourStep > 0 && (
                <Button variant="outline" size="sm" onClick={prevTourStep}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </Button>
              )}
              <TooltipButton
                tooltip={isLast ? 'Concluir tutorial' : 'Próximo passo'}
                variant="gradient"
                size="sm"
                onClick={handleNext}
              >
                {isLast ? 'Concluir' : 'Próximo'}
                {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
              </TooltipButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTooltipStyle(
  rect: Rect | null,
  placement: 'right' | 'bottom' | 'top' | 'left',
): React.CSSProperties {
  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  switch (placement) {
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width + TOOLTIP_GAP,
        transform: 'translateY(-50%)',
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        right: window.innerWidth - rect.left + TOOLTIP_GAP,
        transform: 'translateY(-50%)',
      };
    case 'top':
      return {
        bottom: window.innerHeight - rect.top + TOOLTIP_GAP,
        left: Math.min(rect.left, window.innerWidth - 380),
      };
    case 'bottom':
    default:
      return {
        top: rect.top + rect.height + TOOLTIP_GAP,
        left: Math.min(Math.max(16, rect.left), window.innerWidth - 376),
      };
  }
}

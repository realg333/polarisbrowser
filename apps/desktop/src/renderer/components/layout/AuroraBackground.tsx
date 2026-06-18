import { cn } from '@/lib/utils';

/**
 * Ambient aurora backdrop — animated polar-light blobs over a faint grid.
 * Purely decorative; sits behind all content.
 */
export function AuroraBackground({ className }: { className?: string }): React.ReactElement {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background', className)}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* aurora ribbons */}
      <div className="absolute -left-[10%] -top-[20%] h-[55vh] w-[55vh] rounded-full bg-aurora-1/25 blur-[120px] animate-aurora" />
      <div
        className="absolute right-[-8%] top-[6%] h-[48vh] w-[48vh] rounded-full bg-aurora-2/20 blur-[130px] animate-aurora"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute bottom-[-18%] left-[28%] h-[50vh] w-[60vh] rounded-full bg-aurora-3/18 blur-[140px] animate-aurora"
        style={{ animationDelay: '-13s' }}
      />

      {/* polar star glow at top */}
      <div className="absolute left-1/2 top-[-30%] h-[60vh] w-[90vw] -translate-x-1/2 rounded-full bg-polar/10 blur-[120px]" />

      {/* vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.85)_100%)]" />
    </div>
  );
}

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/25 bg-primary/12 text-primary',
        success: 'border-success/30 bg-success/12 text-success',
        warning: 'border-warning/30 bg-warning/15 text-warning',
        muted: 'border-border bg-muted/60 text-muted-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        gradient: 'border-transparent bg-aurora text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): React.ReactElement {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

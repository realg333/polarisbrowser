import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TooltipButtonProps extends ButtonProps {
  tooltip: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export function TooltipButton({
  tooltip,
  tooltipSide = 'top',
  children,
  ...props
}: TooltipButtonProps): React.ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

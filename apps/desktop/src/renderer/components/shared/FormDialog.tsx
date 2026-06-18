import { type ReactNode } from 'react';
import { TooltipButton } from '@/components/shared/TooltipButton';

interface FormDialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  isPending?: boolean;
}

export function FormDialog({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Salvar',
  submitDisabled,
  isPending,
}: FormDialogProps): React.ReactElement | null {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-background/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-md animate-scale-in rounded-2xl p-6 shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-4 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <TooltipButton tooltip="Cancelar" variant="outline" onClick={onClose}>
            Cancelar
          </TooltipButton>
          <TooltipButton
            tooltip={submitLabel}
            onClick={onSubmit}
            disabled={submitDisabled || isPending}
          >
            {isPending ? 'Salvando...' : submitLabel}
          </TooltipButton>
        </div>
      </div>
    </div>
  );
}

import { ComponentProps } from 'react';
import { twx } from '~/utils/twx';

type Variant = 'blue' | 'green' | 'orange' | 'zinc' | 'slate' | 'esc';

const variantClasses: Record<Variant, string> = {
  blue: 'bg-blue-500/20 border border-blue-500/30 text-blue-400',
  esc: 'bg-blue-500/20 border border-blue-500/30 text-blue-300',
  green: 'bg-green-500/20 border border-green-500/30 text-green-400',
  orange: 'bg-orange-500/20 border border-orange-500/30 text-orange-400',
  zinc: 'bg-zinc-700 text-white',
  slate: 'bg-slate-600/40 border border-white/15 text-white/80',
};

const ChipBase = twx.div`box-border flex h-6 min-w-6 shrink-0 items-center justify-center gap-1 rounded px-1.5 text-xs font-semibold uppercase`;

interface ChipProps extends Omit<ComponentProps<'div'>, 'color'> {
  variant?: Variant;
}

export function Chip({ variant = 'slate', className, ...props }: ChipProps) {
  return <ChipBase className={`${variantClasses[variant]}${className ? ` ${className}` : ''}`} {...props} />;
}

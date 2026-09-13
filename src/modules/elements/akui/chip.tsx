import { ComponentProps } from 'react';

import { StatusRole, statusSurface } from '~/modules/elements/akui/surfaces';
import { cn } from '~/utils/cn';
import { twx } from '~/utils/twx';

/**
 * Two axes, deliberately kept apart.
 *
 * The category variants label what a thing *is* — a new song, a preview feature, a Eurovision
 * entry. They are picked for being distinguishable from each other, and `green` here means "new",
 * not "good".
 *
 * The status variants say how something is *going*, and take the four shared roles so a chip
 * reporting a failure matches every other way the app reports one.
 */
type CategoryVariant = 'blue' | 'green' | 'orange' | 'zinc' | 'slate' | 'esc';
type Variant = CategoryVariant | StatusRole;

const categoryClasses: Record<CategoryVariant, string> = {
  blue: 'bg-blue-500/20 border border-blue-500/30 text-blue-400',
  esc: 'bg-blue-500/20 border border-blue-500/30 text-blue-300',
  green: 'bg-green-500/20 border border-green-500/30 text-green-400',
  orange: 'bg-orange-500/20 border border-orange-500/30 text-orange-400',
  zinc: 'bg-zinc-700 text-default',
  slate: 'bg-slate-600/40 border border-white/10 text-default/80',
};

// A status chip is small and its label is the whole message, so unlike a warning panel it does want
// the text in the status colour as well as the surface.
const statusClasses: Record<StatusRole, string> = {
  danger: `${statusSurface.danger} text-danger`,
  warning: `${statusSurface.warning} text-warning`,
  success: `${statusSurface.success} text-success`,
  info: `${statusSurface.info} text-info`,
};

const variantClasses: Record<Variant, string> = { ...categoryClasses, ...statusClasses };

const ChipBase = twx.div`box-border inline-flex h-6 min-w-6 shrink-0 items-center justify-center gap-1 rounded px-1.5 text-xs font-semibold uppercase`;

interface ChipProps extends Omit<ComponentProps<'div'>, 'color'> {
  variant?: Variant;
}

export function Chip({ variant = 'slate', className, ...props }: ChipProps) {
  return <ChipBase className={cn(variantClasses[variant], className)} {...props} />;
}

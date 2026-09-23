import { ReactNode } from 'react';

import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import { regularBackgroundGradient } from '~/modules/elements/layout-with-background';
import { cn } from '~/utils/cn';

/** Descriptions are written as plain strings, so `backticked` names are rendered as code. */
function renderDescription(description: ReactNode) {
  if (typeof description !== 'string') return description;

  return description.split('`').map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));
}

/**
 * The page a component story is laid out on: the app's own blue, so a component is judged against
 * the ground it actually sits on. Still rather than animated, so screenshots stay deterministic.
 */
export function StoryPage({
  title,
  description,
  wide = false,
  children,
}: {
  title: string;
  description?: ReactNode;
  /** For pages whose rows carry a label column next to the sample (the Foundations pages). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="typography min-h-screen p-8 max-sm:p-4" style={{ backgroundImage: regularBackgroundGradient }}>
      <div className={cn('mx-auto flex w-full flex-col gap-8', wide ? 'max-w-5xl' : 'max-w-3xl')}>
        <header className="flex flex-col gap-2">
          <Typography as="h1" className="text-active text-shadow-legible text-3xl font-bold uppercase">
            {title}
          </Typography>
          {description && <Typography className="text-sm opacity-80">{renderDescription(description)}</Typography>}
        </header>
        {children}
      </div>
    </div>
  );
}

/**
 * One group of samples on a `StoryPage`, drawn on the same `Box` a menu is. `row` lays the samples
 * out side by side and wraps them — for small things (chips, keys) that would be lost in a column.
 */
export function StorySection({
  title,
  description,
  layout = 'column',
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  layout?: 'column' | 'row';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Box as="section" className="items-stretch justify-start gap-4 p-5">
      <div className="flex flex-col gap-1">
        <Typography as="h2" className="text-lg font-bold">
          {title}
        </Typography>
        {description && <Typography className="text-sm opacity-70">{renderDescription(description)}</Typography>}
      </div>
      <div
        className={cn(
          'flex gap-3',
          layout === 'row' ? 'flex-row flex-wrap items-center' : 'flex-col items-stretch',
          className,
        )}>
        {children}
      </div>
    </Box>
  );
}

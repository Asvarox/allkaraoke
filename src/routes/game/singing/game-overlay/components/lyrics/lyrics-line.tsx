import { motion } from 'motion/react';
import { ComponentProps } from 'react';

import { cn } from '~/utils/cn';

type LyricsLineProps = ComponentProps<typeof motion.div> & { nextLine?: boolean; effectsEnabled: boolean };

export default function LyricsLine({ nextLine, effectsEnabled, style, ...rest }: LyricsLineProps) {
  return (
    <motion.div
      {...rest}
      className={cn(
        !effectsEnabled
          ? `text-[min(5vw,1.25rem)]`
          : nextLine
            ? 'max-lg:text-md text-lg'
            : 'h-14 text-3xl max-lg:h-10 max-lg:text-xl',
        nextLine ? 'text-inactive' : 'text-default',
        'typography stroke-text',
      )}
      style={{
        ...style,
      }}
    />
  );
}

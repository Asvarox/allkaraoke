import { motion } from 'motion/react';
import { ComponentProps } from 'react';
import { cn } from 'utils/cn';

type LyricsLineProps = ComponentProps<typeof motion.div> & { nextLine?: boolean; effectsEnabled: boolean };

export default function LyricsLine({ nextLine, effectsEnabled, style, ...rest }: LyricsLineProps) {
  return (
    <motion.div
      {...rest}
      className={cn(
        'typography',
        !effectsEnabled
          ? `text-[min(5vw,1.25rem)]`
          : nextLine
            ? 'mobile:text-md text-lg'
            : 'mobile:text-xl mobile:h-10 h-14 text-3xl',
        nextLine ? 'text-inactive' : 'text-default',
      )}
      style={{
        ...style,
        fontFamily:
          "'Comic Sans MS', Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
      }}
    />
  );
}

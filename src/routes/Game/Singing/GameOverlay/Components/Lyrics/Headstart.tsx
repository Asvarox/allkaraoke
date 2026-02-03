import { ComponentProps, useMemo } from 'react';
import tinycolor from 'tinycolor2';

function BaseHeadstart(props: ComponentProps<'span'>) {
  return <span {...props} className={`absolute right-24 my-2 h-8 w-40 ${props.className ?? ''}`} />;
}

export default function Headstart({ percent, color }: { percent: number; color: string }) {
  const rgbColor = useMemo(() => {
    const rgb = tinycolor(color).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [color]);

  const scaled = Math.min(1, 2 - percent);
  const dynamicRight = Math.max(0, 1 - percent) * 15;

  return (
    <BaseHeadstart
      style={{
        transformOrigin: 'right',
        transform: `scaleX(${scaled})`,
        right: `${dynamicRight}rem`,
        background: `linear-gradient(270deg, rgba(${rgbColor}, 1) 0%, rgba(${rgbColor}, 0.5) 25%, rgba(${rgbColor}, 0) 100%)`,
      }}
    />
  );
}

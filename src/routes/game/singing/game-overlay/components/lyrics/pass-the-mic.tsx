import { Icon } from '~/modules/elements/akui/icon';
import styles from '~/modules/game-engine/drawing/styles';

export function PassTheMicProgress(props: { progress: number; color: string }) {
  return (
    <div
      className="absolute top-0 left-0 h-2 w-full origin-left"
      data-test="pass-the-mic-progress"
      style={{
        background: props.color,
        transform: `scaleX(${props.progress / 100})`,
      }}
    />
  );
}

export function PassTheMicSymbol({ shouldShake = false }: { shouldShake?: boolean }) {
  return (
    <Icon
      icon="ic:baseline-swap-horiz"
      className={shouldShake ? 'animate-lyrics-shake ml-5 text-[1em]!' : 'ml-5 text-[1em]!'}
      style={{
        color: shouldShake ? styles.colors.text.active : undefined,
      }}
    />
  );
}

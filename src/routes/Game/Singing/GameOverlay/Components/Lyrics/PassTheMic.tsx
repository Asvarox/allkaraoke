import { SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import styles from '~/modules/GameEngine/Drawing/styles';

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
    <SwapHorizIcon
      className={shouldShake ? 'animate-lyrics-shake ml-5 text-[1em]!' : 'ml-5 text-[1em]!'}
      style={{
        color: shouldShake ? styles.colors.text.active : undefined,
      }}
    />
  );
}

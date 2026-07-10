import { ComponentProps, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import styles from '~/modules/game-engine/drawing/styles';
import { OnlineParticipant, PlayerStats } from '~/modules/online/protocol/types';

interface Props extends ComponentProps<'div'> {
  participant: OnlineParticipant;
  stats?: PlayerStats;
}

/** One row of a singer list: color dot + name + live mic volume as the row background
 * + ping, with extra tags/buttons passed as children. */
function ParticipantStatsRow({ participant, stats, children, ...rest }: Props) {
  const colorRgb = useMemo(() => {
    const rgb = tinycolor(styles.colors.players[participant.playerNumber].text).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [participant.playerNumber]);

  const volumeScale = Math.min(1, (stats?.volume ?? 0) * 20);

  return (
    <div
      className="typography relative flex items-center gap-2 overflow-hidden rounded-md px-1 py-0.5 text-base"
      data-ready={participant.ready}
      data-connected={participant.connected}
      {...rest}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full origin-left transition-transform duration-150"
        style={{
          transform: `scaleX(${volumeScale})`,
          background: `linear-gradient(90deg, rgba(${colorRgb}, 0.5) 0%, rgba(${colorRgb}, 0) 100%)`,
        }}
        data-test="participant-volume"
      />
      <span
        className="relative inline-block h-4 w-4 shrink-0 rounded-full"
        style={{ background: styles.colors.players[participant.playerNumber].text }}
      />
      <span className={`relative ${participant.connected ? '' : 'line-through opacity-50'}`}>{participant.name}</span>
      {children}
      {stats && (
        <span
          className="relative ml-auto text-xs [font-variant-numeric:tabular-nums] opacity-60"
          data-test="participant-ping">
          {stats.ping} ms
        </span>
      )}
    </div>
  );
}

export default ParticipantStatsRow;

import dayjs from 'dayjs';
import { twc } from 'react-twc';
import { GAME_MODE } from '~/interfaces';
import isE2E from '~/modules/utils/isE2E';
import { cn } from '~/utils/cn';
import { PlayHistoryEntry } from './usePlayHistory';

const GAME_MODE_LABELS: Record<string, string> = {
  [GAME_MODE.DUEL]: 'Duel',
  [GAME_MODE.CO_OP]: 'Co-op',
  [GAME_MODE.PASS_THE_MIC]: 'Pass the Mic',
};

interface Props {
  entry: PlayHistoryEntry;
  isExpanded: boolean;
  // Props from useKeyboardNav register() spread
  focused?: boolean;
  onClick?: () => void;
  'data-test'?: string;
  // Destructured separately to prevent double-spreading onto Card
  'data-focused'?: boolean;
}

export function PlayEntryCard({ entry, isExpanded, focused, onClick, 'data-focused': _dataFocused, ...rest }: Props) {
  const songTitle = entry.song ? entry.song.title : 'Deleted song';
  const songArtist = entry.song ? entry.song.artist : '';
  const time = dayjs(entry.date).format('h:mm A');

  return (
    <Card
      data-focused={focused}
      // Mirrors the focus state logic used in ButtonBase (src/modules/Elements/AKUI/Button.tsx)
      className={cn(!isE2E() && focused && 'bg-active scale-[1.025]')}
      onClick={onClick}
      {...rest}>
      <CollapsedRow>
        <SongInfo>
          <Title>{songTitle}</Title>
          {songArtist && <Artist>{songArtist}</Artist>}
        </SongInfo>
        <Time>{time}</Time>
      </CollapsedRow>

      {isExpanded && (
        <Details data-test="history-entry-details">
          <DetailRow>
            <span>Mode</span>
            <span>{GAME_MODE_LABELS[entry.mode] ?? entry.mode}</span>
          </DetailRow>
          {entry.progress !== undefined && (
            <DetailRow>
              <span>Completion</span>
              <span>{Math.round(entry.progress * 100)}%</span>
            </DetailRow>
          )}
          {entry.scores.map((score) => (
            <DetailRow key={score.name}>
              <span>{score.name}</span>
              <span>{score.score.toLocaleString()}</span>
            </DetailRow>
          ))}
        </Details>
      )}
    </Card>
  );
}

const Card = twc.div`cursor-pointer rounded-lg px-6 py-4 transition-transform`;
const CollapsedRow = twc.div`flex items-center justify-between gap-4`;
const SongInfo = twc.div`flex flex-col`;
const Title = twc.span`typography font-bold`;
const Artist = twc.span`typography text-sm opacity-70`;
const Time = twc.span`typography shrink-0 text-sm opacity-70`;
const Details = twc.div`mt-3 flex flex-col gap-1 border-t border-white/20 pt-3`;
const DetailRow = twc.div`typography flex justify-between text-sm`;

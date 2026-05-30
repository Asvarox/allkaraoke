import dayjs from 'dayjs';
import { twc } from 'react-twc';
import { GAME_MODE } from '~/interfaces';
import { Button } from '~/modules/elements/akui/button';
import { Menu } from '~/modules/elements/akui/menu';
import Typography from '~/modules/elements/akui/primitives/typography';
import { PlayHistoryEntry } from './use-play-history';

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
  // Destructured to prevent double-spreading; Button handles focus styling via the focused prop
  'data-focused'?: boolean;
}

export function PlayEntryCard({ entry, isExpanded, focused, onClick, 'data-focused': _dataFocused, ...rest }: Props) {
  const isDeleted = !entry.song;
  const songTitle = entry.song?.title ?? '[Deleted song]';
  const songArtist = entry.song?.artist ?? '';
  const time = dayjs(entry.date).format('h:mm A');
  const thumbnailUrl = entry.song?.video ? `https://i3.ytimg.com/vi/${entry.song.video}/hqdefault.jpg` : null;

  return (
    <Button
      className="h-auto flex-col! items-stretch gap-0 p-0 text-left normal-case"
      focused={focused}
      subtleFocused={focused}
      onClick={onClick}
      {...rest}>
      {/* Top row: text content on the left, thumbnail on the right */}
      <div className="flex items-start">
        <div className="flex flex-1 flex-col gap-1 px-4 py-3">
          <Typography className="text-active text-md">{songTitle}</Typography>
          <div className="flex items-center justify-between gap-2">
            {isDeleted && <Typography className="block text-sm opacity-50">{entry.songKey}</Typography>}
            {songArtist && <Typography className="block text-sm text-slate-300">{songArtist}</Typography>}
            <Typography className="shrink-0 text-sm opacity-70">{time}</Typography>
          </div>
        </div>
        {thumbnailUrl ? (
          // self-start: stays at aspect-video height, does not grow when the card expands
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="mt-1 mr-1 aspect-video w-32 shrink-0 self-start rounded-r-[4px] object-cover"
          />
        ) : (
          // Placeholder when song has been deleted or has no video
          <div className="mt-1 mr-1 aspect-video w-32 shrink-0 self-start rounded-r-[4px] bg-white/10" />
        )}
      </div>
      {/* Expandable section — sibling to the top row so the divider spans the full button width */}
      {/* Grid trick: animates height from 0→auto by transitioning grid-template-rows */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}>
        <div className="min-h-0 overflow-hidden">
          <Menu.Divider className="my-2" />
          <div className="grid grid-cols-2 divide-x divide-white/20 px-4 pb-2" data-test="history-entry-details">
            <div className="flex flex-col gap-1 pr-3">
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
            </div>
            {/* Right column: player scores */}
            <div className="flex flex-col gap-1 pl-3">
              {entry.scores.map((score) => (
                <DetailRow key={score.name}>
                  <span>{score.name}</span>
                  <span>{score.score.toLocaleString()}</span>
                </DetailRow>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Button>
  );
}

// Used multiple times (mode + completion + one per player score) → TWC
const DetailRow = twc(Typography)`flex justify-between text-sm`;

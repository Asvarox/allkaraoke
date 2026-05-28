import { FiberNewOutlined, PeopleAlt as PeopleAltIcon, Star } from '@mui/icons-material';
import dayjs from 'dayjs';
import { ReactNode, useMemo } from 'react';
import { SongPreview } from '~/interfaces';
import { Chip } from '~/modules/Elements/AKUI/Chip';
import { useSongStats } from '~/modules/Songs/stats/hooks';
import isSongRecentlyUpdated from '~/modules/Songs/utils/isSongRecentlyUpdated';
import { getEurovisionYear, isEurovisionSong } from '~/modules/Songs/utils/specialSongsThemeChecks';
import eurovisionIcon from '~/routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import SongFlag from '~/routes/SingASong/SongSelection/Components/SongCard/SongFlag';

// Base indicator pill shared by all badge variants
const indicatorBase =
  'h-8 min-w-8 box-border text-white text-base flex items-center justify-center uppercase bg-black/75 rounded-lg';
export const indicatorCompact =
  'h-6 min-w-6 box-border text-xs flex items-center justify-center uppercase rounded px-1.5 shrink-0 font-semibold';

export const TopContainer = (props: {
  song: SongPreview;
  isPopular: boolean;
  video?: ReactNode;
  forceFlag?: boolean;
}) => {
  return (
    <div className="absolute top-2 left-0 z-10 box-border flex w-full items-center justify-end gap-2 px-2">
      {props.song.tracksCount > 1 && (
        <div data-test="multitrack-indicator" className={`${indicatorBase} mr-auto px-2 [&_svg]:h-6 [&_svg]:w-6`}>
          <PeopleAltIcon />
          &nbsp; Duet
        </div>
      )}
      <SongCardStatsIndicator song={props.song} isPopular={props.isPopular} focused={!!props.video} />
      <SongFlag
        song={props.song}
        forceFlag={props.forceFlag}
        className="h-8 w-auto rounded-lg object-cover opacity-95"
      />
    </div>
  );
};

export const SongCardStatsIndicator = ({
  song,
  isPopular,
  focused,
  compact = false,
}: {
  song: SongPreview;
  isPopular: boolean;
  focused: boolean;
  compact?: boolean;
}) => {
  const base = compact ? indicatorCompact : indicatorBase;
  const isRecentlyUpdated = useMemo(() => isSongRecentlyUpdated(song), [song]);
  const isESCSong = isEurovisionSong(song);

  const stats = useSongStats(song);
  const lastPlayed = stats?.scores?.at(-1)?.date ?? false;
  const playedToday = lastPlayed && dayjs(lastPlayed).isAfter(dayjs().subtract(1, 'days'));

  return stats?.plays ? (
    compact ? (
      <Chip variant="blue" data-test="song-stat-indicator">
        {playedToday ? (
          'Played today'
        ) : focused ? (
          <>
            Played {stats.plays} time{stats.plays > 1 && 's'}
          </>
        ) : (
          stats.plays
        )}
      </Chip>
    ) : (
      <div data-test="song-stat-indicator" className={`${base} px-2`}>
        {playedToday ? (
          'Played today'
        ) : focused ? (
          <>
            Played {stats.plays} time{stats.plays > 1 && 's'}
          </>
        ) : (
          stats.plays
        )}
      </div>
    )
  ) : isESCSong ? (
    compact ? (
      <Chip variant="esc">
        <img src={eurovisionIcon} alt={song.edition} className="h-3.5 w-3.5 shrink-0" />
        <span>{focused ? `Eurovision ${getEurovisionYear(song)}` : getEurovisionYear(song)}</span>
      </Chip>
    ) : (
      <div className={`${base} overflow-hidden [&_img]:h-7 [&_img]:w-7 [&_svg]:fill-white`}>
        <span className="mt-0.5 px-2 leading-none [&+img]:-ml-1">
          {focused ? `Eurovision ${getEurovisionYear(song)}` : getEurovisionYear(song)}
        </span>
        <img src={eurovisionIcon} alt={song.edition} className="mr-0.5 -ml-1.5 box-border p-1.5" />
      </div>
    )
  ) : isRecentlyUpdated ? (
    compact ? (
      <Chip variant="green" data-test="new-chip">
        New
      </Chip>
    ) : (
      <div className={`${base} overflow-hidden [&_svg]:h-7 [&_svg]:w-7 [&_svg]:fill-white`}>
        {focused ? <span className="mt-0.5 px-2 leading-none">Added recently</span> : <FiberNewOutlined />}
      </div>
    )
  ) : isPopular && song.language.includes('English') ? (
    compact ? (
      <Chip variant="orange" data-test="popular-chip">
        Popular
      </Chip>
    ) : (
      <div className={`${base} overflow-hidden [&_svg]:h-7 [&_svg]:w-7 [&_svg]:fill-[rgb(255,165,0)]`}>
        {focused && <span className="mt-0.5 px-2 leading-none">Popular</span>}
        <Star />
      </div>
    )
  ) : null;
};

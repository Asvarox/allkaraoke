import { Skeleton } from '~/modules/elements/akui/skeleton';
import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';

interface Props {
  // When omitted, renders a skeleton/placeholder version for loading state
  group?: Pick<SongGroup, 'name' | 'displayLong'>;
}

export const SongGroupHeader = ({ group }: Props) => {
  const isNew = group?.name === 'New';
  return (
    <div className="flex h-(--song-group-header-height) items-end" {...(group ? { 'data-highlight': isNew } : {})}>
      <div
        {...(group ? { 'data-group-name': group.name } : {})}
        className="z-1 flex items-center gap-3 rounded-2xl px-3 py-2 text-2xl font-(--font-family) font-bold"
        style={
          group
            ? isNew
              ? {
                  background: '#ffffff',
                  color: '#000',
                }
              : {
                  background: 'rgba(2,6,23,0.5)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }
            : {
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
              }
        }>
        {group ? (group.displayLong ?? group.name) : <Skeleton className="h-8 w-24 bg-white/15" />}
      </div>
    </div>
  );
};

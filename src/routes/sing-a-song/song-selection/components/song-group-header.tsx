import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';

interface Props {
  // When omitted, renders a skeleton/placeholder version for loading state
  group?: Pick<SongGroup, 'name' | 'displayLong'>;
}

export const SongGroupHeader = ({ group }: Props) => {
  const isNew = group?.name === 'New';
  return (
    <div className="flex h-(--song-group-header-height) items-end" {...(group ? { 'data-highlight': isNew } : {})}>
      {isNew && (
        <style>{`@keyframes new-song-group-header { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
      )}
      <div
        {...(group ? { 'data-group-name': group.name } : {})}
        className="z-1 flex items-center gap-3 rounded-md px-3 py-2 text-2xl font-(--font-family)"
        style={
          group
            ? {
                background: isNew ? '#ffffff' : 'rgba(2,6,23,0.5)',
                color: isNew ? '#000' : '#fff',
                border: isNew ? undefined : '1px solid rgba(255,255,255,0.1)',
                animation: isNew ? 'new-song-group-header 600ms ease-in-out infinite both' : undefined,
              }
            : {
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
              }
        }>
        {group ? (group.displayLong ?? group.name) : '\u00A0\u00A0\u00A0'}
      </div>
    </div>
  );
};

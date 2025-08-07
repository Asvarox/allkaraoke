import { chunk } from 'es-toolkit';
import isE2E from 'modules/utils/isE2E';
import {
  ComponentType,
  CSSProperties,
  ForwardedRef,
  Fragment,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Components,
  CustomVirtualization,
  CustomVirtualizedListMethods,
} from 'routes/SingASong/SongSelection/Components/CustomVirtualization';
import { SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';
import { getSongIdWithNew } from 'routes/SingASong/SongSelection/utils/getSongIdWithNew';

export interface VirtualizedListMethods {
  getSongPosition: (songId: string) => { y: number } | undefined;
  scrollToSongInGroup: (songId: string, behavior?: ScrollToOptions['behavior']) => Promise<void>;
  scrollToGroup: (group: string) => void;
}

interface Props<T> {
  components: Components<T>;
  context: T;
  groups: SongGroup[];
  placeholder?: ReactNode;
  renderGroup: (group: SongGroup) => ReactNode;
  renderItem: (item: SongGroup['songs'][number], group: SongGroup, props?: { style: CSSProperties }) => ReactNode;
  ListRowWrapper: ComponentType<PropsWithChildren<{ group?: SongGroup }>>;
  GroupRowWrapper: ComponentType<PropsWithChildren<{ group?: SongGroup; style?: CSSProperties }>>;
  perRow: number;
  itemHeight: number;
  groupHeight: number;
  focusedSong: string;
  Footer: ReactNode;
  ref?: ForwardedRef<VirtualizedListMethods>;
}

export function VirtualizedList<T>(props: Props<T>) {
  const virtuoso = useRef<CustomVirtualizedListMethods>(null);

  const groupedRows = useMemo(() => {
    return props.groups.map((group) => {
      return {
        group,
        rows: chunk(group.songs, props.perRow),
      };
    });
  }, [props.groups, props.perRow]);

  const groupSizes = useMemo(() => groupedRows.map(({ rows }) => rows.length), [groupedRows]);
  const flatRows = useMemo(() => groupedRows.flatMap(({ rows }) => rows), [groupedRows]);

  const { ListRowWrapper, GroupRowWrapper } = props;

  const getGroupIndex = useCallback(
    (songId: string) => props.groups.findIndex((g) => g.songs.some((s) => getSongIdWithNew(s, g) === songId)),
    [props.groups],
  );

  const getSongRow = useCallback(
    (songId: string) => {
      const groupIndex = getGroupIndex(songId);
      if (groupIndex === -1) {
        return;
      }

      const songIndex = props.groups[groupIndex].songs.findIndex(
        (s) => getSongIdWithNew(s, props.groups[groupIndex]) === songId,
      );

      return groupedRows
        .slice(0, groupIndex)
        .reduce((acc, { rows }) => acc + rows.length, Math.floor(songIndex / props.perRow));
    },
    [getGroupIndex, groupedRows, props.groups, props.perRow],
  );

  useImperativeHandle(props.ref, () => {
    return {
      getSongPosition: (songId) => {
        const groupIndex = getGroupIndex(songId);
        if (groupIndex === -1) {
          return;
        }

        const songIndex = props.groups[groupIndex].songs.findIndex(
          (s) => getSongIdWithNew(s, props.groups[groupIndex]) === songId,
        );

        const rowsToScroll = groupedRows
          .slice(0, groupIndex)
          .reduce((acc, { rows }) => acc + rows.length, Math.floor(songIndex / props.perRow));

        const y = virtuoso.current?.getItemPositionY(rowsToScroll) ?? -1;

        return { y };
      },
      scrollToGroup: (group: string) => {
        const groupIndex = props.groups.findIndex((g) => g.name === group);

        if (groupIndex === -1) {
          return;
        }
        virtuoso.current?.scrollToGroup(groupIndex, 'smooth');
      },
      scrollToSongInGroup: async (songId, behavior = 'smooth') => {
        const songRowIndex = getSongRow(songId);
        if (songRowIndex !== undefined) {
          virtuoso.current?.scrollToIndex(songRowIndex, isE2E() ? 'instant' : behavior);
        }
      },
    };
  });

  return (
    <>
      <CustomVirtualization
        Footer={props.Footer}
        forceRenderItem={getSongRow(props.focusedSong) ?? -1}
        overScan={props.itemHeight * 2}
        itemHeight={props.itemHeight}
        groupHeaderHeight={props.groupHeight}
        components={props.components}
        context={props.context}
        groupContent={(index, groupProps) => (
          <GroupRowWrapper group={groupedRows[index].group} {...groupProps}>
            {props.renderGroup(groupedRows[index].group)}
          </GroupRowWrapper>
        )}
        ref={virtuoso}
        groupSizes={groupSizes}
        itemContent={(index, groupIndex, itemProps) => (
          <ListRowWrapper data-is-new={groupedRows[groupIndex].group.isNew} {...itemProps}>
            {flatRows[index].map((song) => props.renderItem(song, groupedRows[groupIndex].group))}
            {props.placeholder &&
              flatRows[index].length < props.perRow &&
              new Array(props.perRow - flatRows[index].length)
                .fill(null)
                .map((_, i) => <Fragment key={i}>{props.placeholder}</Fragment>)}
          </ListRowWrapper>
        )}
      />
    </>
  );
}

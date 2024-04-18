import { chunk } from 'lodash-es';
import {
  ComponentType,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  Fragment,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Components, LocationOptions } from 'react-virtuoso';
import {
  CustomVirtualization,
  CustomVirtualizedListMethods,
} from 'Scenes/SingASong/SongSelectionVirtualized/Components/CustomVirtualization';
import { SongGroup } from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/useSongList';
import isE2E from 'utils/isE2E';

export interface VirtualizedListMethods {
  getSongPosition: (group: string, index: number) => { x: number; y: number } | undefined;
  scrollToSongInGroup: (group: string, songId: number, behavior?: LocationOptions['behavior']) => Promise<void>;
  scrollToGroup: (group: string) => void;
}

interface Props<T> {
  components: Components<SongGroup, T>;
  context: T;
  groups: SongGroup[];
  placeholder?: ReactNode;
  renderGroup: (group: SongGroup) => ReactNode;
  renderItem: (item: SongGroup['songs'][number], group: SongGroup, props?: { style: CSSProperties }) => ReactNode;
  ListRowWrapper: ComponentType<PropsWithChildren<{ group?: SongGroup }>>;
  GroupRowWrapper: ComponentType<PropsWithChildren<{ group?: SongGroup }>>;
  perRow: number;
  itemHeight: number;
  groupHeight: number;
  focusedSong: number;
  focusedGroup: string;
}

function VirtualizedListInner<T>(props: Props<T>, ref: ForwardedRef<VirtualizedListMethods>) {
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
    (group: string, index: number) => {
      let groupIndex = props.groups.findIndex((g) => g.letter === group);

      if (groupIndex === -1) {
        return props.groups.findIndex((g) => g.songs.some((s) => s.index === index));
      }
      return groupIndex;
    },
    [props.groups],
  );

  const getSongRow = useCallback(
    (group: string, index: number) => {
      let groupIndex = getGroupIndex(group, index);
      if (groupIndex === -1) {
        return;
      }

      const songIndex = props.groups[groupIndex].songs.findIndex((s) => s.index === index);

      return groupedRows
        .slice(0, groupIndex)
        .reduce((acc, { rows }) => acc + rows.length, Math.floor(songIndex / props.perRow));
    },
    [getGroupIndex, groupedRows, props.groups, props.perRow],
  );

  useImperativeHandle(ref, (): VirtualizedListMethods => {
    return {
      getSongPosition: (group, index) => {
        let groupIndex = getGroupIndex(group, index);
        if (groupIndex === -1) {
          return;
        }

        const songIndex = props.groups[groupIndex].songs.findIndex((s) => s.index === index);

        const rowsToScroll = groupedRows
          .slice(0, groupIndex)
          .reduce((acc, { rows }) => acc + rows.length, Math.floor(songIndex / props.perRow));

        const y = virtuoso.current?.getItemPositionY(rowsToScroll) ?? -1;

        const x = songIndex % props.perRow;

        return { x, y };
      },
      scrollToGroup: (group: string) => {
        const groupIndex = props.groups.findIndex((g) => g.letter === group);

        if (groupIndex === -1) {
          return;
        }
        virtuoso.current?.scrollToGroup(groupIndex, 'smooth');
      },
      scrollToSongInGroup: async (group, index, behavior = 'smooth') => {
        const songRowIndex = getSongRow(group, index);
        if (songRowIndex !== undefined) {
          virtuoso.current?.scrollToIndex(songRowIndex, isE2E() ? 'auto' : behavior);
        }
      },
    };
  });

  return (
    <>
      <CustomVirtualization
        forceRenderItem={getSongRow(props.focusedGroup, props.focusedSong) ?? -1}
        overScan={props.itemHeight * 2}
        itemHeight={props.itemHeight}
        groupHeight={props.groupHeight}
        key={props.itemHeight}
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
          <ListRowWrapper group={groupedRows[groupIndex].group} {...itemProps}>
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

// https://stackoverflow.com/a/58473012
export const VirtualizedList = forwardRef(VirtualizedListInner) as <T>(
  p: Props<T> & { ref?: Ref<VirtualizedListMethods> },
) => ReactElement;

import useBaseUnitPx from 'hooks/useBaseUnitPx';
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
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Components, GroupedVirtuoso, LocationOptions, LogLevel, VirtuosoHandle } from 'react-virtuoso';
import { SongGroup } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import isE2E from 'utils/isE2E';
import { CustomVirtualization } from 'Scenes/SingASong/SongSelection/Components/CustomVirtualization';

export interface VirtualizedListMethods {
  scrollToTop: () => void;
  scrollToSongInGroup: (group: string, songId: number, behavior?: LocationOptions['behavior']) => Promise<void>;
  scrollToGroup: (group: string) => void;
}

interface Props<T> {
  components: Components<SongGroup, T>;
  context: T;
  groups: SongGroup[];
  placeholder?: ReactNode;
  renderGroup: (group: SongGroup) => ReactNode;
  renderItem: (item: SongGroup['songs'][number], group: SongGroup) => ReactNode;
  ListRowWrapper: ComponentType<PropsWithChildren<{ group: SongGroup }>>;
  GroupRowWrapper: ComponentType<PropsWithChildren<{ group: SongGroup }>>;
  perRow: number;
  itemHeight: number;
}

function VirtualizedListInner<T>(props: Props<T>, ref: ForwardedRef<VirtualizedListMethods>) {
  const baseUnit = useBaseUnitPx();
  const virtuoso = useRef<VirtuosoHandle>(null);

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

  useImperativeHandle(
    ref,
    (): VirtualizedListMethods => ({
      scrollToTop: () => {
        virtuoso.current?.scrollTo({ top: 0 });
        window.scrollTo(0, 0);
      },
      scrollToGroup: (group: string) => {
        const groupIndex = props.groups.findIndex((g) => g.letter === group);

        if (groupIndex === -1) {
          return;
        }
        const rowsToScroll = groupedRows.slice(0, groupIndex).reduce((acc, { rows }) => acc + rows.length, 0);
        virtuoso.current?.scrollToIndex({ index: rowsToScroll, behavior: 'smooth', align: 'start' });
      },
      scrollToSongInGroup: async (group, index, behavior = 'smooth') => {
        let groupIndex = props.groups.findIndex((g) => g.letter === group);

        if (groupIndex === -1) {
          groupIndex = props.groups.findIndex((g) => g.songs.some((s) => s.index === index));
        }
        if (groupIndex === -1) {
          return;
        }

        const songIndex = props.groups[groupIndex].songs.findIndex((s) => s.index === index);

        const rowsToScroll = groupedRows
          .slice(0, groupIndex)
          .reduce((acc, { rows }) => acc + rows.length, Math.floor(songIndex / props.perRow));

        virtuoso.current?.scrollToIndex?.({
          index: rowsToScroll,
          behavior: isE2E() ? 'auto' : behavior,
          align: 'center',
        });
      },
    }),
  );

  return (
    <>
      <CustomVirtualization
        overScan={props.itemHeight * 2}
        itemHeight={props.itemHeight}
        groupHeight={props.itemHeight}
        key={props.itemHeight}
        // increaseViewportBy={baseUnit * 50}
        // style={styles}
        // logLevel={LogLevel.DEBUG}
        // components={props.components}
        context={props.context}
        groupContent={(index, groupProps) => {
          if (!groupedRows[index]) {
            debugger;
          }
          return (
            <GroupRowWrapper group={groupedRows[index].group} {...groupProps}>
              {props.renderGroup(groupedRows[index].group)}
            </GroupRowWrapper>
          );
        }}
        // ref={virtuoso}
        groupSizes={groupSizes}
        itemContent={(index, groupIndex) => (
          <ListRowWrapper group={groupedRows[groupIndex].group}>
            {flatRows[index].map((song) => props.renderItem(song, groupedRows[groupIndex].group))}
            {props.placeholder &&
              flatRows[index].length < props.perRow &&
              new Array(props.perRow - flatRows[index].length)
                .fill(null)
                .map((_, i) => <Fragment key={i}>{props.placeholder}</Fragment>)}
          </ListRowWrapper>
        )}
      />

      {/*<GroupedVirtuoso*/}
      {/*  // itemSize={() => props.itemHeight}*/}
      {/*  // defaultItemHeight={props.itemHeight}*/}
      {/*  fixedItemHeight={props.itemHeight}*/}
      {/*  key={props.itemHeight}*/}
      {/*  increaseViewportBy={baseUnit * 50}*/}
      {/*  style={styles}*/}
      {/*  logLevel={LogLevel.DEBUG}*/}
      {/*  components={props.components}*/}
      {/*  context={props.context}*/}
      {/*  groupContent={(index) => (*/}
      {/*    <GroupRowWrapper group={groupedRows[index].group}>*/}
      {/*      {props.renderGroup(groupedRows[index].group)}*/}
      {/*    </GroupRowWrapper>*/}
      {/*  )}*/}
      {/*  ref={virtuoso}*/}
      {/*  groupCounts={groupSizes}*/}
      {/*  itemContent={(index, groupIndex) => (*/}
      {/*    <ListRowWrapper group={groupedRows[groupIndex].group}>*/}
      {/*      {flatRows[index].map((song) => props.renderItem(song, groupedRows[groupIndex].group))}*/}
      {/*      {props.placeholder &&*/}
      {/*        flatRows[index].length < props.perRow &&*/}
      {/*        new Array(props.perRow - flatRows[index].length)*/}
      {/*          .fill(null)*/}
      {/*          .map((_, i) => <Fragment key={i}>{props.placeholder}</Fragment>)}*/}
      {/*    </ListRowWrapper>*/}
      {/*  )}*/}
      {/*/>*/}
    </>
  );
}

const styles: CSSProperties = {
  overflowX: 'hidden',
};

// https://stackoverflow.com/a/58473012
export const VirtualizedList = forwardRef(VirtualizedListInner) as <T>(
  p: Props<T> & { ref?: Ref<VirtualizedListMethods> },
) => ReactElement;

import styled from '@emotion/styled';
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
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Components, GroupedVirtuoso, LocationOptions, LogLevel, VirtuosoHandle } from 'react-virtuoso';
import { SongGroup } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import isE2E from 'utils/isE2E';
import { positions } from '@mui/system';
import { useMeasure, useScroll } from 'react-use';

export interface VirtualizedListMethods {
  scrollTo: (pos: number) => void;
  scrollToIndex: (
    index: number,
    behavior?: LocationOptions['behavior'],
    align?: LocationOptions['align'],
  ) => Promise<void>;
}

interface Props<T> {
  overScan: number;
  groupHeight: number;
  itemHeight: number;
  itemContent: (index: number, groupIndex: number, props?: { style: CSSProperties }) => ReactNode;
  groupContent: (index: number, props?: { style: CSSProperties }) => ReactNode;
  // components: Components<SongGroup, T>;
  context: T;
  groupSizes: number[];
  // items: any[];
}

function CustomVirtualizationInner<T>(props: Props<T>, ref: ForwardedRef<VirtualizedListMethods>) {
  const virtuoso = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    (): VirtualizedListMethods => ({
      scrollTo: (pos: number) => {
        virtuoso.current?.scrollTo({ top: pos });
      },
      scrollToIndex: async (index, behavior = 'smooth', align = 'center') => {},
    }),
  );

  const itemsPositions = useMemo(() => {
    const sizes: Array<{ type: 'group' | 'item'; bottom: number; index: number; groupIndex: number }> = [];

    props.groupSizes.forEach((groupSize, index) => {
      sizes.push({ index, type: 'group', bottom: (sizes.at(-1)?.bottom ?? 0) + props.groupHeight, groupIndex: index });
      for (let i = 0; i < groupSize; i++) {
        const itemIndex = props.groupSizes.reduce((acc, size, j) => acc + (j < index ? size : 0), 0) + i;
        sizes.push({
          index: itemIndex,
          type: 'item',
          bottom: (sizes.at(-1)?.bottom ?? 0) + props.itemHeight,
          groupIndex: index,
        });
      }
    });

    return sizes;
  }, [props.itemHeight, props.groupHeight, props.groupSizes]);

  const totalHeight = itemsPositions.at(-1)?.bottom ?? 0;

  const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState(2000);

  const computeVisibleItemsRange = useCallback(
    (scrollTop: number) => {
      const firstVisibleItem = itemsPositions.findIndex((item) => item.bottom > scrollTop - props.overScan);
      // todo subtract item height from bottom
      const lastVisibleItem = itemsPositions.findIndex(
        (item) => item.bottom > scrollTop + viewportHeight + props.overScan,
      );

      return [firstVisibleItem, lastVisibleItem === -1 ? itemsPositions.length : lastVisibleItem];
    },
    [itemsPositions, viewportHeight, props.overScan],
  );

  const [[rangeFrom, rangeTo], setItemsRange] = useState(computeVisibleItemsRange(0));

  const measuredRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setViewportElement(node);
      setViewportHeight(node.getBoundingClientRect().height);
    }
  }, []);

  useEffect(() => {
    if (viewportElement) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { height } = entry.contentRect;
          setViewportHeight(height);
        }
      });
      observer.observe(viewportElement);

      const onScroll = () => {
        const newItemsRange = computeVisibleItemsRange(viewportElement.scrollTop);
        if (rangeFrom !== newItemsRange[0] || rangeTo !== newItemsRange[1]) {
          console.log(viewportElement.scrollTop, rangeFrom, ' -> ', newItemsRange[0], viewportHeight);
          setItemsRange(newItemsRange);
        }
      };

      viewportElement.addEventListener('scroll', onScroll);

      return () => {
        observer.disconnect();
        viewportElement.removeEventListener('scroll', onScroll);
      };
    }
  }, [viewportElement, rangeFrom, rangeTo, computeVisibleItemsRange]);

  const countPadding = useCallback(
    (from: number, to: number) =>
      itemsPositions
        .slice(from, to)
        .reduce((acc, item) => acc + (item.type === 'group' ? props.groupHeight : props.itemHeight), 0),
    [itemsPositions, props.groupHeight, props.itemHeight],
  );

  const paddingTop = useMemo(() => countPadding(0, rangeFrom), [rangeFrom, countPadding]);

  // In case the group elements of the first items to render is not on the list, we need to render it manually
  // with the correct padding
  const groupToRender = itemsPositions.slice(0, rangeFrom).findLastIndex(({ type }) => type === 'group');

  const itemsToRender = itemsPositions.slice(rangeFrom, rangeTo);
  const groupedItemsToRender: Array<(typeof itemsToRender)[number]>[] = [];

  if (groupToRender !== -1) {
    groupedItemsToRender.push([]);
  }

  for (let i = 0; i < itemsToRender.length; i++) {
    const item = itemsToRender[i];
    if (item.type === 'group') {
      groupedItemsToRender.push([]);
    }
    groupedItemsToRender.at(-1)?.push(item);
  }

  if (groupToRender === -1 && groupedItemsToRender[0][0]?.type !== 'group') {
    console.log('wat', groupToRender, groupedItemsToRender);
  }

  console.log(groupToRender, groupedItemsToRender);

  return (
    <>
      <Viewport ref={measuredRef}>
        {viewportHeight > 0 && (
          <Wrapper
            style={{
              height: totalHeight,
              paddingTop: groupToRender !== -1 ? paddingTop - props.groupHeight : paddingTop,
            }}>
            {groupedItemsToRender.map((group, index) => (
              <div key={index}>
                {index === 0 && groupToRender !== -1 && props.groupContent(itemsPositions[groupToRender].index)}
                {group.map(({ index, type, bottom, groupIndex }) => {
                  return (
                    <Fragment key={`${bottom}`}>
                      {type === 'group' ? props.groupContent(index) : props.itemContent(index, groupIndex)}
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </Wrapper>
        )}
      </Viewport>
    </>
  );
}

const Wrapper = styled.div`
  box-sizing: border-box;
  position: relative;
`;

const Viewport = styled.div`
  overflow: auto;
  height: 100%;
  width: 100%;
`;

const styles: CSSProperties = {
  overflowX: 'hidden',
};

// https://stackoverflow.com/a/58473012
export const CustomVirtualization = forwardRef(CustomVirtualizationInner) as <T>(
  p: Props<T> & { ref?: Ref<VirtualizedListMethods> },
) => ReactElement;

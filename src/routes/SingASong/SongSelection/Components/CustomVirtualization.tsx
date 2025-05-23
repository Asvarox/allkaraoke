import styled from '@emotion/styled';
import {
  CSSProperties,
  ForwardedRef,
  Fragment,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface ItemPosition {
  type: 'group' | 'item';
  bottom: number;
  index: number;
  groupIndex: number;
}

export interface CustomVirtualizedListMethods {
  getItemPositionY: (index: number) => number;
  scrollTo: (pos: number) => void;
  scrollToIndex: (index: number, behavior?: ScrollToOptions['behavior']) => Promise<void>;
  scrollToGroup: (groupIndex: number, behavior?: ScrollToOptions['behavior']) => Promise<void>;
}

export interface Components<T> {
  Header?: (props: { context?: T }) => ReactNode;
  EmptyPlaceholder?: (props: { context?: T }) => ReactNode;
}

interface Props<T> {
  forceRenderItem: number;
  overScan: number;
  groupHeaderHeight: number;
  itemHeight: number;
  itemContent: (
    index: number,
    groupIndex: number,
    props?: { style?: CSSProperties } & Record<`data-${string}`, string | number>,
  ) => ReactNode;
  groupContent: (index: number, props?: { style: CSSProperties }) => ReactNode;
  components: Components<T>;
  Footer?: ReactNode;
  context: T;
  groupSizes: number[];
  ref?: ForwardedRef<CustomVirtualizedListMethods>;
}

const isBetween = (value: number, min: number, max: number) => value >= min && value < max;

export function CustomVirtualization<T>(props: Props<T>) {
  const viewportElementRef = useRef<HTMLDivElement | null>(null);

  const itemsPositions = useMemo(() => {
    const sizes: ItemPosition[] = [];

    // build the list of items with their positions
    props.groupSizes.forEach((groupSize, index) => {
      sizes.push({
        index,
        type: 'group',
        bottom: (sizes.at(-1)?.bottom ?? 0) + props.groupHeaderHeight,
        groupIndex: index,
      });
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
  }, [props.itemHeight, props.groupHeaderHeight, props.groupSizes]);

  const isEmptyList = !itemsPositions.some((item) => item.type === 'item');

  const totalHeight = itemsPositions.at(-1)?.bottom ?? 0;

  const computeVisibleItemsRange = useCallback(
    (scrollTop: number) => {
      const viewportHeight = viewportElementRef.current?.getBoundingClientRect().height ?? global.innerHeight;
      const firstVisibleItem = itemsPositions.findIndex((item) => item.bottom > scrollTop - props.overScan);
      // todo subtract item height from bottom
      const lastVisibleItem = itemsPositions.findIndex(
        (item) => item.bottom > scrollTop + viewportHeight + props.overScan,
      );

      return [firstVisibleItem, lastVisibleItem === -1 ? itemsPositions.length : lastVisibleItem];
    },
    [itemsPositions, props.overScan],
  );

  const [[rangeFrom, rangeTo], setItemsRange] = useState(() => computeVisibleItemsRange(0));

  useLayoutEffect(() => {
    if (viewportElementRef.current) {
      // if the new scrollTop would cause different changes the range to render, update it
      const onScroll = () => {
        const newItemsRange = computeVisibleItemsRange(viewportElementRef.current?.scrollTop ?? 0);
        if (rangeFrom !== newItemsRange[0] || rangeTo !== newItemsRange[1]) {
          setItemsRange(newItemsRange);
        }
      };

      viewportElementRef.current.addEventListener('scroll', onScroll);

      if (viewportElementRef.current.scrollTop > totalHeight) {
        viewportElementRef.current.scrollTo({ top: 0 });
      }

      onScroll(); // todo determine if this is needed?

      return () => {
        viewportElementRef.current?.removeEventListener('scroll', onScroll);
      };
    }
  }, [rangeFrom, rangeTo, computeVisibleItemsRange, totalHeight]);

  const countPxDistance = useCallback(
    (from: number, to: number) => (itemsPositions[to]?.bottom ?? 0) - (itemsPositions[from]?.bottom ?? 0),
    [itemsPositions],
  );

  // we want to count from 0px, and -1 will point to non-existing element
  const paddingTop = useMemo(() => countPxDistance(-1, rangeFrom - 1), [rangeFrom, countPxDistance]);

  // If the group is large enough, it might happen that the 'group' item is not in range to be rendered, even though
  // it's sticky. In that case, we need to render it manually.
  const groupToRender = itemsPositions.slice(0, rangeFrom).findLastIndex(({ type }) => type === 'group');

  const itemsToRender = itemsPositions.slice(rangeFrom, rangeTo);

  // To make position: sticky work, we need to render the group-type items in separate divs, so they collapse
  // on reaching the end if it.
  // If the group header needs to be rendered manually, add fake group to the grouted items list
  const groupedItemsToRender: Array<(typeof itemsToRender)[number]>[] = groupToRender !== -1 ? [[]] : [];
  for (let i = 0; i < itemsToRender.length; i++) {
    const item = itemsToRender[i];
    if (item.type === 'group') {
      groupedItemsToRender.push([]);
    }
    groupedItemsToRender.at(-1)?.push(item);
  }

  useImperativeHandle(props.ref, () => ({
    getItemPositionY: (index) =>
      (itemsPositions.find((item) => item.type === 'item' && item.index === index)?.bottom ?? -1) - props.itemHeight,
    scrollTo: (pos: number) => {
      viewportElementRef.current?.scrollTo({ top: pos });
    },
    scrollToIndex: async (index, behavior = 'auto', align = 'center') => {
      const item = itemsPositions.find((item) => item.type === 'item' && item.index === index);
      if (item) {
        const scrollPos = (props.itemHeight + (align === 'center' ? viewportElementRef.current?.clientHeight! : 0)) / 2;
        viewportElementRef.current?.scrollTo({ top: item.bottom - scrollPos, behavior });
      }
    },
    scrollToGroup: async (groupIndex, behavior = 'auto') => {
      const item = itemsPositions.find((item) => item.type === 'group' && item.index === groupIndex);
      if (item) {
        viewportElementRef.current?.scrollTo({ top: item.bottom - props.groupHeaderHeight, behavior });
      }
    },
  }));
  const { Header, EmptyPlaceholder } = props.components ?? {};
  const Footer = props.Footer;

  const forcedItemIndex = itemsPositions.findIndex(
    (item) => item.type === 'item' && item.index === props.forceRenderItem,
  );

  const pt = groupToRender !== -1 ? paddingTop - props.groupHeaderHeight : paddingTop;

  return (
    <Viewport ref={viewportElementRef}>
      <Wrapper
        style={{
          height: totalHeight,
        }}>
        {Header && <Header context={props.context} />}
        {itemsPositions[forcedItemIndex] && !isBetween(forcedItemIndex, rangeFrom, rangeTo) && (
          <>
            {props.itemContent(itemsPositions[forcedItemIndex].index, itemsPositions[forcedItemIndex].groupIndex, {
              style: {
                width: '100%',
                position: 'absolute',
                top: itemsPositions[forcedItemIndex].bottom - props.itemHeight,
                left: 0,
                boxSizing: 'border-box',
              },
              'data-virtualized-bottom': itemsPositions[forcedItemIndex].bottom,
              'data-virtualized-index': itemsPositions[forcedItemIndex].index,
            })}
          </>
        )}
        <div style={{ transform: `translateY(${pt}px)` }}>
          {groupedItemsToRender.map((group, index) => (
            // Make sure that th key is pointing to the group-index, to prevent remounting of elements if a group disappears
            <div
              key={(group[0] ?? itemsPositions[groupToRender]).groupIndex}
              data-virtualized-group={(group[0] ?? itemsPositions[groupToRender]).groupIndex}>
              {index === 0 && groupToRender !== -1 && props.groupContent(itemsPositions[groupToRender].index)}
              {group.map(({ index, type, bottom, groupIndex }) => {
                return (
                  <Fragment key={`${bottom}`}>
                    {type === 'group'
                      ? props.groupContent(index)
                      : props.itemContent(index, groupIndex, {
                          'data-virtualized-bottom': bottom,
                          'data-virtualized-index': index,
                        })}
                  </Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </Wrapper>
      {isEmptyList && EmptyPlaceholder && <EmptyPlaceholder context={props.context} />}
      {Footer && Footer}
    </Viewport>
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

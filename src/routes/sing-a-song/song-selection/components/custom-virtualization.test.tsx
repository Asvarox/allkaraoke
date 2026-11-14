import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CustomVirtualization } from '~/routes/sing-a-song/song-selection/components/custom-virtualization';

const renderList = () =>
  render(
    <CustomVirtualization
      forceRenderItem={-1}
      overScan={0}
      groupHeaderHeight={10}
      itemHeight={10}
      itemContent={(index) => <div>item {index}</div>}
      groupContent={(index) => <div>group {index}</div>}
      components={{}}
      context={undefined}
      groupSizes={[500]}
    />,
  );

describe('CustomVirtualization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not loop into maximum update depth when the viewport height alternates between measurements', () => {
    // Simulates WebKit reporting a different viewport height each time rows mount, so every
    // measurement yields a different visible range
    let call = 0;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ height: call++ % 2 === 0 ? 100 : 300 }) as DOMRect,
    );

    expect(() => renderList()).not.toThrow();
    expect(screen.getByText('item 0')).toBeInTheDocument();
  });
});

import { useState } from 'react';
import { render } from 'vitest-browser-react';

import { ScrollableColumn } from '~/modules/elements/akui/scrollable-container';

const ROW_COUNT = 10;

/** Rows arrive a moment after mounting, the way a board's do once its scores have loaded. */
function LateRows({ intoContentsSlot }: { intoContentsSlot: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const rows = loaded && Array.from({ length: ROW_COUNT }, (_, index) => <div key={index} className="h-10 shrink-0" />);

  return (
    <>
      <button onClick={() => setLoaded(true)}>load</button>
      <ScrollableColumn className="h-[100px]" data-test="list">
        {/* The song preview portals its leaderboard into a slot like this one */}
        {intoContentsSlot ? <div className="contents">{rows}</div> : rows}
      </ScrollableColumn>
    </>
  );
}

test.each([
  ['directly in the list', false],
  ['in a display: contents slot', true],
])('should fade the end edge once rows that overflow arrive %s', async (_, intoContentsSlot) => {
  const screen = await render(<LateRows intoContentsSlot={intoContentsSlot} />);
  const endFade = () => screen.getByTestId('list').element().style.getPropertyValue('--scroll-mask-end');

  await expect.poll(endFade).toBe('0px');
  await screen.getByRole('button').click();
  await expect.poll(endFade).toBe('40px');
});

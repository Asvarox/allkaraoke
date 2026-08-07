import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import KeyboardHelpView from './help-view';

describe('KeyboardHelpView', () => {
  it('stays hidden when every entry is undefined', () => {
    const { container } = render(<KeyboardHelpView help={{ vertical: undefined, accept: undefined }} />);

    expect(container.querySelector('[data-test="help-container"]')).toHaveAttribute('data-visible', 'false');
  });

  it('becomes visible for a defined entry the view has no renderer for', () => {
    // `notAKnownKey` isn't in `KeyhelpComponent`, so it's filtered out of the rendered rows, but its
    // presence still means there's real (defined) help content to show.
    const { container } = render(
      // @ts-expect-error deliberately passing an unrecognised key to exercise the "unknown but defined" path
      <KeyboardHelpView help={{ notAKnownKey: 'some value' }} />,
    );

    expect(container.querySelector('[data-test="help-container"]')).toHaveAttribute('data-visible', 'true');
  });
});

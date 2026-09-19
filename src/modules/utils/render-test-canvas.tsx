import { render } from 'vitest-browser-react';

import { Props, TestCanvas } from '~/modules/utils/test-canvas';

/** Renders a `TestCanvas` and returns its 2D context, together with the locator to screenshot */
export const renderTestCanvas = async (props: Props) => {
  const screen = await render(<TestCanvas {...props} />);
  const canvas = screen.container.querySelector('canvas')!;

  return { canvas, ctx: canvas.getContext('2d')!, locator: screen.css('#canvas') };
};

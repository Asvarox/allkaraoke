import { expect, test } from "@playwright/experimental-ct-react";
import { TestCanvas } from "./TestCanvas";

test.use({ viewport: { width: 800, height: 650 } });

const FPS = 30

test('Should properly draw game state', async ({ mount, page }) => {

    const component = await mount(
        <TestCanvas frequencyChannel0={0} frequencyChannel1={1} timeMs={0} />,
    );

    const CHANNEL2_VALUES = [410, 413, 416, 413, 410, 407, 404, 407];
    const DRAWN_SECONDS = 2.5;


    for (let i = 0; i < FPS * DRAWN_SECONDS; i++) {
        await component.update(
            <TestCanvas frequencyChannel0={440} frequencyChannel1={CHANNEL2_VALUES[i % CHANNEL2_VALUES.length]} timeMs={i * (1000 / FPS)} />
        );
        await component.getByTestId('update').click();
    }

    await expect(await component.screenshot()).toMatchSnapshot('proper-game-state.png', { maxDiffPixelRatio: 0.01 });
});

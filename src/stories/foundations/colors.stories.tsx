import { Meta, StoryFn } from '@storybook/react-vite';

import { Chip } from '~/modules/elements/akui/chip';
import styles, { colorSets } from '~/modules/game-engine/drawing/styles';

import { Page, Row, Section, Swatch, TextSample } from './foundations-kit';

export default {
  title: 'Foundations/Colours',
} as Meta;

/** The seasonal palettes, grouped the way `colorThemes` in `styles.ts` assigns them to players. */
const THEMES = {
  regular: ['blue', 'red', 'green', 'yellow', 'pink', 'orange'],
  christmas: ['christmasGreen', 'christmasRed', 'christmasBlue', 'christmasGold', 'christmasViolet', 'christmasSilver'],
  eurovision: [
    'eurovisionBlue',
    'eurovisionRed',
    'eurovisionGreen',
    'eurovisionPink',
    'eurovisionViolet',
    'eurovisionOrange',
  ],
  halloween: ['halloweenOrange', 'halloweenViolet', 'halloweenRed', 'halloweenGreen', 'halloweenBlue', 'halloweenGold'],
} satisfies Record<string, (keyof typeof colorSets)[]>;

export const Colours: StoryFn = () => (
  <Page
    title="Colours"
    intro={
      <>
        Every colour in the game resolves from <code>src/modules/game-engine/drawing/styles.ts</code>. The Tailwind
        config reads that file at build time, so the canvas the notes are drawn on and the DOM the menus are built from
        are painted from one source. Swatches below print their own computed value — if a token moves, this page moves
        with it.
      </>
    }>
    <Section
      title="Text"
      note={
        <>
          Four semantic tokens carry every piece of text in the game. <code>text-default</code> is the one the{' '}
          <code>typography</code> utility applies, so it is the colour text takes when nothing says otherwise.
        </>
      }>
      <Row name="text-default" meta="body copy">
        <TextSample property="color" className="text-default text-lg">
          The quick brown fox
        </TextSample>
      </Row>
      <Row name="text-active" meta="focus, headings, emphasis">
        <TextSample property="color" className="text-active text-lg">
          The quick brown fox
        </TextSample>
      </Row>
      <Row name="text-inactive" meta="the line not being sung">
        <TextSample property="color" className="text-inactive text-lg">
          The quick brown fox
        </TextSample>
      </Row>
      <Row name="text-error" meta="validation only">
        <TextSample property="color" className="text-error text-lg">
          The quick brown fox
        </TextSample>
      </Row>
    </Section>

    <Section
      title="Player colours"
      note={
        <>
          One set per player, up to six. Each set carries a fill and a stroke plus the note variants the renderer draws
          with — <code>hit</code>, <code>miss</code>, <code>perfect</code> and the golden-note pair. The order here is
          the order players are assigned.
        </>
      }>
      {styles.colors.players.map((player, index) => (
        <Row key={index} name={`players[${index}]`} meta="fill · stroke">
          <div className="flex flex-wrap gap-4">
            <Swatch style={{ background: player.text }} />
            <Swatch style={{ background: player.stroke }} />
          </div>
        </Row>
      ))}
    </Section>

    <Section
      title="Seasonal themes"
      note={
        <>
          <code>switchToTheme()</code> swaps the whole player palette in place when a themed song plays. It mutates{' '}
          <code>styles.colors.players</code> directly rather than going through state, so canvas picks it up on the next
          frame — components that need to follow it have to force their own update.
        </>
      }>
      {Object.entries(THEMES).map(([theme, names]) => (
        <Row key={theme} name={theme} meta={`${names.length} players`}>
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <div
                key={name}
                title={name}
                className="h-10 w-16 rounded-md border border-white/20"
                style={{ background: colorSets[name].text }}
              />
            ))}
          </div>
        </Row>
      ))}
    </Section>

    <Section
      title="Status"
      note={
        <>
          Status colour lives in <code>Chip</code> rather than in loose Tailwind palette classes, so a warning looks the
          same everywhere one appears. Each variant is a fill, a border and a text colour picked to hold contrast on the
          dark ground.
        </>
      }>
      <Row name="Chip variants">
        <div className="flex flex-wrap gap-2">
          <Chip variant="slate">slate</Chip>
          <Chip variant="zinc">zinc</Chip>
          <Chip variant="blue">blue</Chip>
          <Chip variant="esc">esc</Chip>
          <Chip variant="green">green</Chip>
          <Chip variant="orange">orange</Chip>
        </div>
      </Row>
    </Section>
  </Page>
);

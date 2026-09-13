import { Meta, StoryFn } from '@storybook/react-vite';

import { Chip } from '~/modules/elements/akui/chip';
import { statusSurface } from '~/modules/elements/akui/surfaces';
import styles, { colorSets } from '~/modules/game-engine/drawing/styles';

import { ContrastReadout, Page, Row, Section, Swatch, TextSample } from './foundations-kit';

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
          Three semantic tokens carry the body of the game. <code>text-default</code> is the one the{' '}
          <code>typography</code> utility applies, so it is the colour text takes when nothing says otherwise. Anything
          reporting a state takes a status role instead — those are further down.
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
          Four roles, and every way the app reports state uses them: a validation error, a dropped mic, the remote
          mic&rsquo;s connection dot, a browser advisory. <code>warning</code> is amber rather than orange because{' '}
          <code>active</code> is orange and means <em>focused</em> — the orange these used to be was close enough that
          an unstable-mic icon read as a focused control.
        </>
      }>
      <Row name="text-danger" meta="broken, or about to destroy something">
        <ContrastReadout className="text-danger" on="bg-slate-800" />
      </Row>
      <Row name="text-warning" meta="degraded but still working">
        <ContrastReadout className="text-warning" on="bg-slate-800" />
      </Row>
      <Row name="text-success" meta="confirmed good">
        <ContrastReadout className="text-success" on="bg-slate-800" />
      </Row>
      <Row name="text-info" meta="in progress, neither yet">
        <ContrastReadout className="text-info" on="bg-slate-800" />
      </Row>
      <Row name="statusSurface[role]" meta="fill + border, no text colour">
        <div className="flex flex-wrap gap-2">
          {(['danger', 'warning', 'success', 'info'] as const).map((role) => (
            <div key={role} className={`rounded-md px-3 py-2 text-sm ${statusSurface[role]}`}>
              {role}
            </div>
          ))}
        </div>
      </Row>
    </Section>

    <Section
      title="Chip"
      note={
        <>
          Two axes on one component. The category variants label what something <em>is</em> — <code>green</code> here
          means &ldquo;new&rdquo;, not &ldquo;good&rdquo; — and are picked to be told apart from each other. The status
          variants take the roles above, so a chip reporting a failure matches every other failure in the app.
        </>
      }>
      <Row name="category" meta="what it is">
        <div className="flex flex-wrap gap-2">
          <Chip variant="slate">slate</Chip>
          <Chip variant="zinc">zinc</Chip>
          <Chip variant="blue">blue</Chip>
          <Chip variant="esc">esc</Chip>
          <Chip variant="green">new</Chip>
          <Chip variant="orange">preview</Chip>
        </div>
      </Row>
      <Row name="status" meta="how it is going">
        <div className="flex flex-wrap gap-2">
          <Chip variant="danger">danger</Chip>
          <Chip variant="warning">warning</Chip>
          <Chip variant="success">success</Chip>
          <Chip variant="info">info</Chip>
        </div>
      </Row>
    </Section>
  </Page>
);

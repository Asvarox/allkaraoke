import { Meta, StoryFn } from '@storybook/react-vite';

import { Menu } from '~/modules/elements/akui/menu';

import { Page, Row, Section, TextSample } from './foundations-kit';

export default {
  title: 'Foundations/Typography',
} as Meta;

/**
 * The scale as `tailwind.config.js` declares it — it replaces Tailwind's own rather than extending
 * it. Written out as whole class names, not built with `text-${step}`: Tailwind scans source text
 * for literal classes, and an interpolated one would only render here by the accident of the same
 * class being used somewhere else in the app.
 */
const SCALE = [
  'text-xs',
  'text-sm',
  'text-md',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
] as const;

const WEIGHTS = ['font-normal', 'font-medium', 'font-semibold', 'font-bold'] as const;

export const Typography: StoryFn = () => (
  <Page
    title="Typography"
    intro={
      <>
        One family: Seravek, then Gill Sans Nova, Ubuntu, Calibri. It is a token — <code>theme.fontFamily.sans</code> —
        and <code>index.css</code> applies it to <code>body</code> rather than restating the stack, so{' '}
        <code>font-sans</code> means the game&rsquo;s font and not Tailwind&rsquo;s default. <code>font-mono</code> is
        the same arrangement for code. The root is 16px, doubling to 32px above 3840px so the game stays readable across
        the room on a 4K TV.
      </>
    }>
    <Section
      title="Scale"
      note={
        <>
          Ten steps, declared as <code>theme.fontSize</code> and therefore replacing Tailwind&rsquo;s default scale
          entirely. There is no <code>base</code>: it was Tailwind&rsquo;s name for a default nothing here used, and{' '}
          <code>sm</code> now carries its 16px. So the ladder runs <code>xs</code> → <code>sm</code> → <code>md</code>{' '}
          with no gap in it, and <code>md</code> is the default body size — what <code>Typography</code> applies when a
          caller says nothing.
        </>
      }>
      {SCALE.map((step) => (
        <Row key={step} name={step}>
          <TextSample property="font-size" className={`${step} truncate`}>
            Chodz, pomaluj mój świat
          </TextSample>
        </Row>
      ))}
    </Section>

    <Section
      title="Weight"
      note="Buttons and headings are bold; the rest of the game is normal. Medium and semibold appear rarely and mostly in denser, secondary UI.">
      {WEIGHTS.map((weight) => (
        <Row key={weight} name={weight}>
          <TextSample property="font-weight" className={`${weight} text-lg`}>
            Chodz, pomaluj mój świat
          </TextSample>
        </Row>
      ))}
    </Section>

    <Section
      title="The typography utility"
      note={
        <>
          <code>typography</code> applies <code>text-default</code> and colours any nested <code>strong</code> with{' '}
          <code>text-active</code>. It is registered with tailwind-merge as a text colour, so an explicit colour placed
          after it wins outright instead of the two fighting in the cascade.
        </>
      }>
      <Row name="typography" meta="with a nested strong">
        <span className="typography text-lg">
          Add <strong>vibrato</strong> to the notes you sing for bonus points
        </span>
      </Row>
      <Row name="typography + text-active" meta="the explicit colour wins">
        <span className="typography text-active text-lg">Entire game is navigable with a keyboard</span>
      </Row>
    </Section>

    <Section
      title="Treatments"
      note="Two effects exist to keep text legible on top of a moving song video rather than as decoration.">
      <Row name="stroke-text" meta="-webkit-text-stroke, for lyrics">
        <span className="typography stroke-text text-3xl">Chodz, pomaluj mój świat</span>
      </Row>
      <Row name="text-shadow-[…]" meta="on the active-orange fill">
        <span className="text-active text-3xl font-bold text-shadow-[0px_0px_3px_#000000]">
          Chodz, pomaluj mój świat
        </span>
      </Row>
      <Row name="uppercase" meta="every button label">
        <span className="typography text-lg font-bold uppercase">Sing a song</span>
      </Row>
    </Section>

    <Section
      title="Headings"
      note={
        <>
          A heading is sized like anything else. <code>index.css</code> used to give bare <code>h1</code>–
          <code>h5</code> their own sizes — a second scale outside <code>theme.fontSize</code>, with <code>h3</code> at
          1.75rem that no utility could reproduce — and that is gone. Pick the element for document structure and the
          size with a <code>text-*</code> class. The heading a player actually sees on a menu is{' '}
          <code>Menu.Header</code>.
        </>
      }>
      <Row name="Menu.Header" meta="what menus use">
        <Menu.Header>Sing a song</Menu.Header>
      </Row>
      <Row name="<h2 className='text-xl'>" meta="an unstyled h2 is body-sized now">
        <TextSample as="h2" property="font-size" className="text-xl">
          Chodz, pomaluj mój świat
        </TextSample>
      </Row>
    </Section>

    <Section
      title="Responsive"
      note={
        <>
          Tailwind&rsquo;s own breakpoints only — there are no custom variants left. <code>sm:</code> upward for
          min-width, the <code>max-*</code> variants where a rule has to stop applying, and stack them when a case needs
          both: <code>max-lg:landscape:</code> is how the landing page says &ldquo;a small screen held sideways&rdquo;.
          Watch the direction — <code>max-*</code> is max-width where <code>sm:</code> and friends are min-width, so
          mixing the two in one class list leaves a band of widths where it is not obvious which rule wins.
        </>
      }>
      <Row name="text-lg sm:text-xl" meta="resize the viewport to see it move">
        <TextSample property="font-size" className="text-lg sm:text-xl">
          Chodz, pomaluj mój świat
        </TextSample>
      </Row>
    </Section>
  </Page>
);

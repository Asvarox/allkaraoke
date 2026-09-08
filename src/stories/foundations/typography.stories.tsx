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
  'text-base',
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
        One family, set on <code>body</code> in <code>index.css</code>: Seravek, then Gill Sans Nova, Ubuntu, Calibri.
        There is no <code>fontFamily</code> in the Tailwind config, so <code>font-sans</code> would emit
        Tailwind&rsquo;s stack rather than this one — leave text to inherit instead. The root is 16px, doubling to 32px
        above 3840px so the game stays readable across the room on a 4K TV.
      </>
    }>
    <Section
      title="Scale"
      note={
        <>
          Eleven steps, declared as <code>theme.fontSize</code> and therefore replacing Tailwind&rsquo;s default scale
          entirely. Two things to know: <code>md</code> is an extra step that stock Tailwind has no equivalent for, and
          the real body sizes in the game are <code>sm</code> and <code>lg</code> rather than <code>base</code>.
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
          Bare <code>h1</code>–<code>h5</code> carry sizes set in <code>index.css</code>, and they do not all line up
          with the scale above — <code>h3</code> is 1.75rem, which no utility can reproduce. In practice the heading a
          player sees on a menu is <code>Menu.Header</code>, which is a span.
        </>
      }>
      {(['h1', 'h2', 'h3', 'h4', 'h5'] as const).map((tag) => (
        <Row key={tag} name={`<${tag}>`}>
          <TextSample as={tag} property="font-size">
            Chodz, pomaluj mój świat
          </TextSample>
        </Row>
      ))}
      <Row name="Menu.Header" meta="what menus actually use">
        <Menu.Header>Sing a song</Menu.Header>
      </Row>
    </Section>

    <Section
      title="Responsive"
      note={
        <>
          Two directions are in play. <code>mobile:</code> is a custom max-width variant at 900px, while{' '}
          <code>sm:</code> and friends are Tailwind&rsquo;s own min-width ones — they overlap between 640px and 900px,
          so pick one direction per component rather than mixing them in a single class list.
        </>
      }>
      <Row name="text-lg mobile:text-md" meta="resize the viewport to see it move">
        <TextSample property="font-size" className="mobile:text-md text-lg">
          Chodz, pomaluj mój świat
        </TextSample>
      </Row>
    </Section>
  </Page>
);

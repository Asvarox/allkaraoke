import { Meta, StoryFn } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';

import { Page, Row, Section } from './foundations-kit';

export default {
  title: 'Foundations/Layers',
} as Meta;

/**
 * The ladder, bottom to top. Written as whole class names so Tailwind emits every rung — which also
 * means a rung stays available while nothing in the app happens to be using it.
 */
const LADDER = [
  ['z-scene', "the song's background image, behind everything"],
  ['z-scene-hint', 'skip intro / skip outro prompts'],
  ['z-scene-overlay', 'the blurred song backdrop while singing'],
  ['z-scene-cover', 'the still covering the game overlay until the video starts'],
  ['z-hud', 'in-game readouts: the live leaderboard, status text'],
  ['z-hud-blocking', 'takes the screen: countdown, readiness, the mobile action bar'],
  ['z-chrome', 'sticky headers and bars belonging to one screen'],
  ['z-expanded-backdrop', "the expanded song preview's scrim"],
  ['z-expanded', 'the expanded song preview itself'],
  ['z-help', 'the keyboard help panel'],
  ['z-toolbar', 'the dev toolbar'],
  ['z-modal-backdrop', 'a dialog scrim, over everything a screen owns'],
  ['z-modal', 'the dialog'],
  ['z-modal-top-backdrop', 'a dialog or sheet opened from inside another'],
  ['z-modal-top', 'that second dialog'],
  ['z-toast', 'connection status — must outrank even a modal'],
] as const;

/** Reports the z-index the class actually resolves to, rather than the number this file thinks. */
function Rung({ className }: { className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).zIndex);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div ref={ref} className={`${className} relative h-2 rounded-full bg-white/25`} style={{ width: 40 }} />
      <code className="text-xs opacity-70">{value || '—'}</code>
    </div>
  );
}

export const Layers: StoryFn = () => (
  <Page
    title="Layers"
    intro={
      <>
        Anything that escapes its parent — <code>fixed</code>, or rendered through a portal — takes a rung on this
        ladder rather than picking a number. Before it existed the app held 22 different z-index values between 0 and
        100000, each of which only made sense against whichever other layer it had once been compared to.
      </>
    }>
    <Section
      title="The ladder"
      note={
        <>
          Ordered bottom to top. The numbers are deliberately close together and deliberately not interesting: reach for
          the rung whose description matches, and if none does, add one here rather than picking a value at the call
          site.
        </>
      }>
      {LADDER.map(([token, role]) => (
        <Row key={token} name={token} meta={role}>
          <Rung className={token} />
        </Row>
      ))}
    </Section>

    <Section
      title="Local stacking is not on the ladder"
      note={
        <>
          A positioned element with a transform, an opacity or a z-index of its own starts a new stacking context, and
          everything inside it competes only with its siblings. That is most of the z-index in the app — a badge over a
          song card, the volume bar behind a name — and it stays as plain <code>z-1</code>, <code>z-2</code>,{' '}
          <code>z-10</code>. Those numbers are local and mean nothing outside their component, which is exactly why they
          should stay small: a local <code>z-1000</code> reads like a global claim and is how this got out of hand.
        </>
      }>
      <Row name="z-1 · z-2 · z-3 · z-10 · z-20" meta="inside a component">
        <span className="text-sm opacity-70">
          Seven values across the whole app, none of them competing with the ladder above.
        </span>
      </Row>
    </Section>
  </Page>
);

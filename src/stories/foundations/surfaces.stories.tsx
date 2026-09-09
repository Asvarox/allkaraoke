import { Meta, StoryFn } from '@storybook/react-vite';

import { Backdrop } from '~/modules/elements/akui/backdrop';
import { Button } from '~/modules/elements/akui/button';
import Box from '~/modules/elements/akui/primitives/box';
import { dialogSurface, interactiveFocus, interactiveSurface } from '~/modules/elements/akui/surfaces';

import { BusyGround, Page, Row, Section, Swatch } from './foundations-kit';

export default {
  title: 'Foundations/Surfaces',
} as Meta;

export const Surfaces: StoryFn = () => (
  <Page
    title="Surfaces"
    intro={
      <>
        Two separate languages, and the split is the thing to understand. In-game surfaces are translucent black: they
        sit <em>in</em> the scene and let the song video through. Dialog surfaces are opaque slate: they sit{' '}
        <em>on top of</em> the scene and have to stay readable over whatever is behind them. Everything below is shown
        over a deliberately busy ground, because judging a translucent fill against flat grey tells you nothing.
      </>
    }>
    <Section
      title="In-game surfaces"
      note={
        <>
          Three roles, all translucent black. <code>Box</code> is the default card and the one to reach for first —
          spelling out a background by hand is how the codebase ended up with sixteen different opacities. The scrim the{' '}
          <code>Backdrop</code> uses is a fourth value, but it is not a surface: nothing sits on it.
        </>
      }>
      <BusyGround>
        <div className="flex flex-col gap-3">
          <Box className="w-full items-stretch p-3">
            <code className="text-sm">Box — bg-black/40 · the default card</code>
          </Box>
          <Box className="w-full items-stretch bg-black/55 p-3">
            <code className="text-sm">
              bg-black/55 — one step up: anything interactive, plus tooltips and picked-out rows
            </code>
          </Box>
          <Box className="w-full items-stretch bg-black/75 p-3">
            <code className="text-sm">bg-black/75 — bars and toolbars</code>
          </Box>
        </div>
      </BusyGround>
    </Section>

    <Section
      title="Interactive surfaces"
      note={
        <>
          <code>interactiveSurface</code> — the resting state of anything the player can act on. The fill is a step
          above the card underneath, and the 1px orange hairline is the actual tell: on a TV across the room it is what
          separates &ldquo;you can press this&rdquo; from &ldquo;this is just a panel&rdquo;. Anything interactive
          should carry it, and anything carrying it should be interactive.
        </>
      }>
      <BusyGround>
        <Box className="w-full items-stretch gap-3 p-3">
          <code className="text-sm">a Box — no hairline, nothing to press</code>
          <div className={`rounded-xl p-3 ${interactiveSurface}`}>
            <code className="text-sm">interactiveSurface — the hairline says this responds</code>
          </div>
        </Box>
      </BusyGround>
    </Section>

    <Section
      title="Interactive states"
      note={
        <>
          Four states on top of the resting one. <code>interactiveFocus</code> is the quiet highlight — an inset orange
          ring for hover, and for keyboard focus on a control too big or too colourful to fill. Full keyboard focus
          instead floods the control with <code>bg-active</code>, which is what the TV needs from across a room.{' '}
          <code>inactiveSurface</code> is switched off but still operable; <code>disabled</code> is greyed out and
          unreachable, and the two must not look alike.
        </>
      }>
      <BusyGround>
        <Box className="w-full items-stretch gap-3 p-3">
          <div className="flex flex-wrap gap-3">
            <Button size="small" fullWidth={false} className="px-6">
              Resting
            </Button>
            <Button size="small" fullWidth={false} className={`px-6 ${interactiveFocus}`}>
              Hover / soft focus
            </Button>
            <Button size="small" fullWidth={false} className="px-6" data-focused>
              Keyboard focus
            </Button>
            <Button size="small" fullWidth={false} className="px-6" inactive>
              Inactive
            </Button>
            <Button size="small" fullWidth={false} className="px-6" disabled>
              Disabled
            </Button>
          </div>
        </Box>
      </BusyGround>
    </Section>

    <Section
      title="Dialog surface"
      note={
        <>
          <code>dialogSurface</code> — opaque slate plus a hairline border. Used by the modal <code>Menu</code>, the{' '}
          <code>Select</code> popup, the <code>Autocomplete</code> menu, the bottom sheet, the lobby card and the
          expanded song preview. The border is what reads as the edge once the fill stops contrasting with the scrim
          behind it.
        </>
      }>
      <BusyGround>
        <div className={`rounded-xl p-4 ${dialogSurface}`}>
          <code className="text-sm">dialogSurface — {dialogSurface}</code>
        </div>
      </BusyGround>
    </Section>

    <Section
      title="Backdrop"
      note={
        <>
          The scrim behind anything that opens on top of the app. The dot screen and the 20px blur are load-bearing, not
          decoration: the video keeps playing underneath, and a flat tint alone reads as the screen dimming rather than
          as a layer opening above it. <code>bg-black/50</code> is deliberately light enough to leave that motion
          visible. Stacking is the caller&rsquo;s — pass the z-index in.
        </>
      }>
      <BusyGround className="relative overflow-hidden">
        <Backdrop className="absolute" />
        <div className={`relative z-1 rounded-xl p-4 ${dialogSurface}`}>
          <code className="text-sm">a dialog over the Backdrop</code>
        </div>
      </BusyGround>
    </Section>

    <Section
      title="Borders"
      note={
        <>
          White at low alpha, so an edge is never a colour decision. Two of these are a pair rather than two weights:{' '}
          <code>/10</code> is every resting edge, and <code>/20</code> is that same edge on hover — the song grid is
          where you see it. Solid white is a different thing entirely, and says a mic is connected.
        </>
      }>
      <Row name="border-white/10" meta="every resting edge">
        <Swatch property="border-color" className="border-white/10" />
      </Row>
      <Row name="border-white/20" meta="the hover step above it">
        <Swatch property="border-color" className="border-white/20" />
      </Row>
      <Row name="border-white" meta="a connected mic pill">
        <Swatch property="border-color" className="border-white" />
      </Row>
    </Section>
  </Page>
);

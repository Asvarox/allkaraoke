import ClassicLanding from '~/routes/landing-page/classic-landing';
import TiledLanding from '~/routes/landing-page/tiled-landing';
import useNewLandingPage from '~/routes/landing-page/use-new-landing-page';

/**
 * The `new_landing_menu` experiment's landing-page switch, and nothing else. Each side is a whole
 * screen of its own rather than a set of branches inside one: they say the same things in a
 * different order, with a different call to action per viewport, and keeping them apart means
 * neither carries conditionals for a layout it isn't.
 */
function LandingPage() {
  return useNewLandingPage() ? <TiledLanding /> : <ClassicLanding />;
}

export default LandingPage;

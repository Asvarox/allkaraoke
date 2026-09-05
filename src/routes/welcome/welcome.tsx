import ClassicMenu from '~/routes/welcome/classic-menu';
import TiledMenu from '~/routes/welcome/tiled-menu';
import useNewMainMenu from '~/routes/welcome/use-new-main-menu';

/**
 * The `new_main_menu` experiment's switch, and nothing else. Each side is a whole screen of its own
 * rather than a set of branches inside one: they lay out differently, they navigate differently (the
 * tiles need spatial arrows, the column needs up/down), and keeping them apart means neither has to
 * carry conditionals for a layout it isn't.
 */
function Welcome() {
  return useNewMainMenu() ? <TiledMenu /> : <ClassicMenu />;
}

export default Welcome;

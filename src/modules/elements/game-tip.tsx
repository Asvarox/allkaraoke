import { HTMLProps, ReactNode, useMemo } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { Kbd } from '~/modules/elements/akui/kbd';
import { randomInt } from '~/modules/utils/random-value';

const data = [
  <>
    You can follow the updates and give feedback on the game through the Facebook Page:{' '}
    <a href="https://www.facebook.com/allkaraoke.party" target="_blank" rel="noreferrer">
      <strong>fb.com/AllKaraoke.Party</strong>
    </a>
  </>,
  <>
    Start typing a name of a song in <strong>Song Selection</strong> to active Search feature
  </>,
  <>
    Narrow down songs through <strong>playlists</strong> on the right in Song Selection
  </>,
  <>
    Select <strong>Pass The Mic</strong> Game Mode to share the microphones and sing in a team
  </>,
  <>
    Your scores and <strong>stats are saved</strong> in this browser - they will be available for the next party!
  </>,
  <>
    You can remove irrelevant songs from the Song Selection in <strong>Edit Songs</strong> page
  </>,
  <>
    If the game feels a bit jaggy with low FPS, check out <strong>Settings</strong> page
  </>,
  <>
    Research shows that <strong>duet songs</strong> are that bit more fun than simple one-track ones
  </>,
  <>
    Want to sing a <strong>new song</strong>? Find UltraStar version of it and import it with
    <br />
    <strong>Convert Ultrastar .txt</strong>
  </>,
  <>
    The <strong>white pulse</strong> around selected song in Song Selection tries to match song&#39;s tempo
  </>,
  <>
    Entire game (besides add/edit song) is navigable with <strong>Keyboard</strong>
  </>,
  <>
    You can hide or show keyboard navigation help with <Kbd>H</Kbd> key
  </>,
  <>
    In Song Selection, hold <Kbd>↑</Kbd> or <Kbd>↓</Kbd> to jump to the next letter
  </>,
  <>
    Add <strong>vibrato</strong> to the notes you sing to get additional <strong>bonus points</strong>
  </>,
  <>
    You can control the game with your phone - click on the{' '}
    <strong>
      <Icon icon="ic:baseline-qr-code-2" />
      QR Code Icon
    </strong>{' '}
    on the top right and follow the instructions
  </>,
];

export const GameTip = (props: HTMLProps<HTMLHeadingElement>): ReactNode => {
  const randomValue = useMemo(() => randomInt(0, data.length - 1), []);
  // const randomValue = useMemo(() => randomInt(0, 0), []);

  return <span {...props}>{data[randomValue]}</span>;
};

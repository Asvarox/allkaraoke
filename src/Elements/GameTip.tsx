import { useRef } from 'react';
import { randomInt } from 'utils/randomValue';

const data = [
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
        Party is only getting started? Play <strong>Jukebox</strong> for the music and to see what songs are available
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
        The <strong>white pulse</strong> around selected song in Song Selection tries to match song's tempo
    </>,
    <>
        The global karaoke market has been estimated to be worth nearly <strong>$10 billion</strong>
    </>,
    <>
        Entire game (excl. song management) is navigable with <strong>Keyboard</strong>
    </>,
    <>
        You can hide or show keyboard navigation help with <kbd>H</kbd> key
    </>,
    <>
        In Song Selection, hold <kbd>↑</kbd> or <kbd>↓</kbd> to jump to the next letter
    </>,
    <>
        Add <strong>vibrato</strong> to the notes you sing to get additional <strong>bonus points</strong>
    </>,
];

interface Props {
    as?: any;
}

export const GameTip = ({ as = 'h4', ...restProps }: Props) => {
    const randomValue = useRef(randomInt(0, data.length - 1));

    const Component = as;
    return <Component {...restProps}>{data[randomValue.current]}</Component>;
};

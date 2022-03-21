import { useEffect } from 'react';
import useSound from 'use-sound';

const click = require('../click.wav');

/**
 * todo: Bug: for some reason elementList is duplicated eg.
 * ['a', 'b', 'c', 'a', 'b', 'c']
 *
 * But still works even with dynamic elements :shrugs:
 */
export default function useMenuSound<T>(deps: T) {
    const [play] = useSound(click);
    useEffect(play, [deps]);
}

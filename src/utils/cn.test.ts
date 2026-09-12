import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { cn, CUSTOM_ANIMATIONS, CUSTOM_BOX_SHADOWS, TEXT_COLOR_UTILITIES, TEXT_STROKE_UTILITIES } from './cn';

// Vitest runs with the repo root as its root, so these resolve from there.
const readRepoFile = (relativePath: string) => fs.readFileSync(path.resolve(relativePath), 'utf8');

/**
 * Every class is passed as its own array entry rather than as one space-separated literal. These
 * assertions are all about the ORDER classes are merged in, and oxfmt sorts Tailwind class strings
 * on save — written as literals, the formatter silently rewrites the inputs out from under the
 * expectations. A one-class string has nothing to sort.
 */
const merge = (...classes: string[]) => cn(classes.join(' '));

describe('cn', () => {
  describe('stock tailwind-merge behaviour is preserved', () => {
    it.each([
      [['text-default', 'text-active'], 'text-active'],
      [['text-active', 'text-default'], 'text-default'],
      [['text-danger', 'text-inactive'], 'text-inactive'],
      [['bg-black/40', 'bg-black/55'], 'bg-black/55'],
      // `md` is a custom step in the font-size scale but still parses as a t-shirt size, so it
      // conflicts with the other sizes rather than being mistaken for a colour.
      [['text-md', 'text-lg'], 'text-lg'],
      [['text-6xl', 'text-xs'], 'text-xs'],
    ])('%s -> %s', (classes, expected) => {
      expect(merge(...classes)).toBe(expected);
    });

    it('keeps a size and a colour side by side', () => {
      expect(merge('text-md', 'text-default')).toBe('text-md text-default');
    });

    it('treats a variant as a separate axis', () => {
      expect(merge('text-lg', 'max-lg:text-md')).toBe('text-lg max-lg:text-md');
    });
  });

  describe('custom utilities', () => {
    // `typography` applies `text-default`, so an explicit colour after it has to win outright
    // instead of both surviving and letting stylesheet order decide.
    it('resolves typography against an explicit text colour', () => {
      expect(merge('typography', 'text-active')).toBe('text-active');
      expect(merge('typography', 'text-inactive')).toBe('text-inactive');
      expect(merge('typography', 'text-danger')).toBe('text-danger');
    });

    it('lets typography override an earlier colour', () => {
      expect(merge('text-active', 'typography')).toBe('typography');
    });

    // `stroke-text` is `-webkit-text-stroke`, unrelated to SVG `stroke-*`.
    it('keeps stroke-text independent of SVG stroke colours', () => {
      expect(merge('stroke-text', 'stroke-black')).toBe('stroke-text stroke-black');
      expect(merge('stroke-black', 'stroke-text')).toBe('stroke-black stroke-text');
    });

    it('deduplicates stroke-text against itself', () => {
      expect(merge('stroke-text', 'stroke-text')).toBe('stroke-text');
    });

    it('resolves custom animations against each other and against stock ones', () => {
      expect(merge('animate-blink', 'animate-pulse')).toBe('animate-pulse');
      expect(merge('animate-lyrics-pop', 'animate-none')).toBe('animate-none');
      expect(merge('animate-pulse', 'animate-skeleton')).toBe('animate-skeleton');
      expect(merge('animate-blink', 'animate-lyrics-shake')).toBe('animate-lyrics-shake');
    });

    it('resolves custom box shadows against each other and against stock ones', () => {
      expect(merge('shadow-focusable', 'subtle-focus')).toBe('subtle-focus');
      expect(merge('subtle-focus', 'shadow-none')).toBe('shadow-none');
      expect(merge('shadow-lg', 'shadow-focusable')).toBe('shadow-focusable');
    });
  });

  // These lists are maintained by hand, so assert they still match what the stylesheet and the
  // tailwind config actually declare — a new `@utility` or `animation` key that nobody registers
  // here silently reintroduces the "both classes survive" bug.
  describe('registration stays in sync with the sources', () => {
    const indexCss = readRepoFile('src/index.css');
    const tailwindConfig = readRepoFile('tailwind.config.js');

    /** Keys of the `<name>: {` object literal starting at `key`, up to its closing brace. */
    const objectKeys = (key: string) => {
      const start = tailwindConfig.indexOf(key);
      expect(start, `${key} not found in tailwind.config.js`).toBeGreaterThan(-1);
      return [...tailwindConfig.slice(start, tailwindConfig.indexOf('},', start)).matchAll(/^\s+'?([\w-]+)'?:/gm)].map(
        (match) => match[1],
      );
    };

    const cssUtilities = [...indexCss.matchAll(/^@utility\s+([\w-]+)\s*\{/gm)].map((match) => match[1]);

    it('covers every animation declared in tailwind.config.js', () => {
      const configAnimations = objectKeys('animation: {');

      expect(configAnimations.length).toBeGreaterThan(0);
      expect(CUSTOM_ANIMATIONS).toEqual(expect.arrayContaining(configAnimations));
    });

    it('covers every boxShadow key declared in tailwind.config.js', () => {
      const boxShadows = objectKeys('boxShadow: {').map((name) => `shadow-${name}`);

      expect(boxShadows.length).toBeGreaterThan(0);
      expect(CUSTOM_BOX_SHADOWS).toEqual(expect.arrayContaining(boxShadows));
    });

    it('covers every custom utility declared in index.css', () => {
      const registered = new Set<string>([
        ...TEXT_COLOR_UTILITIES,
        ...TEXT_STROKE_UTILITIES,
        ...CUSTOM_BOX_SHADOWS,
        ...CUSTOM_ANIMATIONS.map((animation) => `animate-${animation}`),
      ]);

      expect(cssUtilities.length).toBeGreaterThan(0);
      expect(cssUtilities.filter((utility) => !registered.has(utility))).toEqual([]);
    });
  });
});

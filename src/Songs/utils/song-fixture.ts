import { Song } from 'interfaces';

export const mulitrack: Song = {
  id: 'multitrack',
  artist: 'E2ETest',
  artistOrigin: undefined,
  title: 'Multitrack',
  video: 'W9nZ6u15yis',
  language: 'Polish',
  year: '1994',
  gap: 1000,
  bpm: 350,
  bar: 4,
  sourceUrl: undefined,
  author: undefined,
  authorUrl: undefined,
  edition: undefined,
  genre: undefined,
  lastUpdate: undefined,
  videoGap: undefined,
  previewStart: undefined,
  previewEnd: undefined,
  volume: undefined,
  realBpm: 100,
  unsupportedProps: ['#SOMEPROP: some value', '#SOMEPROP2: some value2'],
  tracks: [
    {
      sections: [
        {
          type: 'notes',
          start: 0,
          notes: [
            {
              type: 'rapstar',
              start: 5,
              length: 10,
              pitch: 9,
              lyrics: 'Second ',
            },
            {
              type: 'rap',
              start: 20,
              length: 10,
              pitch: 10,
              lyrics: 'Third ',
            },
          ],
        },
        {
          type: 'notes',
          start: 40,
          notes: [
            {
              type: 'freestyle',
              start: 50,
              length: 10,
              pitch: 11,
              lyrics: 'Fourth ',
            },
            {
              type: 'star',
              start: 80,
              length: 5,
              pitch: 9,
              lyrics: 'Seventh ',
            },
            {
              type: 'normal',
              start: 86,
              length: 4,
              pitch: 10,
              lyrics: 'Seventh ',
            },
          ],
        },
        {
          start: 100,
          end: 120,
          type: 'pause',
        },
        {
          type: 'notes',
          start: 130,
          notes: [
            {
              type: 'normal',
              start: 140,
              length: 10,
              pitch: 10,
              lyrics: 'Eight ',
            },
          ],
        },
      ],
    },
    {
      name: 'test track 2',
      sections: [
        {
          type: 'notes',
          start: 0,
          notes: [
            {
              type: 'normal',
              start: 5,
              length: 10,
              pitch: 11,
              lyrics: 'First ',
            },
            {
              type: 'normal',
              start: 16,
              length: 9,
              pitch: 9,
              lyrics: 'Second ',
            },
            {
              type: 'normal',
              start: 30,
              length: 10,
              pitch: 10,
              lyrics: 'Third ',
            },
          ],
        },
        {
          type: 'notes',
          start: 50,
          notes: [
            {
              type: 'normal',
              start: 60,
              length: 10,
              pitch: 11,
              lyrics: 'Fourth ',
            },
            {
              type: 'normal',
              start: 75,
              length: 10,
              pitch: 12,
              lyrics: 'Fifth ',
            },
            {
              type: 'normal',
              start: 90,
              length: 10,
              pitch: 9,
              lyrics: 'Seventh ',
            },
          ],
        },
        {
          start: 110,
          end: 130,
          type: 'pause',
        },
        {
          type: 'notes',
          start: 140,
          notes: [
            {
              type: 'normal',
              start: 150,
              length: 10,
              pitch: 9,
              lyrics: 'Eight ',
            },
            {
              type: 'normal',
              start: 165,
              length: 10,
              pitch: 10,
              lyrics: 'Nine ',
            },
          ],
        },
      ],
    },
  ],
};

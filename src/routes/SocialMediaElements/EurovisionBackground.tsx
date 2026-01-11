import { colorSets } from '~/modules/GameEngine/Drawing/styles';

const WIDTH = 2500;

const EurovisionBgSvg = () => {
  const data = [
    0,
    ...new Array(21)
      .fill(0)
      .map((_, i) => Math.round(10 * (1.2 + Math.sin(i / 2.5 + 1.5))) / 10)
      .map((i) => Math.round((i / 28) * WIDTH))
      .reduce<number[]>((acc, item) => [...acc, (acc.at(-1) ?? 0) + item], []),
  ];

  const stops = [
    { offset: '0%', color: colorSets.eurovisionPink.text },
    { offset: '25%', color: colorSets.eurovisionGreen.text },
    { offset: '50%', color: colorSets.eurovisionPink.text },
    { offset: '75%', color: colorSets.eurovisionRed.text },
    { offset: '100%', color: colorSets.eurovisionPink.text },
  ];

  return (
    <svg width={WIDTH} height={WIDTH} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {Array.from({ length: 21 }, (_, i) => (
          <linearGradient
            key={i}
            id={`grad${i}`}
            x1="0%"
            x2="0%"
            y1={`${i * 2}%`}
            y2={`${i * 2 + 100}%`}
            spreadMethod="repeat">
            {stops.map((stop, index) => (
              <stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        ))}
      </defs>
      {Array.from({ length: 22 }, (_, i) => (
        <rect
          key={i}
          x={data[i]}
          y="0"
          width={(data[i + 1] ?? 501) - data[i] + 10}
          height="100%"
          fill={`url(#grad${i})`}
        />
      ))}
    </svg>
  );
};

export default EurovisionBgSvg;

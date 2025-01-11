import styled from '@emotion/styled';
import { typography } from 'modules/Elements/cssMixins';
import styles, { colorSets } from 'modules/GameEngine/Drawing/styles';

export const GameScreens = styled.div`
  :root {
    // not sure if this will be needed :shrug:
    --player-blue-text: ${colorSets.blue.text};
    --player-blue-stroke: ${colorSets.blue.stroke};
    --player-blue-star-fill: ${colorSets.blue.star.fill};
    --player-blue-star-stroke: ${colorSets.blue.star.stroke};
    --player-blue-perfect-fill: ${colorSets.blue.perfect.fill};
    --player-blue-perfect-stroke: ${colorSets.blue.perfect.stroke};
    --player-blue-starPerfect-fill: ${colorSets.blue.starPerfect.fill};
    --player-blue-starPerfect-stroke: ${colorSets.blue.starPerfect.stroke};
    --player-blue-hit-fill: ${colorSets.blue.hit.fill};
    --player-blue-hit-stroke: ${colorSets.blue.hit.stroke};
    --player-blue-miss-fill: ${colorSets.blue.miss.fill};
    --player-blue-miss-stroke: ${colorSets.blue.miss.stroke};
  }
  h1 {
    ${typography};
    margin: 0;
    text-align: center;
    font-size: 4rem;
    color: ${styles.colors.text.active};
  }

  h2 {
    ${typography};
    margin: 0;
    font-size: 2.9rem;
  }

  h3 {
    ${typography};
    margin: 0;
    font-size: 2.7rem;

    strong {
      color: ${styles.colors.text.active};
    }
  }

  h4 {
    ${typography};
    margin: 0;
    font-size: 2.2rem;
    line-height: 1.15;
  }

  h5 {
    ${typography};
    margin: 0;
    font-size: 1.6rem;
    line-height: 1.5;
  }

  h6 {
    ${typography};
    margin: 0;
    line-height: 1.5;
    font-size: 1.3rem;
  }

  hr {
    margin: 0.5rem 1rem;
    opacity: 0.25;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    button {
      ${typography};
      background: none;
      padding: 0;
      margin: 0;
      border: none;
      font-size: inherit;
      color: ${styles.colors.text.active};
      text-decoration: underline;
      cursor: pointer;
    }

    svg {
      font-size: 0.8em;
    }
  }

  strong {
    color: ${styles.colors.text.active};
  }
`;

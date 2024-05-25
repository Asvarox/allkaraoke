import { css } from '@emotion/react';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';

export default css`
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

  a {
    ${typography};
    color: ${styles.colors.text.active};
    text-decoration: underline;
  }

  strong {
    color: ${styles.colors.text.active};
  }
`;

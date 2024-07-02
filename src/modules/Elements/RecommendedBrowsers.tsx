import { styled } from '@linaria/react';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import isChromium from 'modules/utils/isChromium';

function RecommendedBrowsers() {
  return (
    <>
      {!isChromium() && (
        <RecommendChrome>
          <h2>
            This game is tested in <strong>Google Chrome</strong> and <strong>MS Edge</strong>.
          </h2>
          It's not guaranteed to work on other browsers (like the one you use now).
        </RecommendChrome>
      )}
    </>
  );
}

const RecommendChrome = styled.div`
  width: 100%;
  ${typography};
  text-align: center;
  background: darkred;
  padding: 3rem 0;
  margin-top: 1rem;
  h2 {
    margin-top: 0;
  }

  strong {
    color: ${styles.colors.text.active};
  }
`;

export default RecommendedBrowsers;

import styled from '@emotion/styled';
import { EurovisionTheme, useBackground } from 'modules/Elements/LayoutWithBackground';
import Logo from 'modules/Elements/Logo';
import { colorSets } from 'modules/GameEngine/Drawing/styles';
import LayoutGame from 'routes/LayoutGame';
import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import EurovisionBgSvg from 'routes/SocialMediaElements/EurovisionBackground';
import logo from '../../../public/logo.svg?raw';

export default function SocialMediaElements() {
  useBackground(false);

  return (
    <LayoutGame>
      <LogoContainer>
        <IconLogo dangerouslySetInnerHTML={{ __html: logo }} />
        <ESCBarsLogo>
          <EurovisionTheme />
        </ESCBarsLogo>
      </LogoContainer>
      <BackgroundPhoto>
        <ESCBarsBackground>
          <EurovisionTheme />
        </ESCBarsBackground>
        <Logo />
        {/*<ChristmasTree>🎁</ChristmasTree>*/}
        <EurovisionLogo src={eurovisionIcon} alt="Eurovision" />
      </BackgroundPhoto>
      <EurovisionBgSvg />
    </LayoutGame>
  );
}

const LogoContainer = styled.div`
  width: 400px;
  aspect-ratio: 1/1;
  position: relative;
  padding: 30px;
  //background: #222222;
`;

const ESCBarsLogo = styled.div`
  display: flex;
  position: absolute;
  inset: 0;
  z-index: -1;

  div {
    background-image: linear-gradient(
      0deg,
      ${colorSets.eurovisionViolet.text},
      ${colorSets.eurovisionBlue.text},
      ${colorSets.eurovisionYellow.text},
      ${colorSets.eurovisionBlue.text},
      ${colorSets.eurovisionViolet.text}
    );
  }
`;

const IconLogo = styled.svg`
  width: 400px;
  aspect-ratio: 1/1;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgb(0 0 0 / 0.6));

  path:nth-of-type(1) {
    fill: ${colorSets.red.text} !important;
  }
  path:nth-of-type(2) {
    fill: ${colorSets.blue.text} !important;
  }
`;

const ESCBarsBackground = styled(ESCBarsLogo)`
  div {
    background-image: linear-gradient(
      0deg,
      ${colorSets.eurovisionPink.text},
      ${colorSets.eurovisionOrange.text},
      ${colorSets.eurovisionYellow.text},
      ${colorSets.eurovisionPink.text}
    );
  }
`;

const BackgroundPhoto = styled.div`
  overflow: hidden;
  position: relative;
  height: calc(693px / 1);
  width: calc(2048px / 1);
  transform: scale(1);

  background-color: black;
  background-image: linear-gradient(
    120deg,
    ${colorSets.red.stroke},
    ${colorSets.red.hit.fill} 49.9%,
    ${colorSets.blue.hit.fill} 50.1%,
    ${colorSets.blue.stroke}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  div {
    //margin-bottom: 160px;

    //video:nth-of-type(1) {
    //  width: 800px;
    //  height: 300px;
    //  object-fit: contain;
    //}

    //img:nth-of-type(1) {
    //  transform: translate(-0px, 80px);
    //  width: 180px;
    //  height: 80px;
    //  object-fit: contain;
    //}
  }
`;

const EurovisionLogo = styled.img`
  margin-left: 4rem;
  transform: scale(1.5);
`;

const ChristmasTree = styled.span`
  //position: absolute;
  //margin: 0 0 100px 100px;
  font-size: 180px;
  transform: rotate(15deg);
`;

import { Gif } from '@remotion/gif';
import { MicIconBlue, MicIconRed } from 'modules/Elements/MicIcon';
import dotParty from 'modules/Elements/dotparty.gif';
import allKaraokeLogo from 'modules/Elements/logo.gif';
import { Fade, Move, Scale } from 'remotion-animated';
import { SAnimated } from 'videos/support/Components/common';

interface Props {}
export const Logo: React.FC<Props> = () => {
  const micStyles = {
    width: '7rem',
    height: '7rem',
  };

  return (
    <>
      <SAnimated
        absolute
        style={{
          opacity: 0,
        }}
        delay={5}
        animations={[
          Fade({ to: 1, initial: 0, duration: 20 }),
          Scale({ by: 1, initial: 0, duration: 20 }),
          Move({ x: -380, start: 20 }),
        ]}>
        <MicIconRed style={micStyles} />
      </SAnimated>
      <SAnimated
        absolute
        animations={[
          Fade({ to: 1, initial: 0, duration: 20 }),
          Scale({ by: 1, initial: 0, duration: 20 }),
          Move({ x: -340, y: 20, start: 25 }),
        ]}>
        <MicIconBlue style={{ ...micStyles, transform: 'scaleX(-1)', top: '20rem' }} />
      </SAnimated>
      <SAnimated
        absolute
        style={{ opacity: 0 }}
        animations={[Fade({ to: 1, initial: 0, duration: 30, start: 30 }), Move({ x: 120, initialX: 500, start: 30 })]}>
        <Gif
          src={allKaraokeLogo}
          width={650}
          height={650}
          fit="contain"
          // style={{ transform: 'translate(0, -20px)' }}
        />
      </SAnimated>
      <SAnimated
        absolute
        style={{ opacity: 0 }}
        animations={[Fade({ to: 1, initial: 0, duration: 30, start: 35 }), Move({ x: 150, initialX: 500, start: 35 })]}>
        <Gif src={dotParty} width={140} height={650} fit="contain" style={{ transform: 'translate(240px, 60px)' }} />
      </SAnimated>
    </>
  );
};

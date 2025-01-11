import { BackgroundContext } from 'modules/Elements/LayoutWithBackground';
import { MicIconBlue, MicIconRed } from 'modules/Elements/MicIcon';
import { HTMLProps, useContext } from 'react';
import { twc } from 'react-twc';

export default function LogoIcon(props: HTMLProps<HTMLDivElement>) {
  const { theme } = useContext(BackgroundContext);
  return (
    <StyledLogo {...props}>
      <Mic1 asChild>
        <MicIconRed christmas={theme === 'christmas'} />
      </Mic1>
      <Mic2 asChild>
        <MicIconBlue christmas={theme === 'christmas'} />
      </Mic2>
    </StyledLogo>
  );
}

const StyledLogo = twc.div`relative transition-[300ms] [&_svg]:w-[15rem] [&_svg]:h-[15rem]`;

const Mic1 = twc.svg`w-[15rem] h-[15rem] transition-[300ms]`;
const Mic2 = twc(Mic1)`absolute top-[1.6rem] left-[3.5rem] z-[100] scale-x-[-1]`;

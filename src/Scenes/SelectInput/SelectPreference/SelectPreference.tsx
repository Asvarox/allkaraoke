import { MenuButton } from 'Elements/Menu';
import styled from '@emotion/styled';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { css } from '@emotion/react';
import { focused } from 'Elements/cssMixins';
import { PhoneAndroid, PhoneIphone, PhotoCamera, QrCode, Usb } from '@mui/icons-material';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { SvgIcon } from '@mui/material';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';

interface Props {
    onPreferenceSelected: (preference: typeof MicSetupPreference[number]) => void;
}

function SelectPreference({ onPreferenceSelected }: Props) {
    const { register } = useKeyboardNav();
    return (
        <>
            <Option {...register('remoteMics', () => onPreferenceSelected('remoteMics'))} data-test="remote-mics">
                <OptionIconContainer>
                    <PhoneAndroid />
                    <PhoneIphone />
                </OptionIconContainer>
                <div>
                    Use Smartphones as microphones
                    <OptionDescription>
                        Use{' '}
                        <strong>
                            <PhotoCamera />
                            Camera app
                        </strong>{' '}
                        to scan a{' '}
                        <strong>
                            <QrCode /> QR code
                        </strong>{' '}
                        that will open Remote Mic website - no need to download an app!
                    </OptionDescription>
                </div>
            </Option>
            <Option {...register('mics', () => onPreferenceSelected('mics'))} data-test="mics">
                <OptionIconContainer>
                    <MicIcon />
                    <MicIcon />
                </OptionIconContainer>
                <div>
                    I have SingStar (-like) microphones
                    <OptionDescription>
                        Select this option and <Usb /> connect your Mics to the computer. It should be selected{' '}
                        <strong>automatically</strong>.
                    </OptionDescription>
                </div>
            </Option>
            <Option {...register('advanced', () => onPreferenceSelected('advanced'))} data-test="advanced">
                <OptionIconContainer>
                    <MicIcon />
                    <PhoneIphone />
                </OptionIconContainer>
                <div>
                    Advanced (manual) setup
                    <OptionDescription>
                        Assign the specific device to a player manually, e.g. if you don't have regular SingStar
                        microphones.
                    </OptionDescription>
                </div>
            </Option>
            <MenuButton {...register('skip', () => onPreferenceSelected('skip'))} data-test="skip">
                Skip
            </MenuButton>
        </>
    );
}

const MicIcon = () => (
    <SvgIcon viewBox="0 0 512 512">
        <path
            xmlns="http://www.w3.org/2000/svg"
            d="M252.529,162.029l168.125,210.156c-12.313,1.25-24.031,6.438-33.031,15.438s-14.188,20.719-15.438,33.031L162.029,252.545  c-3.563-24.922,4.813-50.078,22.625-67.891C202.467,166.857,227.623,158.467,252.529,162.029z M398.936,398.936  c-9.063,9.063-13.031,22.063-10.625,34.656l45.281,45.25c12.5,12.5,32.75,12.5,45.25,0s12.5-32.75,0-45.25l-45.25-45.281  C420.998,385.904,407.998,389.873,398.936,398.936z M162.029,162.029c18.594-18.594,43.188-29.891,68.969-32.297  c-3.375-24.563-14.906-49.391-35.031-69.516c-43.75-43.75-109.594-48.813-147.063-11.313  c-37.5,37.484-32.438,103.328,11.313,147.078c20.125,20.125,44.938,31.656,69.5,35.031  C132.154,205.217,143.436,180.623,162.029,162.029z"
        />
    </SvgIcon>
);

const OptionDescription = styled.div<{ focused?: boolean }>`
    padding: 0 0 0 1em;
    font-size: 0.65em;
    max-height: 0;
    overflow: clip;
    transition: 300ms;

    svg {
        font-size: 0.85em;
        //padding-top: 3px;
    }
    opacity: 0;
`;

const OptionIconContainer = styled.div`
    position: relative;
    margin: 0em 0.25em 0 1em;
    transition: 300ms;

    svg {
        transition: 300ms;
        width: 1.5em;
        height: 1.5em;
        color: rgba(${styles.colors.players[1].text});
    }

    svg:first-of-type {
        top: 0.25em;
        left: 0.5em;
        position: absolute;
        color: rgba(${styles.colors.players[0].text});
        z-index: 100;
        transform: scaleX(-1);
    }
`;

const Option = styled(MenuButton)<{ focused?: boolean }>`
    display: flex;
    align-items: center;

    ${(props) =>
        props.focused
            ? css`
                  height: 200px;
                  background: black;
                  ${focused};

                  ${OptionDescription} {
                      padding-top: 1em;
                      max-height: 100px;
                      opacity: 1;
                  }

                  ${OptionIconContainer} {
                      transform: scale(1.75);
                  }
              `
            : ''}
`;

export default SelectPreference;

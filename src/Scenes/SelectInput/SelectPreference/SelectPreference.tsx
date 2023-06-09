import { MenuButton } from 'Elements/Menu';
import styled from '@emotion/styled';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { css } from '@emotion/react';
import { focused } from 'Elements/cssMixins';
import { Laptop, Person, PhoneAndroid, PhoneIphone, PhotoCamera, QrCode, Usb } from '@mui/icons-material';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { MicIconBlue, MicIconRed } from 'Elements/MicIcon';

interface Props {
    onPreferenceSelected: (preference: (typeof MicSetupPreference)[number]) => void;
    previouslySelected: string | null;
    skipText?: string;
    onBack?: () => void;
}

function SelectPreference({ onPreferenceSelected, previouslySelected, onBack, skipText }: Props) {
    const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

    const { register } = useKeyboardNav({ onBackspace: onBack });
    return (
        <>
            <Option
                {...register(
                    'remoteMics',
                    () => onPreferenceSelected('remoteMics'),
                    undefined,
                    previouslySelected === 'remoteMics',
                )}
                data-test="remote-mics">
                <OptionIconContainer>
                    <PhoneAndroid />
                    <PhoneIphone />
                </OptionIconContainer>
                <div>
                    {mobilePhoneMode ? 'Connect other phones' : 'Use Smartphones'}
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
            <Option
                {...register(
                    'built-in',
                    () => onPreferenceSelected('built-in'),
                    undefined,
                    previouslySelected === 'built-in',
                )}
                data-test="built-in">
                <OptionIconContainer>
                    <Person />
                    {mobilePhoneMode ? <PhoneIphone /> : <Laptop />}
                </OptionIconContainer>
                <div>
                    This {mobilePhoneMode ? "device's" : "computer's"} microphone
                    <OptionDescription>
                        Great to <strong>test</strong> the app, <strong>sing alone</strong> or don't care about the
                        rivalry at the party
                    </OptionDescription>
                </div>
            </Option>
            <hr />
            {!mobilePhoneMode && (
                <Option
                    {...register('mics', () => onPreferenceSelected('mics'), undefined, previouslySelected === 'mics')}
                    data-test="mics">
                    <OptionIconContainer>
                        <MicIconBlue />
                        <MicIconRed />
                    </OptionIconContainer>
                    <div>
                        SingStar (-ish) microphones
                        <OptionDescription>
                            Select this option and <Usb /> connect your Mics to the computer. It should be selected{' '}
                            <strong>automatically</strong>.
                        </OptionDescription>
                    </div>
                </Option>
            )}
            <Option
                {...register(
                    'advanced',
                    () => onPreferenceSelected('advanced'),
                    undefined,
                    previouslySelected === 'advanced',
                )}
                data-test="advanced">
                <OptionIconContainer>
                    <MicIconBlue />
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
            <hr />
            <MenuButton
                {...register('skip', () => onPreferenceSelected('skip'), undefined, previouslySelected === 'skip')}
                data-test="skip">
                {skipText || 'Skip'}
            </MenuButton>
        </>
    );
}

const OptionDescription = styled.div<{ focused?: boolean }>`
    padding: 0 0 0 2.5rem;
    font-size: 1.6rem;
    max-height: 0;
    overflow: clip;
    transition: 300ms;

    svg {
        font-size: 1.4rem;
    }
    opacity: 0;
`;

const OptionIconContainer = styled.div`
    position: relative;
    margin: 0rem 0.6rem 0 2.5rem;
    transition: 300ms;

    svg {
        transition: 300ms;
        width: 3.6rem;
        height: 3.6rem;
        color: rgba(${styles.colors.players[1].text});
    }

    svg:first-of-type {
        top: 0.6rem;
        left: 1.25rem;
        position: absolute;
        color: rgba(${styles.colors.players[0].text});
        z-index: 100;
        transform: scaleX(-1);
    }
`;

const moreInfoMixin = css`
    height: 16.5rem;
    background: black;
    ${focused};

    ${OptionDescription} {
        padding-top: 1.6rem;
        max-height: 10rem;
        opacity: 1;
    }

    ${OptionIconContainer} {
        transform: scale(1.75);
    }
`;

const Option = styled(MenuButton)<{ focused?: boolean }>`
    display: flex;
    align-items: center;

    :hover {
        ${moreInfoMixin};
    }

    ${(props) => (props.focused ? moreInfoMixin : '')};
`;

export default SelectPreference;

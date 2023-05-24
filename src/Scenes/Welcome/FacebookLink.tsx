import styled from '@emotion/styled';
import { MenuContainer } from 'Elements/Menu';
import { useCallback, useState } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { css } from '@emotion/react';

const FBEmbedCode = (width: number, height: number) => `
<iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fallkaraoke.party&show_posts=true&width=${width}&height=${height}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId=530120230391395" width="${width}" height="${height}" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
`;

function FacebookLink() {
    const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

    const [width, setWidth] = useState(200);
    const fbRef = useCallback((node: HTMLHeadingElement) => {
        setWidth(Math.round(node?.getBoundingClientRect().width) ?? 200);
    }, []);

    return (
        <Container small={!!mobilePhoneMode}>
            <h2 ref={fbRef}>
                Like the{' '}
                <a href="https://www.facebook.com/allkaraoke.party" target="_blank" rel="noreferrer">
                    <strong>Facebook Page</strong>
                </a>
            </h2>
            <div
                dangerouslySetInnerHTML={{ __html: FBEmbedCode(350, 350) }}
                style={{
                    height: 350 * (width / 350),
                    width: '100%',
                    transformOrigin: 'left top',
                    transform: `scale(${width / 350})`,
                }}
            />
            <h3>Get updates, and help by suggesting features and reporting bugs.</h3>
            {/*<QRCodeSVG*/}
            {/*    value="https://www.facebook.com/allkaraoke.party"*/}
            {/*    includeMargin*/}
            {/*    style={{ flex: 1, width: '100%' }}*/}
            {/*/>*/}
        </Container>
    );
}

const Container = styled(MenuContainer)<{ small: boolean }>`
    position: absolute;
    right: 10rem;
    width: 37rem;
    margin: 0;
    text-decoration: none;
    text-align: justify;
    ${(props) =>
        props.small &&
        css`
            width: 25rem;
            right: 1rem;

            h2 {
                font-size: 1.5rem;
            }
            h3 {
                font-size: 1.25rem;
            }
        `}

    view-transition-name: fb-notification;
`;

export default FacebookLink;

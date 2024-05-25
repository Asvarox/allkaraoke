import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { MenuContainer } from 'modules/Elements/Menu';
import { useCallback, useEffect, useState } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

const FBEmbedCode = (width: number, height: number) => {
  const settings = {
    show_posts: true,
    width,
    height,
    small_header: true,
    adapt_container_width: true,
    hide_cover: false,
    show_facepile: false,
    // tabs: 'timeline',
    appId: 530120230391395,
  };

  const qs = Object.entries(settings)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&');
  return `
<iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fallkaraoke.party&${qs}" width="${width}" height="${height}" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
`;
};
function FacebookLink() {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  const [show, setShow] = useState(false);
  const [width, setWidth] = useState(200);
  const fbRef = useCallback((node: HTMLDivElement) => {
    setWidth(Math.round(node?.getBoundingClientRect().width) ?? 200);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 750);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Container small={!!mobilePhoneMode} show={show}>
      <div
        dangerouslySetInnerHTML={{ __html: FBEmbedCode(350, 750) }}
        style={{
          height: 750 * (width / 350),
          width: '100%',
          transformOrigin: 'left top',
          transform: `scale(${width / 350})`,
        }}
      />
      <h5 ref={fbRef}>Get updates, and help by suggesting features and reporting bugs.</h5>
    </Container>
  );
}

const Container = styled(MenuContainer)<{ small: boolean; show: boolean }>`
  transition: 1000ms;
  opacity: ${(props) => (props.show ? 1 : 0)};
  position: absolute;
  top: 2rem;
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
      h5 {
        font-size: 1.15rem;
      }
    `}

  view-transition-name: fb-notification;
`;

export default FacebookLink;

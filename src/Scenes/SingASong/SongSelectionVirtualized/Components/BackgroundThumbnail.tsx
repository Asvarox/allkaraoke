import styled from '@emotion/styled';
import { useLayoutEffect, useState } from 'react';
import { usePreviousDistinct } from 'react-use';
import { GraphicSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

function Tile({ videoId, ...props }: Props) {
  return (
    <Image
      src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
      alt={`Thumbnail image for YouTube video ${videoId}`}
      {...props}
    />
  );
}

interface Props {
  videoId: string;
}
function BackgroundThumbnail({ videoId, ...props }: Props) {
  const previousVideoId = usePreviousDistinct(videoId) ?? videoId;
  const [visible, setVisible] = useState(true);
  useLayoutEffect(() => {
    setVisible((current) => !current);
  }, [videoId]);
  const [graphicSettings] = useSettingValue(GraphicSetting);

  if (graphicSettings === 'low') {
    return null;
  }

  return (
    <Container {...props}>
      <TileAnimated videoId={visible ? videoId : previousVideoId} visible={visible} />
      <TileAnimated videoId={visible ? previousVideoId : videoId} visible={!visible} />
      <BaseTile videoId={previousVideoId} />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  overflow: hidden;
  background: black;
`;

const BaseTile = styled(Tile)`
  visibility: hidden;
`;
const TileAnimated = styled(Tile)<{ visible: boolean }>`
  position: absolute;
  transition: opacity 300ms;
  opacity: ${(props) => (props.visible ? 1 : 0)};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default BackgroundThumbnail;

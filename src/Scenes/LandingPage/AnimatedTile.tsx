import styled from '@emotion/styled';
import { useLayoutEffect, useState } from 'react';
import { usePreviousDistinct } from 'react-use';

function Tile({ videoId, ...props }: Props) {
  const imageUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
  return (
    <>
      <Image src={imageUrl} alt={`Thumbnail image for YouTube video ${videoId}`} {...props} />
    </>
  );
}

interface Props {
  videoId: string;
}
function AnimatedTile({ videoId, ...props }: Props) {
  const previousVideoId = usePreviousDistinct(videoId) ?? videoId;
  const [visible, setVisible] = useState(true);
  useLayoutEffect(() => {
    setVisible((current) => !current);
  }, [videoId]);

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
  transition: opacity 1s;
  opacity: ${(props) => (props.visible ? 1 : 0)};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.5);
`;

export default AnimatedTile;

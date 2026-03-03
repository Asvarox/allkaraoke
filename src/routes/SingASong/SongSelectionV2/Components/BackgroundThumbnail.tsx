import { ComponentProps, useLayoutEffect, useState } from 'react';
import { usePreviousDistinct } from 'react-use';
import { GraphicSetting, useSettingValue } from '~/routes/Settings/SettingsState';

interface TileProps {
  videoId: string;
  className?: string;
}

interface Props extends ComponentProps<'div'> {
  videoId: string;
}

function Tile({ videoId, className }: TileProps) {
  return (
    <img
      src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
      alt={`Thumbnail image for YouTube video ${videoId}`}
      className={`h-full w-full object-cover${className ? ` ${className}` : ''}`}
    />
  );
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
    <div className="relative overflow-hidden bg-black" {...props}>
      <Tile
        videoId={visible ? videoId : previousVideoId}
        className={`absolute transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <Tile
        videoId={visible ? previousVideoId : videoId}
        className={`absolute transition-opacity duration-300 ${!visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <Tile videoId={previousVideoId} className="invisible" />
    </div>
  );
}

export default BackgroundThumbnail;

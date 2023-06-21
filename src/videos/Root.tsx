import { Composition } from 'remotion';
import { getUpdateVideoLength, UpdateVideo } from 'videos/UpdateVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="UpdateVideo"
                component={UpdateVideo}
                durationInFrames={getUpdateVideoLength()}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};

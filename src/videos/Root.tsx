import { Composition } from 'remotion';
import { UpdateVideo } from 'videos/UpdateVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="UpdateVideo"
                component={UpdateVideo}
                durationInFrames={1105}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};

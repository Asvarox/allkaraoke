import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

interface Props {
    photos: string[];
}

const PHOTO_TIME = 2500;

function CameraRoll({ photos, ...props }: Props) {
    const [index, setIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fadeoutInterval = setInterval(() => {
            setIsLoaded(false);
        }, PHOTO_TIME);
        let photoChangeInterval: ReturnType<typeof setInterval>;
        const photoChangeTimeout = setTimeout(() => {
            photoChangeInterval = setInterval(() => {
                setIndex((current) => (current + 1) % photos.length);
            }, PHOTO_TIME);
        }, 100);

        return () => {
            clearTimeout(photoChangeTimeout);
            clearInterval(fadeoutInterval);
            if (photoChangeInterval) {
                clearInterval(photoChangeInterval);
            }
        };
    }, [photos]);

    if (photos.length === 0) {
        return null;
    }

    return (
        <Container {...props}>
            <Photo src={photos[index]} onLoad={() => setIsLoaded(true)} isLoaded={isLoaded} timeMs={PHOTO_TIME} />
        </Container>
    );
}

const Container = styled.div`
    background: white;
    width: 80rem;
    height: 60rem;
`;

const Photo = styled.img<{ isLoaded: boolean; timeMs: number }>`
    object-fit: cover;
    width: 100%;
    height: 100%;
    transition: 150ms;
    opacity: ${(props) => (props.isLoaded ? 1 : 0)};
`;

export default CameraRoll;

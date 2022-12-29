import userMediaService from 'UserMedia/userMediaService';
import { useEffect, useState } from 'react';

export const useMicrophoneStatus = () => {
    const [status, setStatus] = useState(userMediaService.getStatus());

    useEffect(() => userMediaService.addListener(setStatus), []);

    return status;
};

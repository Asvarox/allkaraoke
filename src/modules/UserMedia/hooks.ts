import { useEffect, useState } from 'react';
import userMediaService from '~/modules/UserMedia/userMediaService';

export const useMicrophoneStatus = () => {
  const [status, setStatus] = useState(userMediaService.getStatus());

  useEffect(() => userMediaService.addListener(setStatus), []);

  return status;
};

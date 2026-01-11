import { Calibration } from '~/modules/Calibration/Calibration';
import MenuWithLogo from '~/modules/Elements/MenuWithLogo';
import useSmoothNavigate from '~/modules/hooks/useSmoothNavigate';

export const CalibrationSettings = () => {
  const navigate = useSmoothNavigate();
  return (
    <MenuWithLogo>
      <Calibration onSave={() => navigate('settings/')} />
    </MenuWithLogo>
  );
};

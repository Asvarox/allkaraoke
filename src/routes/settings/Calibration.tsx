import { Calibration } from '~/modules/calibration/calibration';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';

export const CalibrationSettings = () => {
  const navigate = useSmoothNavigate();
  return (
    <MenuWithLogo>
      <Calibration onSave={() => navigate('settings/')} />
    </MenuWithLogo>
  );
};

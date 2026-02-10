import clsx from 'clsx';
import { useEffect, useState } from 'react';
import LogoIcon from '~/routes/LandingPage/LogoIcon';

export default function PageLoader() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className={clsx(
        'fixed inset-0 flex items-center justify-center transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0',
      )}>
      <div className="[&_svg]:animate-logo-pulse -translate-x-4 -translate-y-2 scale-200 transform [&_svg:first-of-type]:[animation-delay:1000ms]">
        <LogoIcon />
      </div>
    </div>
  );
}

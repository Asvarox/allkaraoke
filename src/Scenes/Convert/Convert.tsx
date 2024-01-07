import PageLoader from 'Elements/PageLoader';
import { ComponentProps, lazy, Suspense } from 'react';

const LazyConvert = lazy(() => import('./ConvertView'));

const Convert = (props: ComponentProps<typeof LazyConvert>) => (
  <Suspense fallback={<PageLoader />}>
    <LazyConvert {...props} />
  </Suspense>
);

export default Convert;

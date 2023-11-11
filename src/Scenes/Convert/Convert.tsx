import Loader from 'Elements/Loader';
import { ComponentProps, lazy, Suspense } from 'react';

const LazyConvert = lazy(() => import('./ConvertView'));

const Convert = (props: ComponentProps<typeof LazyConvert>) => (
  <Suspense fallback={<Loader />}>
    <LazyConvert {...props} />
  </Suspense>
);

export default Convert;

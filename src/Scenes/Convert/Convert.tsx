import PageLoader from 'Elements/PageLoader';
import { ComponentProps, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

const LazyConvert = lazy(() => import('./ConvertView'));

const Convert = (props: ComponentProps<typeof LazyConvert>) => (
  <Suspense fallback={<PageLoader />}>
    <Helmet>
      <title>Convert Song | AllKaraoke.Party - Free Online Karaoke Party Game</title>
    </Helmet>
    <LazyConvert {...props} />
  </Suspense>
);

export default Convert;

import { Paper } from '@mui/material';
import { ComponentProps, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import PageLoader from '~/modules/elements/page-loader';

export const LazyConvert = lazy(() =>
  import('~/routes/manage-songs/song-management').then((modules) => {
    return { default: modules.Convert };
  }),
);

const Convert = (props: ComponentProps<typeof LazyConvert>) => (
  <Suspense fallback={<PageLoader />}>
    <Helmet>
      <title>Convert Song | AllKaraoke.Party - Free Online Karaoke Party Game</title>
    </Helmet>
    <Paper elevation={2} sx={{ minHeight: '100vh', maxWidth: '1260px', margin: '0 auto' }} className="md:pt-8">
      <LazyConvert {...props} />
    </Paper>
  </Suspense>
);

export default Convert;

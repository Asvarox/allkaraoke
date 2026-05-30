import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import isChromium from '~/modules/utils/is-chromium';

function RecommendedBrowsers() {
  return (
    <>
      {!isChromium() && (
        <Box className="w-full rounded-none bg-red-900 py-12 text-center">
          <Typography className="text-lg">
            This game is tested in <strong>Google Chrome</strong> and <strong>MS Edge</strong>.
          </Typography>
          <Typography>It&#39;s not guaranteed to work on other browsers (like the one you use now).</Typography>
        </Box>
      )}
    </>
  );
}

export default RecommendedBrowsers;

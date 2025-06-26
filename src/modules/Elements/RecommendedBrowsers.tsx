import Box from 'modules/Elements/AKUI/Primitives/Box';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import isChromium from 'modules/utils/isChromium';

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

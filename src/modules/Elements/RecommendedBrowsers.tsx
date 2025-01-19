import Box from 'modules/Elements/AKUI/Primitives/Box';
import Text from 'modules/Elements/AKUI/Primitives/Text';
import isChromium from 'modules/utils/isChromium';

function RecommendedBrowsers() {
  return (
    <>
      {!isChromium() && (
        <Box className="w-full rounded-none bg-red-900 py-12 text-center">
          <Text className="text-lg">
            This game is tested in <strong>Google Chrome</strong> and <strong>MS Edge</strong>.
          </Text>
          <Text>It&#39;s not guaranteed to work on other browsers (like the one you use now).</Text>
        </Box>
      )}
    </>
  );
}

export default RecommendedBrowsers;

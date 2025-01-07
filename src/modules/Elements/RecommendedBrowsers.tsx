import Box from 'modules/Elements/AKUI/Primitives/Box';
import Text from 'modules/Elements/AKUI/Primitives/Text';
import isChromium from 'modules/utils/isChromium';

function RecommendedBrowsers() {
  return (
    <>
      {!isChromium() && (
        <Box className="w-full py-12 bg-red-900 text-center rounded-none">
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

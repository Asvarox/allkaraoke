import { registerRoot } from 'remotion';
import { RemotionRoot } from 'videos/Root';
import { loadFont } from '@remotion/google-fonts/Roboto';
import 'index.css';

const { fontFamily } = loadFont();

registerRoot(RemotionRoot);

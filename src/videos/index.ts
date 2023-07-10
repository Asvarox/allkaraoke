import { loadFont } from '@remotion/google-fonts/Roboto';
import 'index.css';
import { registerRoot } from 'remotion';
import { RemotionRoot } from 'videos/Root';

const { fontFamily } = loadFont();

registerRoot(RemotionRoot);

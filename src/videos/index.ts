import { loadFont } from '@remotion/google-fonts/Roboto';
import { registerRoot } from 'remotion';
import '~/index.css';
import { RemotionRoot } from '~/videos/Root';

loadFont();

registerRoot(RemotionRoot);

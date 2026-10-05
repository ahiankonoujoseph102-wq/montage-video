import {Composition} from 'remotion';
import {Clip} from './Clip';

export const Root: React.FC = () => (
  <Composition
    id="Clip"
    component={Clip}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
  />
);

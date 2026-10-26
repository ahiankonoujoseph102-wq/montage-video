import './commun/polices';
import {Composition} from 'remotion';
import {LogoCoin} from './commun/LogoCoin';
import {SousTitre} from './commun/SousTitre';
import {FORMAT, Pose} from './theme';
import {Scene2D} from './v2d/Scene2D';
import {etatDePose} from './v2d/Double2D';
import {DUREE_EP02, Episode02} from './episodes/ep02/Episode02';
import {DUREE_TALKAMI, Talkami} from './talkami/Talkami';

type ApercuProps = {pose: Pose; sousTitres: boolean};

const SOUS_TITRE_APERCU = [{texte: 'F comme'}, {texte: 'Format', cle: 'or' as const}];

// Image fixe pour valider le personnage et le décor avant l'animation.
const Apercu: React.FC<ApercuProps> = ({pose, sousTitres}) => (
  <Scene2D etat={etatDePose(pose)}>
    <LogoCoin />
    {sousTitres ? <SousTitre mots={SOUS_TITRE_APERCU} /> : null}
  </Scene2D>
);

const poseDefaut: Pose = {expression: 'neutre', geste: 'repos', bouche: 0};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Apercu"
      component={Apercu}
      durationInFrames={1}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
      defaultProps={{pose: poseDefaut, sousTitres: false}}
    />
    <Composition
      id="Episode02"
      component={Episode02}
      durationInFrames={DUREE_EP02}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
    />
    <Composition
      id="Talkami"
      component={Talkami}
      durationInFrames={DUREE_TALKAMI}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
    />
  </>
);

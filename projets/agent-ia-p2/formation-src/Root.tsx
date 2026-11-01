import './commun/polices';
import {Composition} from 'remotion';
import {LogoCoin} from './commun/LogoCoin';
import {SousTitre} from './commun/SousTitre';
import {FORMAT, Pose} from './theme';
import {Scene2D} from './v2d/Scene2D';
import {etatDePose} from './v2d/Double2D';
import {DUREE_EP01, Episode01} from './episodes/ep01/Episode01';
import {DUREE_EP02, Episode02} from './episodes/ep02/Episode02';
import {DUREE_EP03, Episode03} from './episodes/ep03/Episode03';
import {DUREE_EP04, Episode04} from './episodes/ep04/Episode04';
import {DUREE_PUB2, Pub2} from './pub2/Pub2';
import {DemoModuleE} from './formation/DemoModuleE';
import {dureeFormation, Formation} from './formation/Formation';
import {DUREE_TEST, HAUTEUR, LARGEUR, TestAvatar} from './formation/TestAvatar';
import {dureeEssai, Essai} from './formation/Essai';
import {dureeFormation2, Formation2} from './formation/Formation2';
import {dureeEssaiP2, EssaiP2} from './formation/p2/EssaiP2';
import {dureeP2A, FormationP2A} from './formation/p2/P2A';
import {dureeP2B, FormationP2B} from './formation/p2/P2B';
import {dureeP2C, FormationP2C} from './formation/p2/P2C';
import {dureeP2D, FormationP2D} from './formation/p2/P2D';
import {ApercuPatricia, ComparaisonDoubles, PlanchePatricia} from './apercus/ApercuPatricia';

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
    <Composition id="EssaiV2" component={Essai} durationInFrames={dureeEssai} fps={30} width={1920} height={1080} />
    <Composition id="EssaiP2" component={EssaiP2} durationInFrames={dureeEssaiP2} fps={30} width={1920} height={1080} />
    <Composition id="FormationP2A" component={FormationP2A} durationInFrames={dureeP2A} fps={30} width={1920} height={1080} />
    <Composition id="FormationP2B" component={FormationP2B} durationInFrames={dureeP2B} fps={30} width={1920} height={1080} />
    <Composition id="FormationP2C" component={FormationP2C} durationInFrames={dureeP2C} fps={30} width={1920} height={1080} />
    <Composition id="FormationP2D" component={FormationP2D} durationInFrames={dureeP2D} fps={30} width={1920} height={1080} />
    <Composition id="Formation2A" component={Formation2} durationInFrames={dureeFormation2('2A')} fps={30} width={1920} height={1080} defaultProps={{video: '2A' as const}} />
    <Composition id="Formation2B" component={Formation2} durationInFrames={dureeFormation2('2B')} fps={30} width={1920} height={1080} defaultProps={{video: '2B' as const}} />
    <Composition id="Formation1A" component={Formation} durationInFrames={dureeFormation('1A')} fps={30} width={1920} height={1080} defaultProps={{video: '1A' as const}} />
    <Composition id="Formation1B" component={Formation} durationInFrames={dureeFormation('1B')} fps={30} width={1920} height={1080} defaultProps={{video: '1B' as const}} />
    <Composition id="DemoModuleE" component={DemoModuleE} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{etape: 1 as const}} />
    <Composition id="FormationTestAvatar" component={TestAvatar} durationInFrames={DUREE_TEST} fps={30} width={LARGEUR} height={HAUTEUR} />
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
      id="ApercuPatricia"
      component={ApercuPatricia}
      durationInFrames={1}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
      defaultProps={{pose: {expression: 'neutre', geste: 'repos', bouche: 0} as Pose, cadre: 'moyen' as const}}
    />
    <Composition id="ComparaisonDoubles" component={ComparaisonDoubles} durationInFrames={1} fps={FORMAT.fps} width={2160} height={FORMAT.hauteur} />
    <Composition id="PlanchePatricia" component={PlanchePatricia} durationInFrames={1} fps={FORMAT.fps} width={FORMAT.largeur} height={FORMAT.hauteur} />
    <Composition
      id="Episode01"
      component={Episode01}
      durationInFrames={DUREE_EP01}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
    />
    <Composition
      id="Episode02"
      component={Episode02}
      durationInFrames={DUREE_EP02}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
    />
    <Composition id="Episode04" component={Episode04} durationInFrames={DUREE_EP04} fps={FORMAT.fps} width={FORMAT.largeur} height={FORMAT.hauteur} />
    <Composition id="PubFormation2" component={Pub2} defaultProps={{piste: 'tout' as const}} durationInFrames={DUREE_PUB2} fps={FORMAT.fps} width={FORMAT.largeur} height={FORMAT.hauteur} />
    <Composition
      id="Episode03"
      component={Episode03}
      durationInFrames={DUREE_EP03}
      fps={FORMAT.fps}
      width={FORMAT.largeur}
      height={FORMAT.hauteur}
    />
  </>
);

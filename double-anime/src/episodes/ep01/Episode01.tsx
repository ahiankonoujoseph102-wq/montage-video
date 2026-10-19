import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble} from '../../commun/animationDouble';
import {CartonFin, DUREE_CARTON_FIN} from '../../commun/CartonFin';
import {LogoCoin} from '../../commun/LogoCoin';
import {blocsSousTitres, SousTitresVoix} from '../../commun/SousTitresVoix';
import {Effets, EvenementSonore, volumeMusique} from '../../commun/sons';
import {TitreSurimpression} from '../../commun/TitreSurimpression';
import {COULEURS, FORMAT} from '../../theme';
import {Scene2D} from '../../v2d/Scene2D';
import bouche from './bouche.json';
import visemes from './visemes.json';
import {EcranEp01} from './EcranEp01';
import {
  APPARITION_CASES, DEMANDE_BANALE, EXPRESSIONS, FIN_VOIX, GESTES, LETTRES, LIAISONS, MOMENTS, MOTS, MOTS_CLES, PHASES, RAPPEL, RASSEMBLEMENT,
} from './scenario';

// Épisode 1 : la vidéo commence directement sur le personnage qui parle (titre
// en surimpression 2 s), puis carton de fin. Le temps de la vidéo est celui de la voix.
const DEBUT_FIN = FIN_VOIX;
export const DUREE_EP01 = Math.ceil((DEBUT_FIN + DUREE_CARTON_FIN) * FORMAT.fps);

const BLOCS = blocsSousTitres(MOTS, MOTS_CLES, LIAISONS);
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;

const clavier = (mots: typeof DEMANDE_BANALE): EvenementSonore[] =>
  mots.flatMap((m, i) => {
    const n = Math.max(1, Math.round(m.texte.length / 2.5));
    return Array.from({length: n}, (_, k) => ({t: m.debut + ((m.fin - m.debut) * k) / n, son: 'clic' as const, volume: 0.16 + ((i + k) % 3) * 0.03}));
  });

const EVENEMENTS: EvenementSonore[] = [
  ...clavier(DEMANDE_BANALE),
  {t: MOMENTS.envoi, son: 'pop', volume: 0.35},
  {t: MOMENTS.croix, son: 'erreur', volume: 0.42},
  {t: PHASES.formule, son: 'souffle', volume: 0.3},
  ...APPARITION_CASES.map((t) => ({t, son: 'pop' as const, volume: 0.32})),
  ...LETTRES.flatMap((l) => [{t: l.annonce, son: 'lettre' as const, volume: 0.3}, ...clavier(l.citation)]),
  {t: PHASES.pub, son: 'souffle', volume: 0.3},
  {t: MOMENTS.envoiComplet, son: 'pop', volume: 0.35},
  {t: MOMENTS.pubCoche, son: 'succes', volume: 0.45},
  {t: PHASES.lettres, son: 'souffle', volume: 0.25},
  ...RAPPEL.map((t) => ({t, son: 'pop' as const, volume: 0.35})),
  {t: RASSEMBLEMENT, son: 'rassemble', volume: 0.45},
  {t: PHASES.appel, son: 'souffle', volume: 0.25},
  {t: MOMENTS.consultation, son: 'pop', volume: 0.3},
  {t: MOMENTS.lien, son: 'pop', volume: 0.3},
  {t: FIN_VOIX, son: 'fin', volume: 0.5},
];

export const Episode01: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      {t < DEBUT_FIN + 0.4 ? (
        <Scene2D etat={etat} ecran={<EcranEp01 t={t} />}>
          <TitreSurimpression
            t={t}
            format="Une astuce IA"
            numero={1}
            titre={
              <>
                La formule pour parler à <span style={{color: COULEURS.or}}>l’IA</span>
              </>
            }
          />
          <LogoCoin />
          <SousTitresVoix blocs={BLOCS} t={t} />
        </Scene2D>
      ) : null}
      {t >= DEBUT_FIN ? <CartonFin t={t - DEBUT_FIN} /> : null}

      <Audio src={staticFile('episodes/ep01/voix.wav')} volume={0.8} />
      <Audio src={staticFile('serie/musique.wav')} volume={(f) => volumeMusique(f, BOUCHE, 0, Math.round(DEBUT_FIN * fps), DUREE_EP01)} />
      <Effets evenements={EVENEMENTS} />
    </AbsoluteFill>
  );
};

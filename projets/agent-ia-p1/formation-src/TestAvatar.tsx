import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble, EtapeExpression, EtapeGeste} from '../commun/animationDouble';
import {Effets, EvenementSonore} from '../commun/sons';
import {COULEURS, POLICE} from '../theme';
import {BrasDouble2D, Double2D, EtatDouble} from '../v2d/Double2D';
import {Scene2D} from '../v2d/Scene2D';
import bouche from './bouche-test.json';
import visemes from './visemes-test.json';

// Test de 11 s pour la formation « Comment créer un agent IA, de A à Z » (16:9, 1920 × 1080) :
// Coach Joseph en grand avec l'introduction animée, puis l'écran du téléphone avec Coach Joseph en médaillon.
// Voix : lecture de Joseph du 27 octobre (rush 20261027-153738, 1,0 → 12,4 s).
export const LARGEUR = 1920;
export const HAUTEUR = 1080;
export const DUREE_TEST = (bouche as number[]).length;
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;
const BASCULE = 5.0; // s : passage à l'écran du téléphone

const GESTES: EtapeGeste[] = [
  {t: -10, geste: 'repos'},
  {t: 0.45, geste: 'explique'}, // « Salut à tous »
  {t: 2.4, geste: 'repos'},
  {t: 4.1, geste: 'designe'}, // « Comment créer un agent IA »
  {t: 7.4, geste: 'repos'},
];
const EXPRESSIONS: EtapeExpression[] = [
  {t: -10, expression: 'sourire'},
  {t: 1.6, expression: 'neutre'},
  {t: 7.6, expression: 'sourire'}, // « Je suis Joseph »
  {t: 9.0, expression: 'neutre'},
];

// Sous-titres : texte juste, temps des mots de la voix (Whisper, recalés de 4 images sur l'énergie de la voix).
const DEC = 1.0 - 4 / 30;
type Mot = {texte: string; debut: number; cle?: boolean};
const m = (texte: string, debut: number, cle = false): Mot => ({texte, debut: debut - DEC, cle});
const BLOCS: Mot[][] = [
  [m('Salut', 1.3), m('à', 1.98), m('tous', 2.14)],
  [m('et', 2.4), m('bienvenue', 2.84), m('dans', 3.34), m('cette', 3.58)],
  [m('formation', 3.88), m('complète.', 4.28)],
  [m('« Comment', 5.08), m('créer', 5.62), m('un', 6.06), m('agent IA,', 6.4, true)],
  [m('de A à Z »', 7.3, true)],
  [m('Je', 8.7), m('suis', 9.18), m('Joseph', 9.36), m('Ahiankonou,', 9.72)],
  [m('fondateur', 10.66), m('de', 11.22), m('Lomé IA School.', 11.42, true)],
];
const FIN_BLOCS = [2.38, 3.86, 4.95, 7.25, 8.6, 10.6, 11.3];

export const pop = (t: number, debut: number, duree = 0.35) =>
  interpolate(t, [debut, debut + duree * 0.6, debut + duree], [0, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
export const fondu = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const SousTitres: React.FC<{t: number}> = ({t}) => {
  const i = BLOCS.findIndex((b, k) => t >= b[0].debut - 0.05 && t < FIN_BLOCS[k] - DEC);
  if (i < 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', gap: 18, fontFamily: POLICE, fontWeight: 800, fontSize: 54}}>
      {BLOCS[i].map((w, k) => {
        const dit = t >= w.debut - 0.03;
        return (
          <span key={k} style={{
            color: w.cle ? COULEURS.or : COULEURS.blanc,
            opacity: dit ? 1 : 0.45,
            transform: `scale(${dit ? pop(t, w.debut - 0.03, 0.18) * 0.06 + 0.94 : 0.94})`,
            WebkitTextStroke: '10px #020629', paintOrder: 'stroke fill',
            textShadow: '0 6px 18px #000a',
          }}>{w.texte}</span>
        );
      })}
    </div>
  );
};

export const Logo: React.FC<{x: number; y: number; taille: number}> = ({x, y, taille}) => (
  <div style={{position: 'absolute', left: x, top: y, width: taille, height: taille, borderRadius: taille * 0.21, overflow: 'hidden', boxShadow: `0 0 0 2px ${COULEURS.or}55, 0 8px 24px #0008`}}>
    <Img src={staticFile('marque/logo.jpg')} style={{width: '100%', height: '100%'}} />
  </div>
);

// Mode « présentateur » : Coach Joseph dans son bureau, à droite ; introduction animée à gauche.
const Presentateur: React.FC<{t: number; etat: EtatDouble}> = ({t, etat}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 25% 40%, ${COULEURS.nuitClaire}, ${COULEURS.nuit} 70%)`}}>
    <div style={{position: 'absolute', left: 800, top: -990, width: 1080, height: 1920, transform: 'scale(1.12)', transformOrigin: '0 0'}}>
      <Scene2D etat={etat} ecran={<></>} />
    </div>
    <div style={{position: 'absolute', left: 820, top: 0, width: 260, height: HAUTEUR, background: `linear-gradient(90deg, ${COULEURS.nuit}, ${COULEURS.nuit}00)`}} />
    <Logo x={60} y={50} taille={92} />
    <div style={{position: 'absolute', left: 90, top: 230, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{fontSize: 34, fontWeight: 700, letterSpacing: 10, color: COULEURS.or, opacity: fondu(t, 0.15, 0.4), transform: `translateX(${(1 - fondu(t, 0.15, 0.45)) * -40}px)`}}>
        FORMATION
      </div>
      <div style={{fontSize: 68, fontWeight: 800, lineHeight: 1.08, marginTop: 14, transform: `scale(${pop(t, 0.45)})`, transformOrigin: '0 50%'}}>
        Comment créer un agent IA,
      </div>
      <div style={{fontSize: 104, fontWeight: 800, color: COULEURS.or, lineHeight: 1.05, transform: `scale(${pop(t, 0.8)})`, transformOrigin: '0 50%', textShadow: `0 0 40px ${COULEURS.or}55`}}>
        de A à Z
      </div>
      <div style={{height: 8, borderRadius: 4, background: COULEURS.or, marginTop: 22, width: 520 * fondu(t, 1.1, 1.5)}} />
      <div style={{fontSize: 44, fontWeight: 700, marginTop: 30, opacity: fondu(t, 1.5, 1.8)}}>Première partie</div>
      <div style={{display: 'inline-block', marginTop: 18, padding: '12px 30px', borderRadius: 40, background: COULEURS.or, color: COULEURS.nuit, fontSize: 40, fontWeight: 800, transform: `scale(${pop(t, 1.9)})`, transformOrigin: '0 50%'}}>
        Partie 1A · Comprendre
      </div>
    </div>
  </AbsoluteFill>
);

// Médaillon : la tête et le buste de Coach Joseph dans un cercle doré (comme dans les vidéos Talkami et la série).
export const Medaillon: React.FC<{etat: EtatDouble; t: number; entree: number; x: number; y: number; d: number}> = ({etat, t, entree, x, y, d}) => {
  const s = 0.95;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: d, height: d, borderRadius: '50%', overflow: 'hidden',
      background: `radial-gradient(circle at 50% 35%, #3b2f8a, ${COULEURS.nuit} 75%)`,
      boxShadow: `0 0 0 7px ${COULEURS.or}, 0 16px 40px #000b`, transform: `scale(${pop(t, entree, 0.4)})`}}>
      <div style={{position: 'absolute', left: d / 2 - 540 * s, top: d * 0.55 - 1110 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Double2D etat={etat} />
        <BrasDouble2D etat={etat} />
      </div>
    </div>
  );
};

// Mode « écran » : le téléphone entier à gauche (repère), la zone importante agrandie à droite, flèche dorée.
const TEL = {x: 380, y: 140, h: 800};
const ECH = TEL.h / 1880;
const ZONE = {y: 300, h: 700}; // dans l'image recadrée 1080 × 1880
const PANNEAU = {x: 990, y: 250, l: 870};
const Ecran: React.FC<{t: number; etat: EtatDouble}> = ({t, etat}) => {
  const e = t - BASCULE;
  const entree = interpolate(e, [0, 0.4], [80, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const zoom = pop(e, 0.5, 0.45);
  const echP = PANNEAU.l / 1080;
  const fleche = fondu(e, 0.35, 0.7);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 60% 30%, ${COULEURS.nuitClaire}, ${COULEURS.nuit} 70%)`}}>
      <div style={{position: 'absolute', left: TEL.x, top: TEL.y + entree, width: 1080 * ECH + 28, height: TEL.h + 28, borderRadius: 46, background: '#0d0f1a', boxShadow: `0 0 0 3px #2b3152, 0 30px 60px #000c`, padding: 14}}>
        <div style={{width: 1080 * ECH, height: TEL.h, borderRadius: 34, overflow: 'hidden', position: 'relative'}}>
          <OffthreadVideo src={staticFile('formation/test/ecran.mp4')} muted playbackRate={0.6} style={{width: '100%', height: '100%'}} />
          <div style={{position: 'absolute', left: 6, right: 6, top: ZONE.y * ECH, height: ZONE.h * ECH, border: `4px solid ${COULEURS.or}`, borderRadius: 10, opacity: fleche, boxShadow: `0 0 18px ${COULEURS.or}88`}} />
        </div>
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={LARGEUR} height={HAUTEUR}>
        <path d={`M ${TEL.x + 1080 * ECH + 24} ${TEL.y + 14 + (ZONE.y + ZONE.h / 2) * ECH} C 930 ${TEL.y + 200}, 940 ${PANNEAU.y + 280}, ${PANNEAU.x - 14} ${PANNEAU.y + 300}`}
          fill="none" stroke={COULEURS.or} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fleche} />
      </svg>
      <div style={{position: 'absolute', left: PANNEAU.x, top: PANNEAU.y - 66, fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: COULEURS.or, opacity: zoom}}>
        🔍 Le chef de projet pose ses questions
      </div>
      <div style={{position: 'absolute', left: PANNEAU.x, top: PANNEAU.y, width: PANNEAU.l, height: ZONE.h * echP, borderRadius: 22, overflow: 'hidden',
        boxShadow: `0 0 0 5px ${COULEURS.or}, 0 30px 70px #000d`, transform: `scale(${zoom})`, transformOrigin: '0 50%'}}>
        <div style={{position: 'absolute', left: 0, top: -ZONE.y * echP, width: PANNEAU.l, height: 1880 * echP}}>
          <OffthreadVideo src={staticFile('formation/test/ecran.mp4')} muted playbackRate={0.6} style={{width: '100%', height: '100%'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 46, display: 'flex', alignItems: 'center', gap: 16, fontFamily: POLICE, opacity: fondu(e, 0.1, 0.4)}}>
        <Img src={staticFile('marque/logo.jpg')} style={{width: 64, height: 64, borderRadius: 14, boxShadow: `0 0 0 2px ${COULEURS.or}55`}} />
        <div style={{background: COULEURS.or, color: COULEURS.nuit, fontWeight: 800, fontSize: 30, borderRadius: 12, padding: '6px 16px'}}>Chapitre 7</div>
        <div style={{color: COULEURS.blanc, fontWeight: 700, fontSize: 30}}>Claude, votre chef de projet</div>
      </div>
      <Medaillon etat={etat} t={t} entree={BASCULE + 0.15} x={70} y={690} d={250} />
    </AbsoluteFill>
  );
};

export const TestAvatar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const sons: EvenementSonore[] = [
    {t: 0.45, son: 'pop', volume: 0.25}, {t: 0.8, son: 'pop', volume: 0.25}, {t: 1.9, son: 'ding', volume: 0.3},
    {t: BASCULE - 0.15, son: 'whoosh', volume: 0.35}, {t: BASCULE + 0.5, son: 'pop', volume: 0.25},
  ];
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      {t < BASCULE ? <Presentateur t={t} etat={etat} /> : <Ecran t={t} etat={etat} />}
      <SousTitres t={t} />
      <Audio src={staticFile('formation/test/voix.wav')} volume={0.8} />
      <Audio src={staticFile('serie/musique.wav')} volume={(f) => 0.07 * interpolate(f, [durationInFrames - 20, durationInFrames - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <Sequence from={0}><Effets evenements={sons} /></Sequence>
    </AbsoluteFill>
  );
};

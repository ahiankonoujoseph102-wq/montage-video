// Copié du dépôt montage-videos (serie-animee, branche claude/pub-formation-v2) pour la vidéo de test automatique.
import {DOUBLE, Pose} from '../theme';

// Le double en aplats de couleur. Coordonnées en pixels de l'image 1080x1920.
// Formateur accueillant : au repos, léger sourire bienveillant ; la grimace et
// le grand sourire sont réservés à leurs moments.

type P = [number, number];

// ---------------------------------------------------------------- mains

export type FormeMain = 'ouverte' | 'posee' | 'poing' | 'index' | 'pointe' | 'pouce' | 1 | 2 | 3 | 4;

// Longueur et position des quatre doigts (index → auriculaire), main dessinée
// doigts vers le haut, poignet en (0, 0), pouce du côté des x négatifs.
const DOIGTS = [
  {x: -19, l: 46},
  {x: -6.5, l: 52},
  {x: 6.5, l: 49},
  {x: 19, l: 39},
];

// Les mains sont volontairement un peu grandes : elles doivent se lire sur un téléphone.
const TAILLE_MAIN = 1.3;

const doigtsLeves = (forme: FormeMain): boolean[] => {
  if (forme === 'ouverte' || forme === 'posee') return [true, true, true, true];
  if (forme === 'poing' || forme === 'pouce' || forme === 'pointe') return [false, false, false, false];
  if (forme === 'index') return [true, false, false, false];
  return DOIGTS.map((_, i) => i < forme);
};

// Main posée à plat sur le bureau : dos de la main vers nous, paume vers le
// bas, doigts vers l'avant (vers le spectateur), raccourcis par la perspective.
// `angle` : 180 = doigts droit vers le bas de l'image.
// Couleurs de peau : celles du double de Joseph par défaut (autre personnage : `peau`).
export type Peau = {peau: string; ombre: string};
const PEAU_JOSEPH: Peau = {peau: DOUBLE.peau, ombre: DOUBLE.peauOmbre};

const MainPosee: React.FC<{pos: P; angle: number; interieur: 1 | -1; peau?: Peau}> = ({pos, angle, interieur, peau = PEAU_JOSEPH}) => {
  const doigts = DOIGTS.map((d, i) => `M${d.x * 1.05},-50 L${d.x * 1.15},${-50 - d.l * 0.62 - (i === 1 ? 2 : 0)}`);
  const pouce = 'M-26,-14 Q-40,-26 -42,-44';
  const dos = 'M-27,0 L-31,-44 Q-31,-58 -16,-58 L16,-58 Q31,-58 31,-44 L27,0 Z';
  const traits = (couleur: string, plus: number) => (
    <g stroke={couleur} strokeLinecap="round" fill="none">
      {doigts.map((d, i) => (
        <path key={i} d={d} strokeWidth={12.5 + plus} />
      ))}
      <path d={pouce} strokeWidth={15 + plus} />
    </g>
  );
  // pouce du côté du corps (intérieur), quelle que soit la main
  return (
    <g transform={`translate(${pos[0]},${pos[1]}) rotate(${angle}) scale(${interieur * TAILLE_MAIN},${TAILLE_MAIN * 0.8})`}>
      {traits(peau.ombre, 6)}
      <path d={dos} fill={peau.ombre} stroke={peau.ombre} strokeWidth={6} strokeLinejoin="round" />
      {traits(peau.peau, 0)}
      <path d={dos} fill={peau.peau} />
      {/* jointures */}
      {DOIGTS.map((d, i) => (
        <path key={i} d={`M${d.x * 1.05 - 4},-50 Q${d.x * 1.05},-54 ${d.x * 1.05 + 4},-50`} stroke={peau.ombre} strokeWidth={2.5} fill="none" />
      ))}
      <path d="M-14,-20 Q0,-26 14,-20" stroke={peau.ombre} strokeWidth={2.5} fill="none" opacity={0.5} />
    </g>
  );
};

// Pouce levé, lisible au premier coup d'œil : poing fermé vu de face (quatre
// doigts repliés, en bandes horizontales) et pouce épais dressé au-dessus.
const MainPouce: React.FC<{pos: P; angle: number; miroir: boolean; peau: Peau}> = ({pos, angle, miroir, peau}) => {
  const poing = 'M-30,0 L-32,-58 Q-32,-80 -12,-80 L18,-80 Q36,-80 36,-60 L34,0 Z';
  const pouce = 'M-30,-66 Q-36,-104 -30,-132 Q-26,-148 -12,-148 Q2,-148 4,-132 L4,-78 Z';
  return (
    <g transform={`translate(${pos[0]},${pos[1]}) rotate(${angle}) scale(${(miroir ? -1 : 1) * TAILLE_MAIN},${TAILLE_MAIN})`}>
      <path d={pouce} fill={peau.ombre} stroke={peau.ombre} strokeWidth={7} strokeLinejoin="round" />
      <path d={poing} fill={peau.ombre} stroke={peau.ombre} strokeWidth={7} strokeLinejoin="round" />
      <path d={pouce} fill={peau.peau} />
      <path d={poing} fill={peau.peau} />
      {/* ongle du pouce */}
      <path d="M-24,-136 Q-13,-146 -2,-136 L-3,-122 Q-13,-118 -23,-122 Z" fill={peau.ombre} opacity={0.35} />
      {/* doigts repliés : quatre bandes */}
      {[-70, -52, -34, -16].map((y, i) => (
        <path key={i} d={`M-26,${y + 14} Q2,${y + 20} 32,${y + 14}`} stroke={peau.ombre} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ))}
      <path d="M30,-74 Q40,-40 32,-6" stroke={peau.ombre} strokeWidth={3} fill="none" opacity={0.6} />
    </g>
  );
};

// Index tendu pour montrer l'écran : poing fermé, index long et épais, pouce replié.
const MainPointe: React.FC<{pos: P; angle: number; miroir: boolean; peau: Peau}> = ({pos, angle, miroir, peau}) => {
  const poing = 'M-30,0 L-32,-58 Q-32,-80 -12,-80 L18,-80 Q36,-80 36,-60 L34,0 Z';
  const index = 'M-28,-70 L-30,-150 Q-30,-166 -16,-166 Q-2,-166 -2,-150 L-2,-74 Z';
  return (
    <g transform={`translate(${pos[0]},${pos[1]}) rotate(${angle}) scale(${(miroir ? -1 : 1) * TAILLE_MAIN},${TAILLE_MAIN})`}>
      <path d={index} fill={peau.ombre} stroke={peau.ombre} strokeWidth={7} strokeLinejoin="round" />
      <path d={poing} fill={peau.ombre} stroke={peau.ombre} strokeWidth={7} strokeLinejoin="round" />
      <path d={index} fill={peau.peau} />
      <path d={poing} fill={peau.peau} />
      <path d="M-26,-156 Q-16,-164 -6,-156 L-6,-144 Q-16,-140 -26,-144 Z" fill={peau.ombre} opacity={0.35} />
      {[-52, -34, -16].map((y, i) => (
        <path key={i} d={`M-2,${y + 14} Q16,${y + 20} 32,${y + 14}`} stroke={peau.ombre} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ))}
      {/* pouce replié sur les doigts */}
      <path d="M-30,-30 Q-8,-44 14,-40" stroke={peau.ombre} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M-30,-30 Q-8,-44 14,-40" stroke={peau.peau} strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Main: React.FC<{pos: P; angle: number; miroir: boolean; forme: FormeMain; peau?: Peau}> = ({pos, angle, miroir, forme, peau = PEAU_JOSEPH}) => {
  if (forme === 'posee') return <MainPosee pos={pos} angle={angle} interieur={miroir ? 1 : -1} peau={peau} />;
  if (forme === 'pouce') return <MainPouce pos={pos} angle={angle} miroir={miroir} peau={peau} />;
  if (forme === 'pointe') return <MainPointe pos={pos} angle={angle} miroir={miroir} peau={peau} />;
  const leves = doigtsLeves(forme);
  const ecart = forme === 'ouverte' ? [-9, -3, 3, 9] : forme === 'poing' ? [0, 0, 0, 0] : [-10, -3.3, 3.3, 10];
  const pouce = forme === 'ouverte' ? 'M-24,-24 L-48,-54' : 'M-22,-26 L2,-40';
  const doigts = DOIGTS.map((d, i) => {
    const bout = leves[i] ? -58 - d.l : -70;
    return `M${d.x},-56 L${d.x + ecart[i]},${bout}`;
  });
  const traits = (couleur: string, plus: number) => (
    <g stroke={couleur} strokeLinecap="round" fill="none">
      {doigts.map((d, i) => (
        <path key={i} d={d} strokeWidth={11.5 + plus} />
      ))}
      <path d={pouce} strokeWidth={16 + plus} />
    </g>
  );
  const paume = 'M-27,0 L-29,-50 Q-29,-66 -15,-66 L15,-66 Q29,-66 29,-50 L27,0 Z';
  return (
    <g transform={`translate(${pos[0]},${pos[1]}) rotate(${angle}) scale(${(miroir ? -1 : 1) * TAILLE_MAIN},${TAILLE_MAIN})`}>
      {/* contour sombre, puis la peau par-dessus */}
      {traits(peau.ombre, 6)}
      <path d={paume} fill={peau.ombre} stroke={peau.ombre} strokeWidth={6} strokeLinejoin="round" />
      {traits(peau.peau, 0)}
      <path d={paume} fill={peau.peau} />
      {/* phalanges repliées : petites bosses sombres */}
      {DOIGTS.map((d, i) =>
        leves[i] ? null : <path key={i} d={`M${d.x - 5},-62 L${d.x + 5},-62`} stroke={peau.ombre} strokeWidth={3} strokeLinecap="round" />
      )}
      <path d="M-10,-14 Q4,-30 18,-22" stroke={peau.ombre} strokeWidth={3} fill="none" opacity={0.6} />
    </g>
  );
};

// ---------------------------------------------------------------- bras

export type Bras = {coude: P; poignet: P; forme: FormeMain; angleMain?: number};

const EG: P = [360, 1335];
const ED: P = [720, 1335];

const posesBras = (pose: Pose): {g: Bras; d: Bras} => {
  // avant-bras posés sur le bureau, mains à plat vers le centre
  const surBureauG: Bras = {coude: [272, 1560], poignet: [372, 1618], forme: 'posee', angleMain: 168};
  const surBureauD: Bras = {coude: [808, 1560], poignet: [708, 1618], forme: 'posee', angleMain: -168};
  switch (pose.geste) {
    case 'repos':
      return {g: surBureauG, d: surBureauD};
    case 'designe':
      // bras plié vers le haut, index pointé vers l'écran au-dessus de lui
      return {g: {coude: [212, 1440], poignet: [238, 1222], forme: 'index', angleMain: 8}, d: surBureauD};
    case 'explique':
      return {
        g: {coude: [278, 1588], poignet: [402, 1500], forme: 'ouverte', angleMain: -28},
        d: {coude: [802, 1588], poignet: [678, 1500], forme: 'ouverte', angleMain: 28},
      };
    case 'compte':
      // main levée à hauteur d'épaule, paume vers nous : 1, 2, 3, 4 doigts
      return {g: surBureauG, d: {coude: [872, 1450], poignet: [842, 1238], forme: pose.doigts ?? 1, angleMain: -6}};
    case 'bras-croises':
      return {
        g: {coude: [318, 1540], poignet: [640, 1516], forme: 'poing', angleMain: 95},
        d: {coude: [762, 1545], poignet: [440, 1528], forme: 'poing', angleMain: -95},
      };
    case 'pouce':
      return {g: surBureauG, d: {coude: [872, 1450], poignet: [842, 1250], forme: 'pouce', angleMain: -6}};
  }
};

const MANCHE = '#283062';
const CONTOUR = DOUBLE.vesteOmbre;

export const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const norme = (v: P): P => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};

// Quadrilatère entre deux points, largeur variable : une manche qui s'affine.
export const segment = (a: P, b: P, la: number, lb: number) => {
  const [ux, uy] = norme([b[0] - a[0], b[1] - a[1]]);
  const [nx, ny] = [-uy, ux];
  const pts = [
    [a[0] + (nx * la) / 2, a[1] + (ny * la) / 2],
    [b[0] + (nx * lb) / 2, b[1] + (ny * lb) / 2],
    [b[0] - (nx * lb) / 2, b[1] - (ny * lb) / 2],
    [a[0] - (nx * la) / 2, a[1] - (ny * la) / 2],
  ];
  return pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
};

const BrasComplet: React.FC<{epaule: P; b: Bras; cote: 1 | -1}> = ({epaule, b, cote}) => {
  const {coude, poignet} = b;
  const finManche = lerp(coude, poignet, 0.82);
  const finPoignet = lerp(coude, poignet, 0.96);
  const angleAvantBras = (Math.atan2(poignet[0] - coude[0], -(poignet[1] - coude[1])) * 180) / Math.PI;
  // pli du coude, du côté intérieur de la flexion
  const u1 = norme([epaule[0] - coude[0], epaule[1] - coude[1]]);
  const u2 = norme([poignet[0] - coude[0], poignet[1] - coude[1]]);
  const bis = norme([u1[0] + u2[0], u1[1] + u2[1]]);
  const haut = segment(epaule, coude, 92, 76);
  const bas = segment(coude, finManche, 74, 66);
  const formes = (fill: string, stroke?: string) => (
    <g fill={fill} stroke={stroke} strokeWidth={stroke ? 10 : 0} strokeLinejoin="round">
      <polygon points={haut} />
      <circle cx={epaule[0]} cy={epaule[1]} r={46} />
      <circle cx={coude[0]} cy={coude[1]} r={38} />
      <polygon points={bas} />
    </g>
  );
  return (
    <g>
      {formes(CONTOUR, CONTOUR)}
      {formes(MANCHE)}
      {/* pli du coude */}
      <path
        d={`M${coude[0] + bis[0] * 6},${coude[1] + bis[1] * 6} L${coude[0] + bis[0] * 30},${coude[1] + bis[1] * 30}`}
        stroke={CONTOUR}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* bas de manche : liseré et trois boutons, comme sur la photo */}
      <polygon points={segment(lerp(coude, poignet, 0.74), finManche, 67, 66)} fill={DOUBLE.veste} />
      {[0.76, 0.785, 0.81].map((t, i) => {
        const p = lerp(coude, poignet, t);
        const [ux, uy] = norme([poignet[0] - coude[0], poignet[1] - coude[1]]);
        return <circle key={i} cx={p[0] - uy * 24 * cote} cy={p[1] + ux * 24 * cote} r={3.5} fill={CONTOUR} />;
      })}
      {/* poignet de chemise */}
      <polygon points={segment(finManche, finPoignet, 60, 60)} fill={DOUBLE.chemise} />
      <Main pos={poignet} angle={b.angleMain ?? angleAvantBras} miroir={cote === -1} forme={b.forme} />
    </g>
  );
};

// ---------------------------------------------------------------- état continu
//
// Le personnage est piloté par un état numérique, interpolable d'une image à
// l'autre : on ne saute jamais brusquement d'une pose à une autre.

export type EtatDouble = {
  sourcils: [number, number, number, number]; // [décalage, inclinaison] gauche puis droite
  fermeG: number; // 0 œil ouvert … 1 fermé
  fermeD: number;
  bouche: number; // ouverture 0 … 1 (énergie de la voix)
  viseme: Viseme; // forme de bouche du son prononcé (Rhubarb Lip Sync)
  formes: {normale: number; sourire: number; grimace: number}; // poids des formes de bouche (somme 1)
  joues: number; // pommettes du grand sourire, 0 … 1
  tete: number; // inclinaison (degrés)
  teteX: number; // décalage de la tête (px)
  teteY: number;
  respiration: number; // décalage vertical du buste (px, négatif = vers le haut)
  bras: {g: Bras; d: Bras};
};

type Visage = Pick<EtatDouble, 'sourcils' | 'fermeG' | 'fermeD' | 'formes' | 'joues' | 'tete'>;

export const VISAGES: Record<Pose['expression'], Visage> = {
  neutre: {sourcils: [-5, 4, -5, -4], fermeG: 0.14, fermeD: 0.14, formes: {normale: 1, sourire: 0, grimace: 0}, joues: 0, tete: 0},
  parle: {sourcils: [-6, 4, -6, -4], fermeG: 0.12, fermeD: 0.12, formes: {normale: 1, sourire: 0, grimace: 0}, joues: 0, tete: 0},
  grimace: {sourcils: [2, -10, -12, -6], fermeG: 0.6, fermeD: 0.2, formes: {normale: 0, sourire: 0, grimace: 1}, joues: 0, tete: -5},
  sourire: {sourcils: [-8, 5, -8, -5], fermeG: 0.4, fermeD: 0.4, formes: {normale: 0, sourire: 1, grimace: 0}, joues: 1, tete: 2},
  surpris: {sourcils: [-16, 4, -16, -4], fermeG: 0, fermeD: 0, formes: {normale: 1, sourire: 0, grimace: 0}, joues: 0, tete: 0},
};

export const etatDePose = (pose: Pose): EtatDouble => {
  const v = VISAGES[pose.expression];
  return {
    ...v,
    fermeG: Math.max(v.fermeG, pose.clignement ?? 0),
    fermeD: Math.max(v.fermeD, pose.clignement ?? 0),
    bouche: pose.bouche,
    viseme: pose.bouche > 0.6 ? 'D' : pose.bouche > 0.3 ? 'C' : pose.bouche > 0.05 ? 'B' : 'X',
    tete: v.tete + (pose.tete ?? 0) * 7,
    teteX: 0,
    teteY: 0,
    respiration: 0,
    bras: posesBras(pose),
  };
};

const m = (a: number, b: number, t: number) => a + (b - a) * t;

const melangerBras = (a: Bras, b: Bras, t: number): Bras => ({
  coude: lerp(a.coude, b.coude, t),
  poignet: lerp(a.poignet, b.poignet, t),
  // rotation de la main par le plus court chemin (jamais un tour complet)
  angleMain: (a.angleMain ?? 0) + ((((b.angleMain ?? 0) - (a.angleMain ?? 0) + 540) % 360) - 180) * t,
  // la forme de la main bascule à mi-chemin, quand le bras est en mouvement
  forme: t < 0.5 ? a.forme : b.forme,
});

export const melangerVisages = (a: Visage, b: Visage, t: number): Visage => ({
  sourcils: a.sourcils.map((v, i) => m(v, b.sourcils[i], t)) as Visage['sourcils'],
  fermeG: m(a.fermeG, b.fermeG, t),
  fermeD: m(a.fermeD, b.fermeD, t),
  formes: {
    normale: m(a.formes.normale, b.formes.normale, t),
    sourire: m(a.formes.sourire, b.formes.sourire, t),
    grimace: m(a.formes.grimace, b.formes.grimace, t),
  },
  joues: m(a.joues, b.joues, t),
  tete: m(a.tete, b.tete, t),
});

export const melangerPosesBras = (a: {g: Bras; d: Bras}, b: {g: Bras; d: Bras}, t: number) => ({
  g: melangerBras(a.g, b.g, t),
  d: melangerBras(a.d, b.d, t),
});

export {posesBras};

// ---------------------------------------------------------------- visage

const Yeux: React.FC<{e: EtatDouble}> = ({e}) => {
  const oeil = (x: number, ferme: number) => {
    const o = Math.max(0.08, 1 - ferme);
    return (
      <g key={x}>
        <ellipse cx={x} cy={1090} rx={19} ry={12 * o} fill={DOUBLE.yeux} />
        <circle cx={x + 1} cy={1090} r={Math.min(9, 12 * o)} fill={DOUBLE.iris} />
        <circle cx={x + 4} cy={1087} r={Math.min(2.5, 3 * o)} fill="#ffffff" />
        <path d={`M${x - 21},${1090 - 11 * o} Q${x},${1090 - 20 * o} ${x + 21},${1090 - 11 * o}`} stroke={DOUBLE.cheveux} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* paupière inférieure légèrement remontée : regard souriant */}
        {ferme > 0.1 && ferme < 0.85 ? (
          <path d={`M${x - 17},${1092 + 9 * o} Q${x},${1086 + 6 * o} ${x + 17},${1092 + 9 * o}`} stroke={DOUBLE.peauOmbre} strokeWidth={3} fill="none" strokeLinecap="round" />
        ) : null}
      </g>
    );
  };
  const [dg, ig, dd, id] = e.sourcils;
  // sourcils fins et arqués, l'intérieur un peu relevé (air ouvert)
  const sourcil = (x: number, dy: number, inc: number) =>
    `M${x - 22},${1064 + dy + inc} Q${x},${1053 + dy} ${x + 22},${1064 + dy - inc}`;
  return (
    <g>
      {oeil(503, e.fermeG)}
      {oeil(577, e.fermeD)}
      <g stroke={DOUBLE.cheveux} strokeWidth={6.5} strokeLinecap="round" fill="none">
        <path d={sourcil(503, dg, ig)} />
        <path d={sourcil(577, dd, id)} />
      </g>
    </g>
  );
};

const Y_BOUCHE = 1170;

const BoucheSourire: React.FC<{o: number}> = ({o}) => {
  const y = Y_BOUCHE;
  const bas = y + 30 + o * 26;
  return (
    <g>
      <path d={`M505,${y - 6} Q540,${y} 575,${y - 6} Q568,${bas} 540,${bas + 2} Q512,${bas} 505,${y - 6} Z`} fill="#3a1210" />
      <path d={`M511,${y - 3} Q540,${y + 2} 569,${y - 3} L566,${y + 8} Q540,${y + 12} 514,${y + 8} Z`} fill="#f7f3ee" />
      <path d={`M501,${y - 8} Q540,${y - 2} 579,${y - 8}`} stroke={DOUBLE.levres} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

const BoucheGrimace: React.FC<{o: number}> = ({o}) => {
  const y = Y_BOUCHE;
  return (
    <path
      d={`M508,${y + 10} Q522,${y - 4 - o * 6} 538,${y + 4} Q556,${y + 12 + o * 8} 574,${y - 8}`}
      stroke={DOUBLE.levres}
      strokeWidth={11 + o * 6}
      fill="none"
      strokeLinecap="round"
    />
  );
};

// Formes de bouche de Rhubarb Lip Sync (mode phonétique) :
//   X repos · A lèvres fermées (m, b, p) · B entrouverte, dents serrées (la
//   plupart des consonnes) · C ouverte (è, a bref) · D grande ouverte (a) ·
//   E arrondie (o ouvert, eu) · F lèvres en avant (ou, o, w) · G dents sur la
//   lèvre (f, v) · H langue relevée (l).
export type Viseme = 'X' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

type FormeBouche = {l: number; h: number; dentsHaut: number; dentsBas: number; ronde?: boolean; langue?: 'bas' | 'haut'; levre: number};
const FORMES: Record<Exclude<Viseme, 'X' | 'A'>, FormeBouche> = {
  B: {l: 25, h: 17, dentsHaut: 8, dentsBas: 8, levre: 6},
  C: {l: 25, h: 24, dentsHaut: 7, dentsBas: 0, levre: 7},
  D: {l: 27, h: 40, dentsHaut: 7, dentsBas: 0, langue: 'bas', levre: 7},
  E: {l: 18, h: 25, dentsHaut: 0, dentsBas: 0, ronde: true, levre: 8},
  F: {l: 11, h: 13, dentsHaut: 0, dentsBas: 0, ronde: true, levre: 10},
  G: {l: 24, h: 16, dentsHaut: 12, dentsBas: 0, levre: 8},
  H: {l: 24, h: 24, dentsHaut: 6, dentsBas: 0, langue: 'haut', levre: 7},
};

// `sourire` relève les coins de la bouche (grand sourire pendant qu'il parle).
export const BoucheViseme: React.FC<{v: Viseme; sourire?: boolean}> = ({v, sourire = false}) => {
  const y = Y_BOUCHE - 4;
  const releve = sourire ? 7 : 2;
  if (v === 'X') {
    // repos : léger sourire bienveillant
    return <path d={`M513,${y - 2 - releve + 2} Q540,${y + 15} 567,${y - 2 - releve + 2}`} stroke={DOUBLE.levres} strokeWidth={9} fill="none" strokeLinecap="round" />;
  }
  if (v === 'A') {
    // lèvres pincées (m, b, p)
    return (
      <g stroke={DOUBLE.levres} strokeLinecap="round" fill="none">
        <path d={`M516,${y + 2 - releve} Q540,${y + 7} 564,${y + 2 - releve}`} strokeWidth={12} />
        <path d={`M520,${y + 3} L560,${y + 3}`} stroke="#3a1512" strokeWidth={2} />
      </g>
    );
  }
  const f = FORMES[v];
  const g = 540 - f.l;
  const d = 540 + f.l;
  const contour = f.ronde
    ? `M${g},${y + f.h / 2} Q${g},${y - 3} 540,${y - 3} Q${d},${y - 3} ${d},${y + f.h / 2} Q${d},${y + f.h + 3} 540,${y + f.h + 3} Q${g},${y + f.h + 3} ${g},${y + f.h / 2} Z`
    : `M${g},${y - releve} Q540,${y + 2} ${d},${y - releve} Q540,${y + f.h * 1.4} ${g},${y - releve} Z`;
  return (
    <g>
      <defs>
        <clipPath id="interieur-bouche">
          <path d={contour} />
        </clipPath>
      </defs>
      <path d={contour} fill="#2a0d0c" />
      <g clipPath="url(#interieur-bouche)">
        {f.dentsHaut ? <rect x={g} y={y - 12} width={2 * f.l} height={12 + f.dentsHaut} fill="#f7f3ee" /> : null}
        {f.dentsBas ? <rect x={g} y={y + f.h * 0.7 - f.dentsBas + 4} width={2 * f.l} height={30} fill="#e9e3dc" /> : null}
        {f.langue === 'bas' ? <ellipse cx={540} cy={y + f.h * 1.05} rx={f.l * 0.6} ry={f.h * 0.28} fill="#b4524c" /> : null}
        {f.langue === 'haut' ? <ellipse cx={540} cy={y + f.dentsHaut + 6} rx={f.l * 0.45} ry={7} fill="#b4524c" /> : null}
      </g>
      <path d={contour} fill="none" stroke={DOUBLE.levres} strokeWidth={f.levre} strokeLinejoin="round" />
    </g>
  );
};

// Fondu enchaîné entre les formes de bouche quand l'expression change.
const Bouche: React.FC<{e: EtatDouble}> = ({e}) => (
  <g>
    {e.formes.normale > 0.01 ? (
      <g opacity={e.formes.normale}>
        <BoucheViseme v={e.viseme} />
      </g>
    ) : null}
    {e.formes.sourire > 0.01 ? (
      <g opacity={e.formes.sourire}>
        {/* grand sourire : dents visibles au repos, formes des sons quand il parle */}
        {e.viseme === 'X' ? <BoucheSourire o={0} /> : <BoucheViseme v={e.viseme} sourire />}
      </g>
    ) : null}
    {e.formes.grimace > 0.01 ? (
      <g opacity={e.formes.grimace}>
        <BoucheGrimace o={e.bouche} />
      </g>
    ) : null}
  </g>
);

// ---------------------------------------------------------------- personnage

const epaules = (e: EtatDouble): [P, P] => [
  [EG[0], EG[1] + e.respiration],
  [ED[0], ED[1] + e.respiration],
];

// Deux couches : le corps passe derrière le bureau, les bras devant
// (avant-bras posés sur le plateau, gestes au-dessus).
export const BrasDouble2D: React.FC<{etat: EtatDouble}> = ({etat}) => {
  const [g, d] = epaules(etat);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <BrasComplet epaule={g} b={etat.bras.g} cote={-1} />
      <BrasComplet epaule={d} b={etat.bras.d} cote={1} />
    </svg>
  );
};

export const Double2D: React.FC<{etat: EtatDouble}> = ({etat: e}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(0 ${e.respiration})`}>
      {/* buste */}
      <path d="M300,1720 L318,1390 Q322,1312 400,1300 L680,1300 Q758,1312 762,1390 L780,1720 Z" fill={DOUBLE.veste} />
      <path d="M540,1300 L680,1300 Q758,1312 762,1390 L780,1720 L540,1720 Z" fill={DOUBLE.vesteOmbre} opacity={0.35} />
      {/* cou */}
      <path d="M494,1190 L586,1190 L592,1305 L488,1305 Z" fill={DOUBLE.peauOmbre} />
      {/* chemise et col ouvert */}
      <path d="M488,1292 L592,1292 L540,1505 Z" fill={DOUBLE.chemise} />
      <path d="M484,1248 L532,1335 L470,1345 Z" fill={DOUBLE.chemise} />
      <path d="M596,1248 L610,1345 L548,1335 Z" fill={DOUBLE.chemise} />
      <path d="M596,1248 L610,1345 L548,1335 Z" fill={DOUBLE.chemiseOmbre} opacity={0.5} />
      {/* revers */}
      <path d="M488,1295 L540,1520 L440,1400 L452,1372 L434,1352 Z" fill={DOUBLE.vesteOmbre} />
      <path d="M592,1295 L646,1352 L628,1372 L640,1400 L540,1520 Z" fill={DOUBLE.vesteOmbre} />
      {/* tête : pivote autour du cou */}
      <g transform={`translate(${e.teteX} ${e.teteY}) rotate(${e.tete} 540 1200)`}>
        <ellipse cx={449} cy={1098} rx={15} ry={27} fill={DOUBLE.peau} />
        <ellipse cx={631} cy={1098} rx={15} ry={27} fill={DOUBLE.peauOmbre} />
        <path d="M448,1075 C448,985 632,985 632,1075 C632,1150 602,1218 540,1225 C478,1218 448,1150 448,1075 Z" fill={DOUBLE.peau} />
        {/* ombre de la moitié droite du visage, comme une facette */}
        <path d="M560,995 C610,1000 632,1030 632,1075 C632,1150 602,1218 540,1225 L556,1150 Z" fill={DOUBLE.peauOmbre} opacity={0.45} />
        {/* cheveux : dessus plat avec un peu de volume, côtés très courts */}
        <path d="M449,1058 C446,1012 458,992 474,982 L480,962 Q540,952 600,962 L606,982 C622,992 634,1012 631,1058 C624,1034 606,1020 540,1018 C474,1020 456,1034 449,1058 Z" fill={DOUBLE.cheveux} />
        <Yeux e={e} />
        {/* nez */}
        <path d="M534,1100 L524,1140 Q540,1148 556,1140 L546,1100 Z" fill={DOUBLE.peauOmbre} opacity={0.55} />
        <ellipse cx={540} cy={1140} rx={23} ry={8} fill={DOUBLE.peauOmbre} />
        {/* moustache très légère */}
        <path d="M516,1156 Q540,1150 564,1156" stroke={DOUBLE.barbe} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55} />
        <Bouche e={e} />
        {/* barbiche légère sous la lèvre et sur le menton, comme sur la photo */}
        <path d={`M532,${1196 + e.bouche * 14} Q540,${1192 + e.bouche * 14} 548,${1196 + e.bouche * 14} L546,${1204 + e.bouche * 14} Q540,${1206 + e.bouche * 14} 534,${1204 + e.bouche * 14} Z`} fill={DOUBLE.barbe} />
        <path d="M518,1210 Q540,1200 562,1210 Q560,1224 540,1227 Q520,1224 518,1210 Z" fill={DOUBLE.barbe} />
        {e.joues > 0.01 ? (
          <g opacity={e.joues}>
            <ellipse cx={485} cy={1148} rx={18} ry={10} fill={DOUBLE.peauClaire} opacity={0.7} />
            <ellipse cx={595} cy={1148} rx={18} ry={10} fill={DOUBLE.peauClaire} opacity={0.5} />
          </g>
        ) : null}
      </g>
    </g>
  </svg>
);

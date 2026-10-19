import {staticFile} from 'remotion';
import {COULEURS, Pose} from '../theme';
import {hasard} from '../commun/hasard';
import {Bras, EtatDouble, Main, Peau, Viseme, lerp, norme, segment} from './Double2D';

// Le double de Patricia, l'assistante de Lomé IA School (épisode 4).
// Même style que le double de Joseph (aplats, mêmes proportions, mêmes mains,
// mêmes formes de bouche de Rhubarb) pour qu'ils appartiennent à la même série :
// jeune femme au visage rond et doux, grand sourire calme, regard malicieux,
// cheveux tressés tirés en arrière avec deux longues tresses de chaque côté,
// petites boucles d'oreilles, haut noir à strass, foulard de soie blanc à
// motifs vert, rouge et jaune, bracelet fin. Posture de base : bras croisés
// posés sur le bureau.

type P = [number, number];

export const PATRICIA = {
  peau: '#6b4434',
  peauClaire: '#8a5a45',
  peauOmbre: '#47291e',
  levres: '#7d3d39',
  levresClaires: '#9a5049',
  cheveux: '#0c0a0d',
  cheveuxReflet: '#2a2228',
  haut: '#15151b',
  hautOmbre: '#09090c',
  contourBras: '#34344a', // liseré qui détache les manches du buste noir
  strass: '#e9edf7',
  foulard: '#f6f3ea',
  foulardOmbre: '#d9d3c4',
  vert: '#1f8a4c',
  rouge: '#d7322f',
  jaune: '#f2b51f',
  or: '#e4b54a',
  yeux: '#f5efe7',
  iris: '#2b160f',
} as const;

const PEAU: Peau = {peau: PATRICIA.peau, ombre: PATRICIA.peauOmbre};

// ---------------------------------------------------------------- bras

const EG: P = [372, 1342];
const ED: P = [708, 1342];

// Gestes de Patricia. « repos » : mains jointes posées sur le comptoir (les bras
// croisés de la photo ne se lisaient pas : une seule main visible).
export const posesPatricia = (pose: Pose): {g: Bras; d: Bras} => {
  // avant-bras à plat sur le plateau, qui se croisent ; chaque main repose sur l'autre bras
  const croiseG: Bras = {coude: [300, 1592], poignet: [690, 1612], forme: 'posee', angleMain: 86};
  const croiseD: Bras = {coude: [780, 1572], poignet: [400, 1586], forme: 'posee', angleMain: -86};
  // pendant un geste d'un bras, l'autre reste posé à plat sur le plateau
  const poseeG: Bras = {coude: [284, 1572], poignet: [400, 1622], forme: 'posee', angleMain: 165};
  const poseeD: Bras = {coude: [796, 1572], poignet: [680, 1622], forme: 'posee', angleMain: -165};
  switch (pose.geste) {
    case 'repos':
      // avant-bras en V vers le centre, mains l'une sur l'autre sur le plateau
      return {
        g: {coude: [292, 1584], poignet: [498, 1628], forme: 'posee', angleMain: 128},
        d: {coude: [788, 1584], poignet: [582, 1622], forme: 'posee', angleMain: -128},
      };
    case 'bras-croises':
      return {g: croiseG, d: croiseD};
    case 'designe':
      // bras plié vers le haut, index vers l'écran au-dessus d'elle
      // bras levé, index tendu vers l'écran au-dessus d'elle
      return {g: {coude: [214, 1410], poignet: [262, 1190], forme: 'pointe', angleMain: 12}, d: poseeD};
    case 'explique':
      return {
        g: {coude: [286, 1590], poignet: [408, 1500], forme: 'ouverte', angleMain: -28},
        d: {coude: [794, 1590], poignet: [672, 1500], forme: 'ouverte', angleMain: 28},
      };
    case 'compte':
      return {g: poseeG, d: {coude: [864, 1452], poignet: [836, 1242], forme: pose.doigts ?? 1, angleMain: -6}};
    case 'pouce':
      return {g: poseeG, d: {coude: [866, 1470], poignet: [826, 1345], forme: 'pouce', angleMain: 0}};
  }
};

// Strass : petites perles brillantes, réparties de façon stable (tirage fixe).
const Strass: React.FC<{pts: P[]; t?: number}> = ({pts}) => (
  <g fill={PATRICIA.strass}>
    {pts.map((p, i) => (
      <circle key={i} cx={p[0]} cy={p[1]} r={2.6 + hasard(i + 5) * 1.6} opacity={0.65 + hasard(i + 9) * 0.35} />
    ))}
  </g>
);

const BrasPatricia: React.FC<{epaule: P; b: Bras; cote: 1 | -1; bracelet?: boolean}> = ({epaule, b, cote, bracelet}) => {
  const {coude, poignet} = b;
  const finManche = lerp(coude, poignet, 0.86);
  const u1 = norme([epaule[0] - coude[0], epaule[1] - coude[1]]);
  const u2 = norme([poignet[0] - coude[0], poignet[1] - coude[1]]);
  const bis = norme([u1[0] + u2[0], u1[1] + u2[1]]);
  const haut = segment(epaule, coude, 84, 70);
  const bas = segment(coude, finManche, 68, 58);
  const formes = (fill: string, stroke?: string) => (
    <g fill={fill} stroke={stroke} strokeWidth={stroke ? 9 : 0} strokeLinejoin="round">
      <polygon points={haut} />
      <circle cx={epaule[0]} cy={epaule[1]} r={42} />
      <circle cx={coude[0]} cy={coude[1]} r={34} />
      <polygon points={bas} />
    </g>
  );
  // strass sur l'épaule et le long de la manche
  const perles: P[] = [];
  for (let k = 0; k < 14; k++) {
    const t = 0.08 + (k / 14) * 0.85;
    const p = lerp(epaule, coude, t);
    const [ux, uy] = norme([coude[0] - epaule[0], coude[1] - epaule[1]]);
    const ecart = (hasard(k * 3 + cote * 11) - 0.5) * 50;
    perles.push([p[0] - uy * ecart, p[1] + ux * ecart]);
  }
  for (let k = 0; k < 10; k++) {
    const t = 0.1 + (k / 10) * 0.8;
    const p = lerp(coude, finManche, t);
    const [ux, uy] = norme([finManche[0] - coude[0], finManche[1] - coude[1]]);
    const ecart = (hasard(k * 7 + cote * 13 + 2) - 0.5) * 40;
    perles.push([p[0] - uy * ecart, p[1] + ux * ecart]);
  }
  const brac = lerp(coude, poignet, 0.9);
  const [bx, by] = norme([poignet[0] - coude[0], poignet[1] - coude[1]]);
  return (
    <g>
      {formes(PATRICIA.contourBras, PATRICIA.contourBras)}
      {formes(PATRICIA.haut)}
      <path d={`M${coude[0] + bis[0] * 6},${coude[1] + bis[1] * 6} L${coude[0] + bis[0] * 26},${coude[1] + bis[1] * 26}`} stroke={PATRICIA.hautOmbre} strokeWidth={5} strokeLinecap="round" />
      <Strass pts={perles} />
      {/* poignet nu, puis la main */}
      <polygon points={segment(finManche, lerp(coude, poignet, 0.98), 50, 46)} fill={PATRICIA.peau} />
      {bracelet ? <line x1={brac[0] - by * 26} y1={brac[1] + bx * 26} x2={brac[0] + by * 26} y2={brac[1] - bx * 26} stroke={PATRICIA.or} strokeWidth={5} strokeLinecap="round" /> : null}
      <Main pos={poignet} angle={b.angleMain ?? 0} miroir={cote === -1} forme={b.forme} peau={PEAU} />
    </g>
  );
};

// ---------------------------------------------------------------- visage

const CX = 540;
const Y_YEUX = 1092;
const Y_BOUCHE = 1172;

const Yeux: React.FC<{e: EtatDouble}> = ({e}) => {
  const oeil = (x: number, ferme0: number, cote: 1 | -1) => {
    // yeux moins plissés que ceux de Joseph quand elle sourit (clignements inchangés)
    const ferme = ferme0 > 0.8 ? ferme0 : ferme0 * 0.6;
    const o = Math.max(0.08, 1 - ferme);
    const y = Y_YEUX;
    return (
      <g key={x}>
        <ellipse cx={x} cy={y} rx={21} ry={14 * o} fill={PATRICIA.yeux} />
        <circle cx={x + 2} cy={y + 1} r={Math.min(11, 14 * o)} fill={PATRICIA.iris} />
        <circle cx={x + 5} cy={y - 3} r={Math.min(3, 3.5 * o)} fill="#ffffff" />
        {/* paupière et cils (plus marqués que chez Joseph) */}
        <path d={`M${x - 23},${y - 9 * o} Q${x},${y - 21 * o} ${x + 23},${y - 9 * o}`} stroke={PATRICIA.cheveux} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M${x + 23 * cote},${y - 9 * o} l${7 * cote},${-6}`} stroke={PATRICIA.cheveux} strokeWidth={4} strokeLinecap="round" />
        {/* paupière inférieure remontée : regard rieur, un peu malicieux */}
        {ferme > 0.08 && ferme < 0.85 ? (
          <path d={`M${x - 18},${y + 10 * o} Q${x},${y + 4 + 4 * o} ${x + 18},${y + 10 * o}`} stroke={PATRICIA.peauOmbre} strokeWidth={3} fill="none" strokeLinecap="round" />
        ) : null}
      </g>
    );
  };
  const [dg, ig, dd, id] = e.sourcils;
  const sourcil = (x: number, dy: number, inc: number) => `M${x - 22},${1060 + dy + inc} Q${x},${1044 + dy} ${x + 22},${1058 + dy - inc}`;
  return (
    <g>
      {oeil(502, e.fermeG, -1)}
      {oeil(578, e.fermeD, 1)}
      <g stroke={PATRICIA.cheveux} strokeWidth={5} strokeLinecap="round" fill="none">
        {/* sourcil droit (à l'image) un peu plus haut : regard malicieux */}
        <path d={sourcil(502, dg + 1, ig)} />
        <path d={sourcil(578, dd - 3, id)} />
      </g>
    </g>
  );
};

// Formes de bouche (mêmes neuf formes que pour Joseph, lèvres plus pleines).
type FormeBouche = {l: number; h: number; dentsHaut: number; dentsBas: number; ronde?: boolean; langue?: 'bas' | 'haut'; levre: number};
const FORMES: Record<Exclude<Viseme, 'X' | 'A'>, FormeBouche> = {
  B: {l: 26, h: 16, dentsHaut: 8, dentsBas: 8, levre: 8},
  C: {l: 26, h: 23, dentsHaut: 7, dentsBas: 0, levre: 9},
  D: {l: 28, h: 38, dentsHaut: 7, dentsBas: 0, langue: 'bas', levre: 9},
  E: {l: 19, h: 24, dentsHaut: 0, dentsBas: 0, ronde: true, levre: 10},
  F: {l: 12, h: 13, dentsHaut: 0, dentsBas: 0, ronde: true, levre: 12},
  G: {l: 25, h: 15, dentsHaut: 12, dentsBas: 0, levre: 10},
  H: {l: 25, h: 23, dentsHaut: 6, dentsBas: 0, langue: 'haut', levre: 9},
};

export const BouchePatricia: React.FC<{v: Viseme; sourire?: number}> = ({v, sourire = 0}) => {
  const y = Y_BOUCHE - 4;
  const releve = 4 + sourire * 5; // coins relevés : elle sourit presque toujours
  if (v === 'X') {
    // repos : grand sourire calme, lèvres fermées et pleines, coins bien relevés
    const r = releve + 6;
    return (
      <g>
        <path d={`M${CX - 40},${y - r} Q${CX},${y + 22} ${CX + 40},${y - r} Q${CX},${y + 10} ${CX - 40},${y - r} Z`} fill={PATRICIA.levres} />
        <path d={`M${CX - 40},${y - r} Q${CX},${y + 10} ${CX + 40},${y - r}`} stroke="#3a1512" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={`M${CX - 16},${y + 14} Q${CX},${y + 17} ${CX + 16},${y + 14}`} stroke={PATRICIA.levresClaires} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
        {/* fossettes discrètes */}
        <path d={`M${CX - 47},${y - r - 5} q-5,7 0,12`} stroke={PATRICIA.peauOmbre} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d={`M${CX + 47},${y - r - 5} q5,7 0,12`} stroke={PATRICIA.peauOmbre} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (v === 'A') {
    return (
      <g strokeLinecap="round" fill="none">
        <path d={`M${CX - 26},${y + 2 - releve} Q${CX},${y + 9} ${CX + 26},${y + 2 - releve}`} stroke={PATRICIA.levres} strokeWidth={15} />
        <path d={`M${CX - 20},${y + 3} L${CX + 20},${y + 3}`} stroke="#3a1512" strokeWidth={2.5} />
      </g>
    );
  }
  const f = FORMES[v];
  const g = CX - f.l;
  const d = CX + f.l;
  const contour = f.ronde
    ? `M${g},${y + f.h / 2} Q${g},${y - 3} ${CX},${y - 3} Q${d},${y - 3} ${d},${y + f.h / 2} Q${d},${y + f.h + 3} ${CX},${y + f.h + 3} Q${g},${y + f.h + 3} ${g},${y + f.h / 2} Z`
    : `M${g},${y - releve} Q${CX},${y + 2} ${d},${y - releve} Q${CX},${y + f.h * 1.4} ${g},${y - releve} Z`;
  return (
    <g>
      <defs>
        <clipPath id="interieur-bouche-patricia">
          <path d={contour} />
        </clipPath>
      </defs>
      <path d={contour} fill="#2a0d0c" />
      <g clipPath="url(#interieur-bouche-patricia)">
        {f.dentsHaut ? <rect x={g} y={y - 12} width={2 * f.l} height={12 + f.dentsHaut} fill="#f7f3ee" /> : null}
        {f.dentsBas ? <rect x={g} y={y + f.h * 0.7 - f.dentsBas + 4} width={2 * f.l} height={30} fill="#e9e3dc" /> : null}
        {f.langue === 'bas' ? <ellipse cx={CX} cy={y + f.h * 1.05} rx={f.l * 0.6} ry={f.h * 0.28} fill="#b4524c" /> : null}
        {f.langue === 'haut' ? <ellipse cx={CX} cy={y + f.dentsHaut + 6} rx={f.l * 0.45} ry={7} fill="#b4524c" /> : null}
      </g>
      <path d={contour} fill="none" stroke={PATRICIA.levres} strokeWidth={f.levre} strokeLinejoin="round" />
    </g>
  );
};

const Bouche: React.FC<{e: EtatDouble}> = ({e}) => {
  // grand sourire : dents visibles au repos ; grimace : rare, bouche de travers
  if (e.formes.grimace > 0.5) {
    const y = Y_BOUCHE;
    return <path d={`M${CX - 30},${y + 8} Q${CX - 16},${y - 4} ${CX},${y + 4} Q${CX + 16},${y + 12} ${CX + 32},${y - 8}`} stroke={PATRICIA.levres} strokeWidth={13} fill="none" strokeLinecap="round" />;
  }
  if (e.formes.sourire > 0.5 && e.viseme === 'X') {
    const y = Y_BOUCHE;
    return (
      <g>
        <path d={`M${CX - 38},${y - 8} Q${CX},${y} ${CX + 38},${y - 8} Q${CX + 30},${y + 30} ${CX},${y + 32} Q${CX - 30},${y + 30} ${CX - 38},${y - 8} Z`} fill="#3a1210" />
        <path d={`M${CX - 31},${y - 4} Q${CX},${y + 2} ${CX + 31},${y - 4} L${CX + 28},${y + 9} Q${CX},${y + 13} ${CX - 28},${y + 9} Z`} fill="#f7f3ee" />
        <path d={`M${CX - 40},${y - 9} Q${CX},${y - 2} ${CX + 40},${y - 9}`} stroke={PATRICIA.levres} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M${CX - 30},${y + 26} Q${CX},${y + 38} ${CX + 30},${y + 26}`} stroke={PATRICIA.levres} strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return <BouchePatricia v={e.viseme} sourire={e.formes.sourire} />;
};

// Tresse : suite de petites mèches en chevron, qui suit une courbe.
const Tresse: React.FC<{pts: P[]; epaisseur: number}> = ({pts, epaisseur}) => {
  const mailles = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = 6;
    for (let k = 0; k < n; k++) {
      const p = lerp(a, b, k / n);
      const [ux, uy] = norme([b[0] - a[0], b[1] - a[1]]);
      const w = epaisseur * (1 - (i * n + k) / ((pts.length - 1) * n) * 0.35);
      const cote = k % 2 ? 1 : -1;
      mailles.push(
        <ellipse key={`${i}-${k}`} cx={p[0] - uy * cote * w * 0.18} cy={p[1] + ux * cote * w * 0.18} rx={w * 0.55} ry={w * 0.36} transform={`rotate(${(Math.atan2(uy, ux) * 180) / Math.PI + cote * 28} ${p[0]} ${p[1]})`} fill={PATRICIA.cheveux} stroke={PATRICIA.cheveuxReflet} strokeWidth={2} />
      );
    }
  }
  return <g>{mailles}</g>;
};

// ---------------------------------------------------------------- personnage

const epaules = (e: EtatDouble): [P, P] => [
  [EG[0], EG[1] + e.respiration],
  [ED[0], ED[1] + e.respiration],
];

// Bras devant le bureau (comme pour Joseph : le corps passe derrière le plateau).
export const BrasPatricia2D: React.FC<{etat: EtatDouble}> = ({etat}) => {
  const [g, d] = epaules(etat);
  // bras croisés : le bras droit (à l'image) passe par-dessus
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <BrasPatricia epaule={g} b={etat.bras.g} cote={-1} />
      <BrasPatricia epaule={d} b={etat.bras.d} cote={1} bracelet />
    </svg>
  );
};

export const Patricia2D: React.FC<{etat: EtatDouble}> = ({etat: e}) => {
  // perles sur le haut des épaules et le devant du buste, en deux arcs (comme sur la photo)
  const arcs: P[] = [];
  for (const cote of [-1, 1]) {
    for (let k = 0; k < 22; k++) {
      const a = (k / 21) * Math.PI * 0.62;
      arcs.push([CX + cote * (70 + Math.sin(a) * 120), 1318 + (1 - Math.cos(a)) * 150 + (k % 2) * 5]);
      arcs.push([CX + cote * (88 + Math.sin(a) * 120), 1322 + (1 - Math.cos(a)) * 150 + (k % 2) * 4]);
    }
  }
  const balancement = e.tete * 0.6;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(0 ${e.respiration})`}>
        {/* buste : haut noir à manches longues */}
        <path d="M312,1720 L328,1400 Q334,1318 410,1306 L670,1306 Q746,1318 752,1400 L768,1720 Z" fill={PATRICIA.haut} />
        <path d="M540,1306 L670,1306 Q746,1318 752,1400 L768,1720 L540,1720 Z" fill={PATRICIA.hautOmbre} opacity={0.45} />
        <Strass pts={arcs} />
        {/* cou */}
        <path d="M500,1192 L580,1192 L586,1300 L494,1300 Z" fill={PATRICIA.peauOmbre} />
        {/* tête : pivote autour du cou ; les tresses suivent */}
        <g transform={`translate(${e.teteX} ${e.teteY}) rotate(${e.tete} 540 1200)`}>
          {/* tresses longues, de chaque côté du visage jusqu'aux épaules */}
          <Tresse pts={[[452, 1050], [440, 1130], [438 - balancement, 1220], [446 - balancement * 1.5, 1310], [452 - balancement * 2, 1360]]} epaisseur={30} />
          <Tresse pts={[[628, 1050], [640, 1130], [642 - balancement, 1220], [634 - balancement * 1.5, 1310], [628 - balancement * 2, 1360]]} epaisseur={30} />
          {/* oreilles et petites boucles d'oreilles */}
          <ellipse cx={455} cy={1102} rx={13} ry={23} fill={PATRICIA.peau} />
          <ellipse cx={625} cy={1102} rx={13} ry={23} fill={PATRICIA.peauOmbre} />
          <circle cx={456} cy={1130} r={7} fill="none" stroke={PATRICIA.or} strokeWidth={4} />
          <circle cx={624} cy={1130} r={7} fill="none" stroke={PATRICIA.or} strokeWidth={4} />
          {/* visage rond et doux */}
          <path d="M452,1082 C452,990 628,990 628,1082 C628,1162 604,1210 540,1218 C476,1210 452,1162 452,1082 Z" fill={PATRICIA.peau} />
          <path d="M562,996 C608,1002 628,1036 628,1082 C628,1162 604,1210 540,1218 L558,1150 Z" fill={PATRICIA.peauOmbre} opacity={0.3} />
          {/* cheveux tressés tirés en arrière : rangs de tresses plaquées vers l'arrière */}
          <path d="M455,1062 C450,1006 478,976 540,972 C602,976 630,1006 625,1062 C616,1030 594,1012 540,1010 C486,1012 464,1030 455,1062 Z" fill={PATRICIA.cheveux} />
          {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
            <path key={k} d={`M${540 + k * 22},${1012 - Math.abs(k) * 2} Q${540 + k * 20},${990} ${540 + k * 14},${972}`} stroke={PATRICIA.cheveuxReflet} strokeWidth={3} fill="none" strokeLinecap="round" />
          ))}
          <Yeux e={e} />
          {/* nez plus petit et arrondi */}
          <path d="M535,1104 L528,1138 Q540,1144 552,1138 L545,1104 Z" fill={PATRICIA.peauOmbre} opacity={0.45} />
          <ellipse cx={540} cy={1139} rx={20} ry={7} fill={PATRICIA.peauOmbre} />
          {/* joues un peu rosées, toujours : visage doux */}
          <ellipse cx={488} cy={1146} rx={20} ry={11} fill={PATRICIA.peauClaire} opacity={0.35 + e.joues * 0.35} />
          <ellipse cx={592} cy={1146} rx={20} ry={11} fill={PATRICIA.peauClaire} opacity={0.25 + e.joues * 0.3} />
          <Bouche e={e} />
        </g>
        {/* foulard de soie noué au cou : blanc à motifs vert, rouge et jaune ;
            tour de cou, gros nœud sur le côté, deux pans larges qui tombent */}
        <defs>
          <clipPath id="foulard">
            <path d="M474,1246 Q540,1286 606,1246 L616,1286 Q540,1326 464,1286 Z" />
            <path d="M548,1296 Q590,1300 604,1330 L628,1470 Q604,1492 576,1484 L556,1350 Z" />
            <path d="M532,1300 Q500,1320 490,1350 L456,1452 Q474,1476 504,1470 L548,1336 Z" />
          </clipPath>
          <clipPath id="noeud">
            <path d="M512,1280 Q532,1262 560,1270 Q584,1282 578,1306 Q566,1330 538,1326 Q508,1320 506,1300 Q506,1288 512,1280 Z" />
          </clipPath>
        </defs>
        {(['foulard', 'noeud'] as const).map((id) => (
          <g key={id} clipPath={`url(#${id})`}>
            <rect x={440} y={1236} width={200} height={260} fill={PATRICIA.foulard} />
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <g key={k} transform={`rotate(${id === 'noeud' ? 35 : -24} 540 1370)`}>
                <rect x={400} y={1250 + k * 40} width={280} height={11} fill={[PATRICIA.vert, PATRICIA.rouge, PATRICIA.jaune][k % 3]} />
                <rect x={400} y={1264 + k * 40} width={280} height={4} fill={PATRICIA.foulardOmbre} />
              </g>
            ))}
          </g>
        ))}
        <path d="M512,1280 Q532,1262 560,1270 Q584,1282 578,1306 Q566,1330 538,1326 Q508,1320 506,1300 Q506,1288 512,1280 Z" fill="none" stroke={PATRICIA.foulardOmbre} strokeWidth={3} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- décor : accueil de Lomé IA School

const MurAccueil: React.FC = () => {
  const lattes = Array.from({length: 18}, (_, i) => i);
  return (
    <g>
      <rect width={1080} height={1920} fill={COULEURS.nuitMur} />
      {/* lattes verticales derrière l'accueil */}
      {lattes.map((i) => (
        <rect key={i} x={i * 62} y={880} width={54} height={760} fill="#ffffff" opacity={0.025 + hasard(i) * 0.02} />
      ))}
      {/* bandeau lumineux doré */}
      <rect x={0} y={872} width={1080} height={8} fill={COULEURS.or} opacity={0.75} />
    </g>
  );
};

// `enseigne` : l'enseigne au logo n'est dessinée que si elle est entière à
// l'image (plans large et moyen ; jamais coupée par le bord en gros plan).
export const DecorAccueil2D: React.FC<{enseigne?: boolean}> = ({enseigne = true}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <MurAccueil />
    {/* cadre du grand écran (même place que dans le décor de Joseph) */}
    <rect x={92} y={222} width={896} height={636} rx={22} fill="#04061a" />
    {/* enseigne lumineuse avec le logo, à droite derrière elle : x 690–880, entière
        dans le plan moyen (x 180–900 à l'image) */}
    {enseigne ? (
      <g>
        <rect x={690} y={910} width={190} height={190} rx={32} fill="#04061a" />
        <rect x={690} y={910} width={190} height={190} rx={32} fill="none" stroke={COULEURS.or} strokeWidth={5} opacity={0.8} />
        <image href={staticFile('marque/logo.jpg')} x={705} y={925} width={160} height={160} />
      </g>
    ) : null}
    {/* plante à gauche */}
    {Array.from({length: 9}, (_, i) => {
      const a = -0.9 + (i / 8) * 1.8;
      const h = 210 + hasard(i + 3) * 190;
      const bx = 105;
      const by = 1450;
      const tx = bx + Math.sin(a) * h * 0.55;
      const ty = by - Math.cos(a) * h;
      return <path key={i} d={`M${bx - 14},${by} Q${(bx + tx) / 2 - 20},${(by + ty) / 2} ${tx},${ty} Q${(bx + tx) / 2 + 20},${(by + ty) / 2} ${bx + 14},${by} Z`} fill={i % 2 ? '#1f7a5a' : '#2c9a6c'} />;
    })}
    <path d="M30,1445 L175,1445 L155,1600 L50,1600 Z" fill={COULEURS.orFonce} />
  </svg>
);

// Comptoir d'accueil, devant elle, avec le logo sur la façade.
// `logo` : le logo de la façade n'apparaît que si l'enseigne du mur est cachée
// (jamais plus de deux logos à l'image avec le petit logo du coin).
export const ComptoirAccueil2D: React.FC<{logo?: boolean}> = ({logo = true}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <rect x={0} y={1600} width={1080} height={70} fill="#2c3570" />
    <rect x={0} y={1600} width={1080} height={8} fill="#3a4486" />
    <rect x={0} y={1670} width={1080} height={10} fill={COULEURS.or} />
    <rect x={0} y={1680} width={1080} height={240} fill="#151c45" />
    {/* façade : bandes et logo */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <rect key={i} x={20 + i * 135} y={1700} width={110} height={200} rx={10} fill="#1b2457" />
    ))}
    {logo ? (
      <g>
        <rect x={430} y={1705} width={220} height={190} rx={26} fill="#04061a" stroke={COULEURS.or} strokeWidth={4} />
        <image href={staticFile('marque/logo.jpg')} x={455} y={1712} width={176} height={176} />
      </g>
    ) : null}
    {/* sonnette d'accueil et petit pot à crayons */}
    <ellipse cx={900} cy={1600} rx={44} ry={10} fill="#8a90a8" />
    <path d="M864,1598 Q900,1540 936,1598 Z" fill="#c9cfe6" />
    <circle cx={900} cy={1550} r={7} fill="#e9edf7" />
  </svg>
);

import React from 'react';
import {Easing, interpolate, spring} from 'remotion';

// Outils communs aux scènes illustrées (dessins SVG 1080 × 960, contenu entre x 50–950 et y 200–880 :
// zone sûre TikTok en haut et à droite, sous-titres sur la limite basse).
export type PropsScene = {t: number; etapes: number[]; duree: number};
export const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0 → 1 entre a et a + d (images), avec une courbe douce.
export const prog = (t: number, a: number, d: number, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, a + d], [0, 1], {...clamp, easing: ease});
// Apparition avec rebond (dépasse un peu puis se pose).
export const pop = (t: number, a: number, raide = 220) =>
  t < a ? 0 : spring({frame: t - a, fps: FPS, config: {damping: 10, stiffness: raide, mass: 0.7}});
export const lin = (t: number, a: number, b: number, de: number, a2: number) =>
  interpolate(t, [a, b], [de, a2], clamp);

export const POLICE_SVG = 'Montserrat';

// Filtres et dégradés réutilisés (ombre portée douce, lueur).
export const Defs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <filter id={`ombre${id}`} x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity="0.35" />
    </filter>
    <filter id={`lueur${id}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id={`flou${id}`}><feGaussianBlur stdDeviation="4.5" /></filter>
    <linearGradient id={`brillance${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
      <stop offset="55%" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
  </defs>
);

// Grande pastille croix rouge / coche verte qui claque.
export const Marque: React.FC<{x: number; y: number; r: number; type: 'croix' | 'coche'; k: number; id: string}> = (
  {x, y, r, type, k, id}) => {
  if (k <= 0) return null;
  const c = type === 'croix' ? ['#FF5A5A', '#C81E1E'] : ['#4BE38A', '#12A150'];
  const trait = Math.min(1, k * 1.4);
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${(1 - Math.min(1, k)) * -40})`} filter={`url(#ombre${id})`}>
      <circle r={r + 10} fill="#fff" />
      <circle r={r} fill={c[1]} />
      <circle r={r} fill={`url(#brillance${id})`} />
      {type === 'croix' ? (
        <g stroke="#fff" strokeWidth={r * 0.26} strokeLinecap="round">
          <line x1={-r * 0.4} y1={-r * 0.4} x2={-r * 0.4 + r * 0.8 * trait} y2={-r * 0.4 + r * 0.8 * trait} />
          <line x1={r * 0.4} y1={-r * 0.4} x2={r * 0.4 - r * 0.8 * trait} y2={-r * 0.4 + r * 0.8 * trait} />
        </g>
      ) : (
        <polyline points={`${-r * 0.45},${0} ${-r * 0.12},${r * 0.33} ${r * 0.48},${-r * 0.35}`} fill="none"
          stroke="#fff" strokeWidth={r * 0.26} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={r * 2} strokeDashoffset={r * 2 * (1 - trait)} />
      )}
    </g>
  );
};

// Silhouette de personne (tête + buste), centrée sur (0, 0) en bas des épaules.
export const Personne: React.FC<{couleur: string; echelle?: number; peau?: string}> = (
  {couleur, echelle = 1, peau = '#8A5A3C'}) => (
  <g transform={`scale(${echelle})`}>
    <path d="M -46 0 C -46 -48 -26 -66 0 -66 C 26 -66 46 -48 46 0 Z" fill={couleur} />
    <path d="M -46 0 C -46 -48 -26 -66 0 -66 C 26 -66 46 -48 46 0 Z" fill="#fff" opacity={0.12} />
    <circle cx={0} cy={-92} r={26} fill={peau} />
    <path d="M -26 -96 C -24 -122 24 -122 26 -96 C 18 -108 -18 -108 -26 -96 Z" fill="#1E1410" />
  </g>
);

// Gros texte lisible sur un téléphone : Montserrat 900, contour épais (blanc par défaut) derrière le remplissage.
export const Gros: React.FC<{x: number; y: number; taille: number; couleur?: string; contour?: string;
  ancre?: 'start' | 'middle' | 'end'; opacite?: number; children: React.ReactNode}> = (
  {x, y, taille, couleur = '#fff', contour = '#14141F', ancre = 'middle', opacite = 1, children}) => (
  <text x={x} y={y} textAnchor={ancre} fontFamily={POLICE_SVG} fontWeight={900} fontSize={taille} fill={couleur}
    stroke={contour} strokeWidth={taille * 0.16} strokeLinejoin="round" style={{paintOrder: 'stroke'}}
    opacity={opacite}>{children}</text>
);

// Téléphone (coque, écran, encoche) ; le contenu est dessiné dans le repère de l'écran (0, 0 = coin haut gauche).
export const Telephone: React.FC<React.PropsWithChildren<{x: number; y: number; l: number; h: number;
  ecran?: string}>> = ({x, y, l, h, ecran = '#F6F6FB', children}) => {
  const b = 18;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={l} height={h} rx={58} fill="#14141F" />
      <rect x={4} y={4} width={l - 8} height={h - 8} rx={54} fill="#2A2A3C" />
      <rect x={b} y={b} width={l - 2 * b} height={h - 2 * b} rx={40} fill={ecran} />
      <svg x={b} y={b} width={l - 2 * b} height={h - 2 * b} overflow="hidden">{children}</svg>
      <rect x={l / 2 - 50} y={b + 8} width={100} height={18} rx={9} fill="#14141F" />
      <rect x={l - 4} y={150} width={6} height={70} rx={3} fill="#14141F" />
    </g>
  );
};

// Confettis qui éclatent depuis (x, y) à partir de l'image a.
export const Confettis: React.FC<{t: number; a: number; x: number; y: number; n?: number; graine?: string}> = (
  {t, a, x, y, n = 40, graine = 'c'}) => {
  if (t < a) return null;
  const u = t - a;
  const couleurs = ['#FFD400', '#FF4D6D', '#22C55E', '#38C6FF', '#fff', '#F0560F', '#B57BFF'];
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const ang = (i / n) * Math.PI * 2 + Math.sin(i * 7.3) * 0.4;
        const v = 14 + ((i * 37) % 13);
        const px = x + Math.cos(ang) * v * u * 0.9;
        const py = y + Math.sin(ang) * v * u * 0.9 + 0.55 * u * u;
        const o = Math.max(0, 1 - u / 40);
        return <rect key={`${graine}${i}`} x={px - 15} y={py - 8} width={30} height={16} rx={4}
          fill={couleurs[i % couleurs.length]} opacity={o} transform={`rotate(${u * (8 + (i % 5) * 4)} ${px} ${py})`} />;
      })}
    </g>
  );
};

// Pastille d'icône (carré arrondi coloré + dessin blanc).
export const Pastille: React.FC<React.PropsWithChildren<{x: number; y: number; c: string; k?: number; taille?: number}>> = (
  {x, y, c, k = 1, taille = 110, children}) => (
  <g transform={`translate(${x} ${y}) scale(${k * taille / 110})`} opacity={k > 0 ? 1 : 0}>
    <rect x={-55} y={-55} width={110} height={110} rx={28} fill="#fff" />
    <rect x={-49} y={-49} width={98} height={98} rx={24} fill={c} />
    <rect x={-49} y={-49} width={98} height={48} rx={24} fill="#fff" opacity={0.18} />
    {children}
  </g>
);

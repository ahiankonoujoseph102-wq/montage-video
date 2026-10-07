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

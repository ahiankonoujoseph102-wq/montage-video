import React from 'react';
import {Easing} from 'remotion';
import {Defs, Gros, lin, Pastille, Personne, pop, prog, type PropsScene} from './outils';

// b. « Toute une équipe… une seule personne » : cinq spécialistes apparaissent, chacun avec son outil (étape 0),
// puis ils se rejoignent au centre et fusionnent en une seule grande personne, marquée « IA », autour de laquelle
// tournent les cinq outils (étape 1).
const ID = 'equ';
const COULEURS = ['#1D7CF2', '#F0560F', '#7B2FF7', '#0E9F6E', '#E0337E'];
const NOMS = ['CODE', 'DATA', 'DESIGN', 'PUB', 'VIDÉO'];
const XS = [140, 320, 500, 680, 860];

// Dessins blancs des outils, centrés sur (0, 0), dans une pastille de 110 px.
export const Outil: React.FC<{i: number}> = ({i}) => {
  const b = {fill: 'none', stroke: '#fff', strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (i) {
    case 0: return <g {...b}><polyline points="-14,-18 -32,0 -14,18" /><polyline points="14,-18 32,0 14,18" />
      <line x1={6} y1={-24} x2={-6} y2={24} /></g>;
    case 1: return <g fill="#fff">{[[-28, 6, 20], [-8, -8, 34], [12, -22, 48]].map(([x, y, h]) => (
      <rect key={x} x={x} y={y} width={16} height={h} rx={4} />))}<rect x={-34} y={28} width={68} height={6} rx={3} /></g>;
    case 2: return <g><path d="M 0 -30 C 30 -30 36 -6 30 4 C 24 14 12 4 8 16 C 4 28 -6 32 -14 30 C -36 24 -38 -30 0 -30 Z"
      fill="#fff" />{[['#FF4D6D', -14, -12], ['#FFD400', 2, -18], ['#22C55E', 18, -8]].map(([c, x, y]) => (
        <circle key={String(c)} cx={Number(x)} cy={Number(y)} r={6} fill={String(c)} />))}</g>;
    case 3: return <g><path d="M -30 -8 L -6 -8 L 22 -26 L 22 26 L -6 8 L -30 8 Z" fill="#fff" />
      <path d="M -24 8 L -16 28 L -6 28 L -10 8" fill="#fff" />
      <path d="M 30 -10 Q 38 0 30 10" {...b} strokeWidth={6} /></g>;
    default: return <g><rect x={-32} y={-18} width={46} height={36} rx={8} fill="#fff" />
      <path d="M 18 -6 L 34 -16 L 34 16 L 18 6 Z" fill="#fff" /></g>;
  }
};

export const Equipe: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 40, e1 = 95] = etapes;
  const fusion = prog(t, e1, 12, Easing.inOut(Easing.cubic));
  const kSeul = pop(t, e1 + 10, 200);
  const flash = t >= e1 + 10 ? Math.max(0, 1 - (t - e1 - 10) / 10) : 0;
  const tour = (t - e1) / 40; // rotation des outils autour de la personne
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {/* Titre qui change à la fusion. */}
      <g>
        <Gros x={500} y={292} taille={70} opacite={1 - fusion} contour="#0B1E6B">TOUTE UNE ÉQUIPE</Gros>
        <Gros x={500} y={292} taille={76} couleur="#FFD400" opacite={kSeul > 0 ? 1 : 0} contour="#0B1E6B">
          1 SEULE PERSONNE
        </Gros>
      </g>
      {/* Les cinq spécialistes. */}
      {t < e1 + 12 ? XS.map((x0, i) => {
        const k = pop(t, 2 + i * 3, 240);
        const ko = pop(t, e0 + i * 3, 260);
        const x = x0 + (500 - x0) * fusion;
        const saut = Math.abs(Math.sin((t + i * 9) / 7)) * 10 * (1 - fusion);
        return (
          <g key={i} opacity={(k > 0 ? 1 : 0) * (1 - fusion * fusion)}>
            <g transform={`translate(${x} ${790 - saut}) scale(${1.7 * k * (1 - 0.4 * fusion)})`} filter={`url(#ombre${ID})`}>
              <Personne couleur={COULEURS[i]} />
            </g>
            <Pastille x={x} y={500 - saut + 60 * fusion} c={COULEURS[i]} k={ko * (1 - fusion)} taille={104}>
              <Outil i={i} />
            </Pastille>
            <Gros x={x} y={862} taille={36} opacite={lin(t, e0 + i * 3 + 2, e0 + i * 3 + 6, 0, 1) * (1 - fusion)}
              contour="#0B1E6B">{NOMS[i]}</Gros>
          </g>
        );
      }) : null}
      {/* La personne unique, avec un halo et l'éclair « IA ». */}
      {t >= e1 + 8 ? (
        <g>
          <circle cx={500} cy={640} r={260 * kSeul} fill="#FFD400" opacity={0.18 + 0.06 * Math.sin(t / 5)} />
          <circle cx={500} cy={640} r={190 * kSeul} fill="#fff" opacity={0.12} />
          {/* Outils derrière la personne (moitié haute de l'orbite). */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = tour + (i / 5) * Math.PI * 2;
            if (Math.sin(a) >= 0) return null;
            return <Pastille key={i} x={500 + 340 * Math.cos(a)} y={620 + 150 * Math.sin(a)} c={COULEURS[i]}
              k={pop(t, e1 + 12 + i * 2) * (0.8 + 0.2 * Math.sin(a))} taille={96}><Outil i={i} /></Pastille>;
          })}
          <g transform={`translate(500 860) scale(${2.7 * kSeul})`} filter={`url(#ombre${ID})`}>
            <Personne couleur="#1D5BFF" />
            <path d="M 6 -54 L -10 -28 L 0 -28 L -6 -8 L 12 -36 L 2 -36 L 8 -54 Z" fill="#FFD400" stroke="#fff"
              strokeWidth={2} />
          </g>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = tour + (i / 5) * Math.PI * 2;
            if (Math.sin(a) < 0) return null;
            return <Pastille key={i} x={500 + 340 * Math.cos(a)} y={620 + 150 * Math.sin(a)} c={COULEURS[i]}
              k={pop(t, e1 + 12 + i * 2) * (0.8 + 0.2 * Math.sin(a))} taille={96}><Outil i={i} /></Pastille>;
          })}
        </g>
      ) : null}
      <rect width={1080} height={960} fill="#fff" opacity={0.6 * flash} />
    </svg>
  );
};

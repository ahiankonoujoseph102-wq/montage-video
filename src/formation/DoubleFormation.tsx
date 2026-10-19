import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {etatDouble, type EtapeExpression, type EtapeGeste} from '../../double-anime/src/commun/animationDouble';
import {COULEURS, MISE_EN_PAGE} from '../../double-anime/src/theme';
import {Bureau2D, Decor2D} from '../../double-anime/src/v2d/Decor2D';
import {BrasDouble2D, Double2D} from '../../double-anime/src/v2d/Double2D';
import {NUIT} from './commun';

// Double animé de Joseph dans la scène de la série (double-anime/, inchangée : décor, écran, personnage, bureau,
// bras — même ordre que Scene2D) aux moments clés de la formation (clé « double » de formation_props.json,
// scripts/double_formation.py). Le plan en cours (carte, carton, publicité) se range dans l'écran du décor ;
// la scène est réduite (0,88) pour tenir dans la zone sûre, au-dessus de la bande des sous-titres.
export type PropsDouble = {presences: [number, number][]; cadres: [number, number, number][];
  gestes: EtapeGeste[]; expressions: EtapeExpression[]; bouche: number[]; visemes: string};

const FONDU = 8; // images d'entrée et de sortie
const E = MISE_EN_PAGE.ecran; // écran du décor (x 110, y 240, 860 × 600)
const SC = 0.882; // la scène, du haut de l'écran (222) au bas du bureau (1728), tient entre 200 et 1530
const OX = 540 * (1 - SC);
const OY = 200 - 222 * SC;
const ECRAN = {x: E.x * SC + OX, y: E.y * SC + OY, l: E.l * SC, h: E.h * SC};
const lisse = Easing.inOut(Easing.cubic);

const presence = (d: PropsDouble | undefined, f: number) => {
  if (!d) return 0;
  for (const [a, b] of d.presences) {
    if (f >= a && f < b) return lisse(Math.max(0, Math.min(1, (f - a + 1) / FONDU, (b - f) / FONDU)));
  }
  return 0;
};

// Plan → écran : le contenu (y A–B, sur 1000 px de large : les titres débordent parfois de la zone sûre) remplit
// l'écran, centré.
const rangement = (A: number, B: number) => {
  const s = Math.min(ECRAN.l / 1000, ECRAN.h / (B - A));
  return {s, tx: ECRAN.x + ECRAN.l / 2 - 540 * s, ty: ECRAN.y + ECRAN.h / 2 - ((A + B) / 2) * s};
};

const rangementA = (d: PropsDouble, f: number) => {
  let i = -1;
  for (let j = 0; j < d.cadres.length; j++) if (d.cadres[j][0] <= f) i = j;
  if (i < 0) return rangement(200, 1300);
  const cible = rangement(d.cadres[i][1], d.cadres[i][2]);
  if (i === 0) return cible;
  const avant = rangement(d.cadres[i - 1][1], d.cadres[i - 1][2]);
  const u = lisse(Math.min(1, (f - d.cadres[i][0]) / FONDU));
  return {s: avant.s + (cible.s - avant.s) * u, tx: avant.tx + (cible.tx - avant.tx) * u,
    ty: avant.ty + (cible.ty - avant.ty) * u};
};

const Scene: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{transform: `translate(${OX}px, ${OY}px) scale(${SC})`, transformOrigin: '0 0'}}>
    {children}
  </AbsoluteFill>
);

// Plateau du bureau de la série (mêmes couleurs que Bureau2D), sans la tasse ni l'ordinateur.
const Plateau: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <rect x={0} y={1600} width={1080} height={122} fill="#232b58" />
    <rect x={0} y={1600} width={1080} height={10} fill="#2c3570" />
    <rect x={0} y={1718} width={1080} height={10} fill={COULEURS.or} />
    <rect x={0} y={1728} width={1080} height={192} fill="#121836" />
  </svg>
);

// Fond du studio : décor de la série (mur, fenêtre au crépuscule, étagère, plante, cadre de l'écran).
export const StudioDecor: React.FC<{d?: PropsDouble}> = ({d}) => {
  const f = useCurrentFrame();
  if (presence(d, f) <= 0) return null;
  return (
    <AbsoluteFill style={{background: COULEURS.nuitMur}}>
      <AbsoluteFill style={{top: 1600 * SC + OY, background: '#121836'}} />
      {/* Le décor (mur, fenêtre, plante) et le plateau du bureau prolongés en miroir sur les côtés, assombris : pas de
          bande unie (sans la tasse ni l'ordinateur, qui seraient dédoublés). */}
      <AbsoluteFill style={{transform: `translate(${OX}px, ${OY}px) scale(${-SC}, ${SC})`, transformOrigin: '0 0'}}>
        <Decor2D /><Plateau />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${OX + 2 * 1080 * SC}px, ${OY}px) scale(${-SC}, ${SC})`,
        transformOrigin: '0 0'}}>
        <Decor2D /><Plateau />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: OX + 2, height: 1920,
        background: `linear-gradient(to right, ${COULEURS.nuitMur}d0, ${COULEURS.nuitMur}40)`}} />
      <div style={{position: 'absolute', right: 0, top: 0, width: OX + 2, height: 1920,
        background: `linear-gradient(to left, ${COULEURS.nuitMur}d0, ${COULEURS.nuitMur}40)`}} />
      <Scene><Decor2D /></Scene>
      <div style={{position: 'absolute', left: ECRAN.x, top: ECRAN.y, width: ECRAN.l, height: ECRAN.h, background: NUIT,
        borderRadius: 14}} />
    </AbsoluteFill>
  );
};

// Plans et cartons : rangés dans l'écran du décor pendant les apparitions du double.
export const Partage: React.FC<{d?: PropsDouble; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  const u = presence(d, f);
  if (!d || u <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = rangementA(d, f);
  const s = 1 + (r.s - 1) * u;
  const m = (v: number) => v * u;
  const clip = `inset(${m(ECRAN.y)}px ${m(1080 - ECRAN.x - ECRAN.l)}px ${m(1920 - ECRAN.y - ECRAN.h)}px ${m(ECRAN.x)}px round ${m(14)}px)`;
  return (
    <AbsoluteFill style={{clipPath: clip}}>
      <AbsoluteFill style={{transform: `translate(${m(r.tx)}px, ${m(r.ty)}px) scale(${s})`, transformOrigin: '0 0'}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Le personnage, son bureau et ses bras, par-dessus.
export const DoubleFormation: React.FC<{d?: PropsDouble}> = ({d}) => {
  const f = useCurrentFrame();
  const u = presence(d, f);
  if (!d || u <= 0) return null;
  const etat = etatDouble(f / 30, d.gestes, d.expressions, d.bouche, d.visemes, 30);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, u * 1.4)}}>
      <Scene>
        <Double2D etat={etat} />
        <Bureau2D />
        <BrasDouble2D etat={etat} />
      </Scene>
    </AbsoluteFill>
  );
};

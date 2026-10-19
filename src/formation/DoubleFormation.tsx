import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {etatDouble, type EtapeExpression, type EtapeGeste} from '../../double-anime/src/commun/animationDouble';
import {BrasDouble2D, Double2D} from '../../double-anime/src/v2d/Double2D';
import {FondNuit} from './commun';

// Double animé de Joseph (personnage de double-anime/, inchangé) aux moments clés de la formation
// (données : clé « double » de formation_props.json, scripts/double_formation.py).
// Quand il est là, le plan est réduit et remonté juste assez pour lui laisser sa place entre le contenu et la bande
// des sous-titres ; il reste dans la zone sûre (x 50–950, y 200–1530).
type Teinte = 'nuit' | 'violet' | 'vert' | 'orange';
export type PropsDouble = {presences: [number, number][]; bas: [number, number, number, number, Teinte][];
  cartons: {numero: number; fin: number}[]; gestes: EtapeGeste[]; expressions: EtapeExpression[]; bouche: number[];
  visemes: string};

const FONDU = 8; // images d'entrée et de sortie
const HAUT = 200;
const BAS = 1530; // haut de la bande des sous-titres (1548), moins une marge
const ECART = 20;
const CADRE = {x: 150, y: 930, l: 780, h: 800}; // partie utile du dessin (coordonnées du personnage)
const CENTRE_X = 500; // milieu de la zone sûre
const ECHELLE_MAX = 1.08; // 842 px de large au plus
const lisse = Easing.inOut(Easing.cubic);

const presence = (d: PropsDouble, f: number) => {
  for (const [a, b] of d.presences) {
    if (f >= a && f < b) return lisse(Math.max(0, Math.min(1, (f - a + 1) / FONDU, (b - f) / FONDU)));
  }
  return 0;
};

// Réduction du plan pour un contenu de A à B (px) et une zone d'au moins hmin px pour le double.
const disposition = (A: number, B: number, hmin: number) => {
  const limite = BAS - hmin - ECART;
  if (B <= limite) return {s: 1, ty: 0, bas: B};
  const s = Math.min(1, (limite - HAUT) / (B - A));
  return {s, ty: HAUT - A * s, bas: HAUT + (B - A) * s};
};

const etatPlace = (d: PropsDouble, f: number) => {
  let i = -1;
  for (let j = 0; j < d.bas.length; j++) if (d.bas[j][0] <= f) i = j;
  if (i < 0) return {s: 1, ty: 0, bas: BAS - 900, teinte: 'nuit' as Teinte};
  const [t, A, B, h, teinte] = d.bas[i];
  const cible = disposition(A, B, h);
  if (i === 0) return {...cible, teinte};
  const avant = disposition(d.bas[i - 1][1], d.bas[i - 1][2], d.bas[i - 1][3]);
  const u = lisse(Math.min(1, (f - t) / FONDU));
  const m = (a: number, b: number) => a + (b - a) * u;
  return {s: m(avant.s, cible.s), ty: m(avant.ty, cible.ty), bas: m(avant.bas, cible.bas), teinte};
};

// Plans et cartons : réduits pendant les apparitions, bords fondus sur un fond de même teinte.
export const Partage: React.FC<{d?: PropsDouble; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  const u = d ? presence(d, f) : 0;
  if (!d || u <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = etatPlace(d, f);
  const s = 1 + (p.s - 1) * u;
  if (s > 0.999 && Math.abs(p.ty * u) < 0.5) return <AbsoluteFill>{children}</AbsoluteFill>;
  const ty = p.ty * u;
  const m = Math.min(12, (1 - s) * 60);
  const masque = (sens: string) => `linear-gradient(${sens}, transparent 0%, #000 ${m}%, #000 ${100 - m}%, transparent 100%)`;
  return (
    <AbsoluteFill>
      <FondNuit teinte={p.teinte} />
      <AbsoluteFill style={{transform: `translate(${540 * (1 - s)}px, ${ty}px) scale(${s})`, transformOrigin: '0 0'}}>
        <AbsoluteFill style={{WebkitMaskImage: masque('to right'), maskImage: masque('to right')}}>
          <AbsoluteFill style={{WebkitMaskImage: masque('to bottom'), maskImage: masque('to bottom')}}>
            {children}
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Le personnage, posé derrière un bout de bureau, pied de l'image sur la bande des sous-titres.
export const DoubleFormation: React.FC<{d?: PropsDouble}> = ({d}) => {
  const f = useCurrentFrame();
  if (!d) return null;
  const u = presence(d, f);
  if (u <= 0) return null;
  const p = etatPlace(d, f);
  const echelle = Math.min(ECHELLE_MAX, (BAS - p.bas - ECART) / CADRE.h);
  const etat = etatDouble(f / 30, d.gestes, d.expressions, d.bouche, d.visemes, 30);
  return (
    <div style={{position: 'absolute', left: CENTRE_X - (CADRE.l * echelle) / 2, top: BAS - CADRE.h * echelle,
      width: CADRE.l * echelle, height: CADRE.h * echelle, opacity: u,
      transform: `scale(${0.94 + 0.06 * u})`, transformOrigin: '50% 100%'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: CADRE.l, height: CADRE.h, overflow: 'hidden',
        transform: `scale(${echelle})`, transformOrigin: '0 0'}}>
        <div style={{position: 'absolute', left: -CADRE.x, top: -CADRE.y, width: 1080, height: 1920}}>
          <Double2D etat={etat} />
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="bureauDouble" x1="0" x2="1">
                <stop offset="0" stopColor="#232b58" stopOpacity={0} />
                <stop offset="0.12" stopColor="#232b58" />
                <stop offset="0.88" stopColor="#232b58" />
                <stop offset="1" stopColor="#232b58" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bordDouble" x1="0" x2="1">
                <stop offset="0" stopColor="#feca26" stopOpacity={0} />
                <stop offset="0.12" stopColor="#feca26" />
                <stop offset="0.88" stopColor="#feca26" />
                <stop offset="1" stopColor="#feca26" stopOpacity={0} />
              </linearGradient>
            </defs>
            <rect x={CADRE.x} y={1600} width={CADRE.l} height={118} fill="url(#bureauDouble)" />
            <rect x={CADRE.x} y={1718} width={CADRE.l} height={10} fill="url(#bordDouble)" />
          </svg>
          <BrasDouble2D etat={etat} />
        </div>
      </div>
    </div>
  );
};

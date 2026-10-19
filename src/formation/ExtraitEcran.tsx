import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {POLICE} from '../charte';
import {FondNuit, NUIT, OR, Z} from './commun';

// Extrait d'enregistrement d'écran (1080 × 2400, muet, déjà coupé, accéléré et flouté par scripts/extraits.py),
// posé dans l'image 1080 × 1920 avec un zoom animé sur la zone utile, et un compteur « accéléré » pendant les
// passages accélérés. Zoom : `zoom` = échelle de l'écran (0,85 : l'écran entier tient en hauteur),
// (`x`, `y`) = point de l'écran (pixels de la source) placé au centre de l'image.
export type ZoomExtrait = {image: number; zoom: number; x: number; y: number};
export type PropsExtrait = {video: string; dureeImages: number; zooms: ZoomExtrait[];
  acceleres: {debut: number; fin: number; facteur: number}[]};

const L = 1080;
const H = 2400;

const cadrage = (f: number, zooms: ZoomExtrait[]) => {
  const pts = zooms.length ? zooms : [{image: 0, zoom: 0.85, x: 540, y: 1200}];
  let a = pts[0];
  let b = pts[0];
  for (const p of pts) {
    if (p.image <= f) a = p;
    if (p.image >= f) {
      b = p;
      break;
    }
    b = p;
  }
  const u = b.image === a.image ? 1 : interpolate(f, [a.image, b.image], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const z = a.zoom + (b.zoom - a.zoom) * u;
  const cx = a.x + (b.x - a.x) * u;
  const cy = a.y + (b.y - a.y) * u;
  // Position : le point (cx, cy) au centre, sans laisser de vide quand l'écran dépasse l'image.
  const w = L * z;
  const h = H * z;
  let x = 540 - cx * z;
  let y = 960 - cy * z;
  x = w <= 1080 ? (1080 - w) / 2 : Math.min(0, Math.max(1080 - w, x));
  y = h <= 1920 ? (1920 - h) / 2 : Math.min(0, Math.max(1920 - h, y));
  return {z, x, y};
};

export const ExtraitEcran: React.FC<PropsExtrait> = ({video, zooms, acceleres}) => {
  const f = useCurrentFrame();
  const {z, x, y} = cadrage(f, zooms);
  const acc = acceleres.find((a) => f >= a.debut && f < a.fin);
  const coins = z < 1 ? 38 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <FondNuit />
      <div style={{position: 'absolute', left: x, top: y, width: L, height: H, transform: `scale(${z})`,
        transformOrigin: '0 0', borderRadius: coins / z, overflow: 'hidden',
        boxShadow: z < 1 ? '0 30px 80px rgba(0,0,0,0.6)' : 'none'}}>
        <OffthreadVideo src={staticFile(video)} muted style={{width: L, height: H}} />
      </div>
      {acc ? (
        <div style={{position: 'absolute', left: Z.gauche, top: Z.haut + 20, display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(7,10,36,0.88)', border: `4px solid ${OR}`, borderRadius: 40, padding: '10px 26px 10px 18px'}}>
          <svg width={56} height={40} viewBox="0 0 56 40">
            <path d="M4 4 L26 20 L4 36 Z M28 4 L50 20 L28 36 Z" fill={OR} opacity={0.6 + 0.4 * Math.abs(Math.sin(f / 5))} />
          </svg>
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: '#fff'}}>ACCÉLÉRÉ</span>
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: NUIT, background: OR, borderRadius: 14,
            padding: '0 12px'}}>×{acc.facteur}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

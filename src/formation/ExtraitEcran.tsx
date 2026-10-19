import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {POLICE} from '../charte';
import {FondNuit, NUIT, OR, prog, Z} from './commun';

// Extrait d'enregistrement d'écran (1080 × 2400, muet, déjà coupé, accéléré et flouté par scripts/extraits.py),
// posé dans l'image 1080 × 1920 avec un zoom animé sur la zone utile, et un compteur « accéléré » pendant les
// passages accélérés. Zoom : `zoom` = échelle de l'écran (0,85 : l'écran entier tient en hauteur),
// (`x`, `y`) = point de l'écran (pixels de la source) placé au centre de l'image.
export type ZoomExtrait = {image: number; zoom: number; x: number; y: number};
// `depart` : image de l'extrait où commencer ; au-delà de la fin, la dernière image reste figée.
// `hauteurVue` : hauteur de la zone d'image (le reste, en bas, est laissé aux sous-titres).
// `reperes` : cercle ou flèche animés sur le bouton à toucher (x, y en pixels de la source), de `image` à `fin`.
export type Repere = {image: number; fin: number; x: number; y: number; forme: 'cercle' | 'fleche'; angle?: number;
  texte?: string};
export type PropsExtrait = {video: string; dureeImages: number; zooms: ZoomExtrait[];
  acceleres: {debut: number; fin: number; facteur: number}[]; depart?: number; hauteurVue?: number; reperes?: Repere[]};

// Étiquette du bouton (« Nouveau projet », « 9:16 »…), au-dessus du repère, ou dessous s'il est trop haut.
const Etiquette: React.FC<{texte: string; X: number; Y: number; k: number; ecart: number}> = ({texte, X, Y, k, ecart}) => {
  const dessous = Y - ecart < 330;
  const l = Math.min(900, texte.length * 27 + 60);
  const x = Math.max(Z.gauche, Math.min(Z.droite - l, X - l / 2));
  return (
    <div style={{position: 'absolute', left: x, width: l, top: dessous ? Y + ecart : Y - ecart - 72, height: 72,
      display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `scale(${k})`}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: NUIT, background: OR, borderRadius: 18,
        padding: '4px 20px', border: '4px solid #000', whiteSpace: 'nowrap'}}>{texte}</span>
    </div>
  );
};

// Repère jaune : cercle qui se trace puis pulse, ou flèche épaisse qui pointe le bouton en rebondissant.
const RepereAnime: React.FC<{r: Repere; f: number; X: number; Y: number}> = ({r, f, X, Y}) => {
  const k = Math.min(prog(f, r.image, 8), 1 - prog(f, r.fin - 6, 6));
  if (k <= 0) return null;
  const etiquette = r.texte ? <Etiquette texte={r.texte} X={X} Y={Y} k={k} ecart={r.forme === 'cercle' ? 100 : 120} /> : null;
  const pulse = 1 + 0.08 * Math.sin((f - r.image) / 3.2);
  if (r.forme === 'cercle') {
    const trace = prog(f, r.image, 10);
    return (
      <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
        <circle cx={X} cy={Y} r={78 * pulse} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={20} />
        <circle cx={X} cy={Y} r={78 * pulse} fill="none" stroke={OR} strokeWidth={12} pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - trace} strokeLinecap="round" transform={`rotate(-90 ${X} ${Y})`} />
      </svg>
      {etiquette}
      </>
    );
  }
  const a = r.angle ?? 135; // direction d'où vient la flèche (degrés, 0 = de la droite, 90 = du bas)
  const rebond = 14 * Math.abs(Math.sin((f - r.image) / 4));
  return (
    <>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
      <g transform={`translate(${X} ${Y}) rotate(${a}) translate(${36 + rebond} 0)`}>
        <path d="M0,0 L58,-44 L58,-20 L170,-20 L170,20 L58,20 L58,44 Z" fill={OR} stroke="#000" strokeWidth={8}
          strokeLinejoin="round" />
      </g>
    </svg>
    {etiquette}
    </>
  );
};

const L = 1080;
// Écran recadré en hauteur : les lignes coupées en haut et en bas s'effacent en fondu.
const FONDU_BORDS = 'linear-gradient(to bottom, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)';
const H = 2400;

const cadrage = (f: number, zooms: ZoomExtrait[], hv: number) => {
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
  const ajuste = (z: number) => (z < 1 ? (hv / H) * (z / 0.85) : z);
  // Jamais plus que la largeur de l'écran (zoom 1) : une ligne de texte n'est jamais coupée sur les bords.
  const z = Math.min(1, ajuste(a.zoom) + (ajuste(b.zoom) - ajuste(a.zoom)) * u);
  const cx = a.x + (b.x - a.x) * u;
  const cy = a.y + (b.y - a.y) * u;
  // Position : le point (cx, cy) au centre, sans laisser de vide quand l'écran dépasse l'image.
  const w = L * z;
  const h = H * z;
  let x = 540 - cx * z;
  let y = hv / 2 - cy * z;
  x = w <= 1080 ? (1080 - w) / 2 : Math.min(0, Math.max(1080 - w, x));
  y = h <= hv ? (hv - h) / 2 : Math.min(0, Math.max(hv - h, y));
  return {z, x, y};
};

export const ExtraitEcran: React.FC<PropsExtrait> = ({video, dureeImages, zooms, acceleres, depart = 0, hauteurVue = 1920,
  reperes = []}) => {
  const f = Math.min(useCurrentFrame() + depart, dureeImages - 1);
  const fige = useCurrentFrame() + depart >= dureeImages - 1;
  const {z, x, y} = cadrage(f, zooms, hauteurVue);
  const acc = acceleres.find((a) => f >= a.debut && f < a.fin);
  const coins = z < 1 ? 38 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <FondNuit />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: hauteurVue, overflow: 'hidden',
        ...(H * z > hauteurVue + 1 ? {WebkitMaskImage: FONDU_BORDS, maskImage: FONDU_BORDS} : {})}}>
        <div style={{position: 'absolute', left: x, top: y, width: L, height: H, transform: `scale(${z})`,
          transformOrigin: '0 0', borderRadius: coins / z, overflow: 'hidden',
          boxShadow: z < 1 ? '0 30px 80px rgba(0,0,0,0.6)' : 'none'}}>
          <Freeze frame={f} active={fige || depart > 0}>
            <OffthreadVideo src={staticFile(video)} muted style={{width: L, height: H}} />
          </Freeze>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: hauteurVue, overflow: 'hidden'}}>
        {reperes.map((r, i) => <RepereAnime key={i} r={r} f={f} X={x + r.x * z} Y={y + r.y * z} />)}
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

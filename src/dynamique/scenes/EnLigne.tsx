import React from 'react';
import {Defs, Gros, lin, Personne, POLICE_SVG, pop, type PropsScene} from './outils';

// j. « Nous suivre en direct sur Google Meet… peu importe votre pays » : un globe qui tourne et un badge « EN
// DIRECT » ; sur l'étape 0, un ordinateur avec une grille de visioconférence (nom de l'outil en texte, sans logo) ;
// sur l'étape 1, des arcs relient les pays du globe et « PARTOUT » apparaît.
const ID = 'enl';
const G = {x: 255, y: 600, r: 215};
const VILLES = [[10, 6], [40, 18], [-20, 40], [80, -10], [120, 30], [-60, 10], [170, -20], [-110, 35], [200, 50],
  [-150, -25], [260, 10], [300, 45]];

const projette = (lon: number, lat: number, rot: number) => {
  const l = ((lon + rot) * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  return {x: G.x + G.r * Math.cos(p) * Math.sin(l), y: G.y - G.r * Math.sin(p), z: Math.cos(p) * Math.cos(l)};
};

const Globe: React.FC<{t: number; arcs: number}> = ({t, arcs}) => {
  const rot = t * 1.6;
  const pts = VILLES.map(([lon, lat]) => projette(lon, lat, rot));
  const visibles = pts.filter((p) => p.z > 0.1);
  return (
    <g>
      <defs>
        <radialGradient id={`gl${ID}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5EC8FF" /><stop offset="100%" stopColor="#0B3BA8" />
        </radialGradient>
        <clipPath id={`cl${ID}`}><circle cx={G.x} cy={G.y} r={G.r} /></clipPath>
      </defs>
      <circle cx={G.x} cy={G.y} r={G.r + 30} fill="#5EC8FF" opacity={0.2 + 0.08 * Math.sin(t / 6)} />
      <circle cx={G.x} cy={G.y} r={G.r} fill={`url(#gl${ID})`} />
      <g clipPath={`url(#cl${ID})`}>
        {/* Continents stylisés qui défilent. */}
        {[[0, -20, 90, 120], [110, 20, 70, 90], [200, -40, 110, 70], [290, 30, 60, 60]].map(([lon, lat, l, h], i) => {
          const p = projette(lon, lat, rot);
          if (p.z <= -0.2) return null;
          return <ellipse key={i} cx={p.x} cy={p.y} rx={(l / 2) * Math.max(0.2, p.z)} ry={h / 2} fill="#3CCB6C"
            opacity={0.9} />;
        })}
        {/* Méridiens et parallèles. */}
        {[0, 45, 90, 135].map((m) => {
          const c = Math.cos(((m + rot) * Math.PI) / 180);
          return <ellipse key={m} cx={G.x} cy={G.y} rx={Math.abs(G.r * c)} ry={G.r} fill="none" stroke="#fff"
            strokeOpacity={0.3} strokeWidth={3} />;
        })}
        {[-50, 0, 50].map((y) => <ellipse key={y} cx={G.x} cy={G.y - (G.r * y) / 90} rx={G.r * Math.cos((y * Math.PI) / 180)}
          ry={18} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={3} />)}
      </g>
      {/* Arcs entre les villes visibles. */}
      {visibles.slice(0, -1).map((a, i) => {
        const b = visibles[i + 1];
        const mx = (a.x + b.x) / 2 + (((a.x + b.x) / 2 - G.x) * 0.5);
        const my = (a.y + b.y) / 2 + (((a.y + b.y) / 2 - G.y) * 0.5) - 40;
        const k = Math.min(1, Math.max(0, arcs * visibles.length - i));
        return k > 0 ? <path key={i} d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke="#FFD400"
          strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} /> : null;
      })}
      {pts.map((p, i) => p.z > 0 ? (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={14 * p.z * (1 + 0.3 * Math.sin(t / 3 + i))} fill="#FFD400" opacity={0.3} />
          <circle cx={p.x} cy={p.y} r={8 * p.z + 2} fill="#fff" />
        </g>
      ) : null)}
    </g>
  );
};

const COULEURS = ['#F0560F', '#7B2FF7', '#0E9F6E', '#E0337E'];

const Visio: React.FC<{t: number}> = ({t}) => {
  const parle = Math.floor(t / 20) % 4;
  return (
    <g>
      <rect x={-12} y={-12} width={444} height={294} rx={24} fill="#22223A" />
      <rect x={0} y={0} width={420} height={270} rx={14} fill="#10121F" />
      {COULEURS.map((c, i) => {
        const x = 10 + (i % 2) * 204;
        const y = 10 + Math.floor(i / 2) * 118;
        const k = pop(t, i * 3, 260);
        return (
          <g key={i} transform={`translate(${x + 98} ${y + 54}) scale(${k}) translate(${-98} ${-54})`}>
            <rect width={196} height={108} rx={12} fill={c} opacity={0.85} />
            <svg width={196} height={108} overflow="hidden">
              <g transform={`translate(98 ${118 + Math.sin((t + i * 7) / 6) * 3}) scale(0.95)`}><Personne couleur="#fff"
                peau={['#8A5A3C', '#C98E6B', '#6B4229', '#A86F4C'][i]} /></g>
            </svg>
            {parle === i ? <rect width={196} height={108} rx={12} fill="none" stroke="#22C55E" strokeWidth={6} /> : null}
          </g>
        );
      })}
      <path d="M -60 282 L 480 282 L 450 312 L -30 312 Z" fill="#33334A" />
      <rect x={160} y={286} width={100} height={10} rx={5} fill="#22223A" />
    </g>
  );
};

export const EnLigne: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 30, e1 = 90] = etapes;
  const kG = pop(t, 0, 180);
  const kV = pop(t, e0, 200);
  const arcs = lin(t, e1, e1 + 24, 0, 1);
  const point = 0.5 + 0.5 * Math.sin(t / 3);
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      <g transform={`translate(${G.x} ${G.y}) scale(${kG}) translate(${-G.x} ${-G.y})`}><Globe t={t} arcs={arcs} /></g>
      {/* Badge « EN DIRECT » */}
      <g transform={`translate(500 272) scale(${pop(t, 4)})`} filter={`url(#ombre${ID})`}>
        <rect x={-250} y={-52} width={500} height={98} rx={49} fill="#E2142D" />
        <circle cx={-190} cy={-3} r={20} fill="#fff" opacity={0.4 + 0.6 * point} />
        <text x={30} y={22} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={66} fill="#fff">EN DIRECT</text>
      </g>
      {t >= e0 ? (
        <g transform={`translate(${510 + (1 - kV) * 400} 440)`} opacity={kV > 0 ? 1 : 0} filter={`url(#ombre${ID})`}>
          <Visio t={t - e0} />
        </g>
      ) : null}
      <g transform={`translate(730 830) scale(${pop(t, e0 + 6)})`} opacity={t >= e0 + 6 ? 1 : 0}>
        <Gros x={0} y={0} taille={54} contour="#0B1E6B">GOOGLE MEET</Gros>
      </g>
      <g transform={`translate(${G.x} 875) scale(${pop(t, e1 + 4)})`} opacity={t >= e1 + 4 ? 1 : 0}>
        <Gros x={0} y={0} taille={72} couleur="#FFD400" contour="#0B1E6B">PARTOUT</Gros>
      </g>
    </svg>
  );
};

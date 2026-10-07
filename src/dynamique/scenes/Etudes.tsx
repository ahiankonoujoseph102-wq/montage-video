import React from 'react';
import {Easing} from 'remotion';
import {Defs, lin, Personne, POLICE_SVG, pop, prog, type PropsScene} from './outils';

// a. « Des années d'études… en un bref temps » : une pile de livres tombe, un calendrier dont les pages
// s'envolent (étape 0), puis tout s'efface devant une horloge qui s'emballe et une personne à son ordinateur
// (étape 1).
const LIVRES = [
  {l: 330, c: '#E63946', d: -8}, {l: 300, c: '#1D7CF2', d: 10}, {l: 340, c: '#F4A31B', d: -4},
  {l: 290, c: '#2BB673', d: 12}, {l: 320, c: '#8E44EC', d: -10}, {l: 280, c: '#13B5C9', d: 6},
];
const MOIS = ['JANV.', 'FÉVR.', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];
const H = 60;

const Livre: React.FC<{l: number; c: string}> = ({l, c}) => (
  <g>
    <rect x={-l / 2} y={-H} width={l} height={H} rx={9} fill={c} />
    <rect x={l / 2 - 26} y={-H + 7} width={20} height={H - 14} rx={3} fill="#FFF6E0" />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={l / 2 - 24} x2={l / 2 - 8} y1={-H + 14 + k * 10} y2={-H + 14 + k * 10}
      stroke="#D9C9A8" strokeWidth={2} />)}
    <rect x={-l / 2 + 18} y={-H} width={8} height={H} fill="#fff" opacity={0.35} />
    <rect x={-l / 2 + 32} y={-H} width={4} height={H} fill="#fff" opacity={0.25} />
    <rect x={-l / 2 + 70} y={-H + 18} width={l * 0.38} height={H - 36} rx={5} fill="#fff" opacity={0.3} />
    <rect x={-l / 2} y={-H} width={l} height={H / 2} rx={9} fill="#fff" opacity={0.12} />
    <rect x={-l / 2} y={-6} width={l} height={6} rx={3} fill="#000" opacity={0.18} />
  </g>
);

const Calendrier: React.FC<{t: number; e0: number}> = ({t, e0}) => {
  const n = t < e0 ? 0 : Math.floor((t - e0) / 3) + 1; // une page arrachée toutes les 3 images
  const page = (k: number) => (
    <g>
      <rect x={-150} y={-120} width={300} height={290} rx={18} fill="#fff" />
      <text x={0} y={-48} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={44} fill="#C81E3A">
        {MOIS[k % 12]}
      </text>
      <text x={0} y={95} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={140} fill="#1B1B2F">
        {((k * 7) % 28) + 1}
      </text>
      <text x={0} y={145} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={800} fontSize={26} fill="#8A8AA0">
        ANNÉE {Math.floor(k / 12) + 1}
      </text>
    </g>
  );
  return (
    <g>
      <rect x={-162} y={-200} width={324} height={392} rx={24} fill="#1B1B2F" opacity={0.25} transform="translate(8 14)" />
      <rect x={-160} y={-200} width={320} height={384} rx={24} fill="#F1F1F6" />
      <rect x={-160} y={-200} width={320} height={86} rx={24} fill="#E2324A" />
      <rect x={-160} y={-140} width={320} height={26} fill="#E2324A" />
      <text x={0} y={-140} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={38} fill="#fff">
        CALENDRIER
      </text>
      {[-90, 90].map((x) => <rect key={x} x={x - 12} y={-226} width={24} height={60} rx={12} fill="#33334A" />)}
      <g transform="translate(0 0)">{page(n)}</g>
      {/* Pages arrachées qui s'envolent en tournoyant. */}
      {Array.from({length: 4}).map((_, j) => {
        const k = n - 1 - j;
        if (k < 0) return null;
        const age = t - (e0 + k * 3);
        if (age < 0 || age > 12) return null;
        const a = age / 12;
        return (
          <g key={k} opacity={1 - a * a} transform={`translate(${a * (420 + (k % 3) * 80)} ${-a * (420 + (k % 2) * 140)}) rotate(${a * (k % 2 ? 160 : -140)}) scale(${1 - 0.4 * a})`}>
            {page(k)}
          </g>
        );
      })}
    </g>
  );
};

const Horloge: React.FC<{tt: number}> = ({tt}) => {
  // Les aiguilles accélèrent sans cesse : l'horloge s'emballe.
  const minutes = 6 * tt + 0.55 * tt * tt;
  const vitesse = 6 + 1.1 * tt; // degrés par image
  const trainee = Math.min(300, vitesse * 4);
  const r = 210;
  const sonne = Math.sin(tt * 1.7) * 14;
  const arc = (deg: number, longueur: number, rayon: number) => {
    const a0 = ((deg - longueur - 90) * Math.PI) / 180;
    const a1 = ((deg - 90) * Math.PI) / 180;
    return `M ${rayon * Math.cos(a0)} ${rayon * Math.sin(a0)} A ${rayon} ${rayon} 0 ${longueur > 180 ? 1 : 0} 1 ${
      rayon * Math.cos(a1)} ${rayon * Math.sin(a1)}`;
  };
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 130} ${-r - 10}) rotate(${s * 30 + sonne})`}>
          <path d="M -48 22 A 48 48 0 0 1 48 22 Z" fill="#FFC23D" />
          <path d="M -48 22 A 48 48 0 0 1 48 22 Z" fill="#fff" opacity={0.25} />
          <circle cy={-34} r={10} fill="#E28B00" />
        </g>
      ))}
      <rect x={-12} y={-r - 52} width={24} height={40} rx={8} fill="#E28B00" />
      <circle r={r + 26} fill="#F0560F" />
      <circle r={r + 26} fill="#fff" opacity={0.12} />
      <circle r={r} fill="#FFFDF6" />
      {Array.from({length: 60}).map((_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const long = i % 5 === 0 ? 30 : 12;
        return <line key={i} x1={(r - 14) * Math.sin(a)} y1={-(r - 14) * Math.cos(a)} x2={(r - 14 - long) * Math.sin(a)}
          y2={-(r - 14 - long) * Math.cos(a)} stroke={i % 5 === 0 ? '#1B1B2F' : '#B8B8C8'} strokeWidth={i % 5 === 0 ? 8 : 3}
          strokeLinecap="round" />;
      })}
      {/* Traînées des aiguilles qui tournent vite. */}
      <path d={arc(minutes % 360, trainee, r - 70)} stroke="#F0560F" strokeWidth={22} fill="none" opacity={0.35}
        strokeLinecap="round" />
      <path d={arc((minutes / 12) % 360, Math.min(200, trainee / 4), r - 120)} stroke="#1D7CF2" strokeWidth={22}
        fill="none" opacity={0.3} strokeLinecap="round" />
      <g transform={`rotate(${minutes / 12})`}>
        <rect x={-10} y={-r * 0.5} width={20} height={r * 0.5 + 16} rx={10} fill="#1B1B2F" />
      </g>
      <g transform={`rotate(${minutes})`}>
        <rect x={-7} y={-r * 0.82} width={14} height={r * 0.82 + 20} rx={7} fill="#E2324A" />
      </g>
      <circle r={20} fill="#1B1B2F" />
      <circle r={8} fill="#FFC23D" />
      {/* Traits de vitesse. */}
      {[0, 1, 2, 3].map((k) => {
        const d = ((tt * 9 + k * 37) % 120) / 120;
        return <line key={k} x1={-r - 60 - d * 140} x2={-r - 20 - d * 140} y1={-120 + k * 80} y2={-120 + k * 80}
          stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.8 * (1 - d)} />;
      })}
    </g>
  );
};

export const Etudes: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 45, e1 = 72] = etapes;
  const depart = prog(t, e1, 12, Easing.in(Easing.cubic)); // livres et calendrier s'en vont
  const k = pop(t, e1 + 4, 200);
  const personne = pop(t, e1 + 14);
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id="etudes" />
      <g transform={`translate(${-700 * depart} 0)`} opacity={1 - depart}>
        <g transform={`translate(320 832)`} filter="url(#ombreetudes)">
          {LIVRES.map((b, i) => {
            const k2 = pop(t, 2 + i * 4, 260);
            const y = -i * (H + 2) - (1 - k2) * 700;
            return <g key={i} transform={`translate(${b.d} ${y}) rotate(${(i % 2 ? 2.5 : -2) + (1 - k2) * 20})`}
              opacity={k2 > 0 ? 1 : 0}><Livre l={b.l} c={b.c} /></g>;
          })}
          {(() => {
            const kc = pop(t, 28, 240);
            const y = -LIVRES.length * (H + 2) - (1 - kc) * 600;
            const balance = Math.sin(t / 5) * 10;
            return (
              <g transform={`translate(0 ${y})`} opacity={kc > 0 ? 1 : 0}>
                <path d="M -70 -6 L -70 -40 C -40 -52 40 -52 70 -40 L 70 -6 Z" fill="#20202E" />
                <path d="M -150 -58 L 0 -100 L 150 -58 L 0 -16 Z" fill="#2E2E44" />
                <path d="M -150 -58 L 0 -100 L 150 -58 L 0 -78 Z" fill="#fff" opacity={0.12} />
                <g transform={`translate(0 -58) rotate(${balance})`}>
                  <line x1={0} y1={0} x2={110} y2={10} stroke="#FFC23D" strokeWidth={6} />
                  <line x1={110} y1={10} x2={112} y2={70} stroke="#FFC23D" strokeWidth={6} />
                  <rect x={100} y={64} width={24} height={34} rx={6} fill="#FFC23D" />
                </g>
                <circle cy={-58} r={10} fill="#FFC23D" />
              </g>
            );
          })()}
        </g>
        <g transform={`translate(710 500) scale(${pop(t, 8)}) rotate(${4 * Math.sin(t / 12)})`} filter="url(#ombreetudes)">
          <Calendrier t={t} e0={e0} />
        </g>
      </g>
      {t >= e1 ? (
        <>
          <g transform={`translate(${620 + (1 - k) * 500} 575) scale(${0.4 + 0.6 * k})`} filter="url(#ombreetudes)">
            <Horloge tt={t - e1} />
          </g>
          <g transform={`translate(190 832) scale(${1.5 * personne})`} filter="url(#ombreetudes)">
            <Personne couleur="#1D7CF2" />
            {/* Ordinateur portable qui brille. */}
            <g transform="translate(0 -18)">
              <rect x={-62} y={-48} width={124} height={78} rx={8} fill="#2B2B3C" />
              <rect x={-54} y={-41} width={108} height={64} rx={4} fill="#7EE8FF"
                opacity={0.75 + 0.25 * Math.sin(t / 3)} />
              <rect x={-80} y={30} width={160} height={14} rx={6} fill="#4A4A60" />
            </g>
          </g>
        </>
      ) : null}
      <text x={500} y={265} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={64} fill="#fff"
        opacity={lin(t, e1 + 18, e1 + 26, 0, 1)} transform={`translate(0 ${lin(t, e1 + 18, e1 + 26, -20, 0)})`}
        style={{paintOrder: 'stroke'}} stroke="#0B1E6B" strokeWidth={10}>
        EN UN BREF TEMPS
      </text>
    </svg>
  );
};

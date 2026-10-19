import {Easing, interpolate} from 'remotion';
import {Etoile} from '../../commun/Ecran';
import {pop, prog} from '../../commun/temps';
import {COULEURS, POLICE} from '../../theme';
import {IconeTheme} from './CarteAstuce';
import {Carte} from './scenario';

// Décors vivants de l'épisode 3 : chaque astuce a sa couleur d'accent et ses
// particules (l'icône de son thème), avec des faisceaux de lumière qui balaient.
// Variantes « rouge » (Ne dis pas) et « vert » (Dis plutôt).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
export const ROUGE = '#ff3b4f';
export const VERT = '#22d36b';
export const ACCENTS = ['#8b7bff', '#ff8c42', '#19c3a6', '#4d96ff', '#ff4f9a', '#2ec5e8', '#c77dff'];
export const ICONES: Carte['icone'][] = ['plume', 'calendrier', 'cv', 'livre', 'megaphone', 'enveloppe', 'ampoule'];

export const hasard = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Tremblement de caméra qui s'amortit après un impact.
export const secousse = (t: number, chocs: number[], amp = 22, duree = 0.45) => {
  let x = 0;
  let y = 0;
  for (const c of chocs) {
    const d = t - c;
    if (d < 0 || d > duree) continue;
    const a = amp * Math.exp(-d * 9) * (1 - d / duree);
    x += Math.sin(d * 95) * a;
    y += Math.cos(d * 77 + 1) * a * 0.8;
  }
  return {x, y, transform: `translate(${x}px, ${y}px)`};
};

export const FondAstuce: React.FC<{n: number; t: number; ton?: 'accent' | 'rouge' | 'vert'; children?: React.ReactNode}> = ({n, t, ton = 'accent', children}) => {
  const c = ton === 'rouge' ? ROUGE : ton === 'vert' ? VERT : ACCENTS[(n - 1 + 7) % 7];
  const icone = ICONES[(n - 1 + 7) % 7];
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: N, fontFamily: POLICE}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% ${38 + Math.sin(t * 0.8) * 4}%, ${c}aa 0%, ${c}33 38%, ${N} 78%)`}} />
      {/* faisceaux de lumière qui balaient */}
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: -400 + ((t * (110 + k * 40) + k * 520) % 1900),
            top: -300,
            width: 180 + k * 60,
            height: 2600,
            transform: `rotate(${22 + k * 9}deg)`,
            background: `linear-gradient(90deg, transparent, ${k === 1 ? '#ffffff' : c}33, transparent)`,
            mixBlendMode: 'screen',
          }}
        />
      ))}
      {/* anneaux qui respirent */}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        {[0, 1, 2].map((k) => {
          const r = ((t * 120 + k * 260) % 780) + 80;
          return <circle key={k} cx={540} cy={720} r={r} fill="none" stroke={c} strokeWidth={4} opacity={0.28 * (1 - r / 860)} />;
        })}
      </svg>
      {/* particules : icône du thème, points lumineux, étoiles */}
      {Array.from({length: 18}, (_, i) => {
        const vit = 40 + hasard(i + 3) * 70;
        const y = ((hasard(i + 9) * 1700 - t * vit) % 1700 + 1700) % 1700 + 120;
        const x = 30 + hasard(i) * 1000 + Math.sin(t * 0.9 + i) * 24;
        const s = 26 + hasard(i + 5) * 46;
        const op = 0.16 + hasard(i + 7) * 0.22;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: op, transform: `rotate(${Math.sin(t + i) * 25}deg)`}}>
            {i % 3 === 0 ? <IconeTheme kind={icone} taille={s * 1.3} t={t + i} /> : i % 3 === 1 ? <div style={{width: s * 0.35, height: s * 0.35, borderRadius: '50%', background: '#fff', boxShadow: `0 0 18px ${c}`}} /> : <Etoile taille={s * 0.6} couleur={i % 2 ? COULEURS.or : c} />}
          </div>
        );
      })}
      {/* vignette */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, transparent 55%, #000a 100%)'}} />
      {children}
    </div>
  );
};

// Pluie de petites étoiles (résultat réussi).
export const PluieEtoiles: React.FC<{t: number; a: number; zone: {x: number; y: number; l: number; h: number}}> = ({t, a, zone}) => {
  const d = t - a;
  if (d < 0 || d > 1.6) return null;
  return (
    <>
      {Array.from({length: 22}, (_, i) => {
        const x = zone.x + hasard(i + 40) * zone.l;
        const y = zone.y - 60 + (d * (300 + hasard(i + 41) * 420)) - hasard(i + 42) * 120;
        const op = interpolate(d, [0, 0.1, 1.2, 1.6], [0, 1, 1, 0], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: op, transform: `rotate(${d * 300 + i * 30}deg)`}}>
            <Etoile taille={18 + hasard(i + 43) * 26} couleur={i % 3 ? COULEURS.or : '#ffffff'} />
          </div>
        );
      })}
    </>
  );
};

// Icône animée du thème, en grand (plan « Numéro X ») : la plume écrit, le
// calendrier se remplit, le livre s'ouvre, le mégaphone émet, l'enveloppe
// s'ouvre, l'ampoule s'allume.
export const IconeAnimee: React.FC<{kind: Carte['icone']; t: number; a: number; taille: number; couleur: string}> = ({kind, t, a, taille, couleur}) => {
  const d = Math.max(0, t - a);
  const O = COULEURS.or;
  const B = COULEURS.blanc;
  const formes: Record<Carte['icone'], React.ReactNode> = {
    plume: (
      <g>
        <rect x={10} y={60} width={180} height={120} rx={16} fill={B} />
        {[0, 1, 2].map((k) => {
          const p = interpolate(d, [0.15 + k * 0.35, 0.5 + k * 0.35], [0, 1], clamp);
          return <path key={k} d={`M30 ${90 + k * 30} q15 -10 30 0 t30 0 t30 0 t30 0`} stroke={couleur} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={140} strokeDashoffset={140 * (1 - p)} />;
        })}
        <g transform={`translate(${30 + 120 * ((d * 0.9) % 1)} ${88 + 30 * Math.min(2, Math.floor(d / 0.35))}) rotate(${-30 + Math.sin(d * 20) * 6})`}>
          <path d="M0 0 L-8 -20 Q20 -80 70 -110 Q40 -50 8 -16 Z" fill={O} stroke={N} strokeWidth={4} />
        </g>
      </g>
    ),
    calendrier: (
      <g>
        <rect x={15} y={30} width={170} height={160} rx={18} fill={B} />
        <rect x={15} y={30} width={170} height={40} rx={18} fill={couleur} />
        {[0, 1].map((k) => <rect key={k} x={55 + k * 80} y={18} width={12} height={28} rx={6} fill={N} />)}
        {Array.from({length: 12}, (_, k) => {
          const on = d > 0.1 + k * 0.08;
          return <rect key={k} x={28 + (k % 4) * 39} y={80 + Math.floor(k / 4) * 35} width={30} height={26} rx={6} fill={on ? (k % 3 ? couleur : O) : '#dfe3f0'} style={{transformOrigin: `${43 + (k % 4) * 39}px ${93 + Math.floor(k / 4) * 35}px`, transform: `scale(${on ? pop(d, 0.1 + k * 0.08, 0.25) : 1})`}} />;
        })}
      </g>
    ),
    cv: (
      <g>
        <rect x={40} y={10} width={130} height={180} rx={14} fill={B} />
        <circle cx={80} cy={55} r={22} fill={couleur} />
        {[0, 1, 2, 3, 4].map((k) => {
          const p = interpolate(d, [0.1 + k * 0.15, 0.35 + k * 0.15], [0, 1], clamp);
          return <rect key={k} x={60} y={95 + k * 18} width={(k % 2 ? 70 : 90) * p} height={9} rx={4} fill={k === 0 ? N : '#9aa3c0'} />;
        })}
        <g transform={`translate(150 160) scale(${pop(d, 0.95, 0.3)})`}>
          <circle r={26} fill={VERT} />
          <path d="M-12 0 L-3 10 L13 -10" stroke={B} strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
      </g>
    ),
    livre: (
      <g>
        {(() => {
          const o = interpolate(d, [0.05, 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
          return (
            <>
              <path d={`M100 50 Q${100 - 85 * o} ${40 - 10 * o} ${100 - 90 * o} 50 V170 Q${100 - 45 * o} 160 100 175 Z`} fill={couleur} stroke={N} strokeWidth={4} />
              <path d={`M100 50 Q${100 + 85 * o} ${40 - 10 * o} ${100 + 90 * o} 50 V170 Q${100 + 45 * o} 160 100 175 Z`} fill={B} stroke={N} strokeWidth={4} />
              {[0, 1, 2].map((k) => <rect key={k} x={115} y={75 + k * 22} width={55 * o} height={8} rx={4} fill="#9aa3c0" />)}
              {[0, 1, 2, 3].map((k) => <g key={k} transform={`translate(${100 + Math.cos(k * 1.6) * 80 * o} ${40 - 30 * o - k * 6 - (d * 30) % 20}) rotate(${d * 120})`} opacity={o}><Etoile taille={22} couleur={O} /></g>)}
            </>
          );
        })()}
      </g>
    ),
    megaphone: (
      <g>
        <g transform={`rotate(${Math.sin(d * 14) * 4} 70 100)`}>
          <path d="M20 80 H60 L140 40 V160 L60 120 H20 Z" fill={couleur} stroke={N} strokeWidth={5} />
          <path d="M55 120 L70 170 H90 L80 120" fill={N} />
        </g>
        {[0, 1, 2].map((k) => {
          const p = ((d * 1.5 + k / 3) % 1);
          return <path key={k} d={`M${150 + p * 40} ${70 - p * 25} Q${175 + p * 45} 100 ${150 + p * 40} ${130 + p * 25}`} stroke={O} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - p} />;
        })}
      </g>
    ),
    enveloppe: (
      <g>
        {(() => {
          const o = prog(d, 0.15, 0.5);
          const lettre = prog(d, 0.4, 0.8, Easing.out(Easing.back(1.5)));
          return (
            <>
              <rect x={20} y={80} width={160} height={110} rx={12} fill={couleur} stroke={N} strokeWidth={4} />
              <rect x={40} y={110 - 70 * lettre} width={120} height={80} rx={8} fill={B} stroke={N} strokeWidth={3} />
              {[0, 1].map((k) => <rect key={k} x={55} y={128 - 70 * lettre + k * 18} width={80 - k * 25} height={8} rx={4} fill="#9aa3c0" />)}
              <path d="M20 190 L100 130 L180 190" fill={couleur} stroke={N} strokeWidth={4} />
              <path d={`M20 84 L100 ${84 + 60 * (1 - 2 * o)} L180 84`} fill={o < 0.5 ? couleur : '#3a2a8a'} stroke={N} strokeWidth={4} />
            </>
          );
        })()}
      </g>
    ),
    ampoule: (
      <g>
        {(() => {
          const on = prog(d, 0.2, 0.45) * (0.85 + 0.15 * Math.sin(d * 18));
          return (
            <>
              {Array.from({length: 8}, (_, k) => {
                const an = (k / 8) * Math.PI * 2 - Math.PI / 2;
                return <path key={k} d={`M${100 + Math.cos(an) * 78} ${85 + Math.sin(an) * 78} L${100 + Math.cos(an) * (98 + 8 * Math.sin(d * 9))} ${85 + Math.sin(an) * (98 + 8 * Math.sin(d * 9))}`} stroke={O} strokeWidth={9} strokeLinecap="round" opacity={on} />;
              })}
              <circle cx={100} cy={85} r={70} fill={O} opacity={0.35 * on} />
              <circle cx={100} cy={85} r={55} fill={on > 0.5 ? O : '#c9cfe6'} stroke={N} strokeWidth={5} />
              <path d="M80 85 Q100 60 120 85" stroke={on > 0.5 ? '#fff6' : '#8a90a8'} strokeWidth={6} fill="none" />
              <rect x={78} y={138} width={44} height={30} rx={6} fill={couleur} stroke={N} strokeWidth={4} />
              <path d="M84 178 H116" stroke={N} strokeWidth={8} strokeLinecap="round" />
            </>
          );
        })()}
      </g>
    ),
  };
  return (
    <svg width={taille} height={taille} viewBox="0 0 200 200" style={{overflow: 'visible', filter: 'drop-shadow(0 18px 30px #0009)'}}>
      {formes[kind]}
    </svg>
  );
};

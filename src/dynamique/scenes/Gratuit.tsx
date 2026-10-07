import React from 'react';
import {Easing} from 'remotion';
import {Confettis, Defs, Gros, lin, POLICE_SVG, pop, prog, type PropsScene} from './outils';

// h. « Une formation gratuite » : une liasse de billets, barrée d'un grand trait rouge ; sur l'étape 0, les
// billets s'envolent et « 100 % GRATUIT » éclate en confettis.
const ID = 'gra';

const Billet: React.FC<{c: string}> = ({c}) => (
  <g>
    <rect x={-230} y={-120} width={460} height={240} rx={22} fill={c} stroke="#fff" strokeWidth={8} />
    <rect x={-200} y={-92} width={400} height={184} rx={14} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={4} />
    <circle r={66} fill="#fff" opacity={0.25} />
    <text y={26} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={76} fill="#fff">F</text>
    <text x={-170} y={-50} fontFamily={POLICE_SVG} fontWeight={900} fontSize={34} fill="#fff" opacity={0.85}>CFA</text>
    <text x={170} y={80} textAnchor="end" fontFamily={POLICE_SVG} fontWeight={900} fontSize={34} fill="#fff" opacity={0.85}>CFA</text>
  </g>
);

export const Gratuit: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 30] = etapes;
  const trait = prog(t, 8, 8, Easing.out(Easing.cubic));
  const envol = prog(t, e0, 14, Easing.in(Easing.cubic));
  const k = pop(t, e0 + 2, 200);
  const pulse = t > e0 + 14 ? 1 + 0.04 * Math.sin((t - e0) / 3) : 1;
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {/* Rayons qui tournent derrière le texte. */}
      <g transform={`translate(500 560) rotate(${t * 1.5})`} opacity={0.25 * k}>
        {Array.from({length: 12}).map((_, i) => (
          <path key={i} d="M 0 0 L -60 -620 L 60 -620 Z" fill="#fff" transform={`rotate(${i * 30})`} />
        ))}
      </g>
      {envol < 1 ? (
        <g opacity={1 - envol}>
          {[['#2FAF5A', -10, -40], ['#1F9A4C', 6, 0], ['#3CCB6C', -4, 40]].map(([c, a, dy], i) => (
            <g key={i} transform={`translate(${500 + (i - 1) * 300 * envol} ${560 + Number(dy) - 600 * envol * (1 + i * 0.3)}) rotate(${Number(a) + envol * (i - 1) * 60}) scale(${pop(t, i * 3)})`}
              filter={`url(#ombre${ID})`}>
              <Billet c={String(c)} />
            </g>
          ))}
          {/* Grand trait rouge qui barre les billets. */}
          <line x1={210} y1={760} x2={210 + 580 * trait} y2={760 - 400 * trait} stroke="#fff" strokeWidth={66}
            strokeLinecap="round" opacity={trait > 0 ? 1 : 0} />
          <line x1={210} y1={760} x2={210 + 580 * trait} y2={760 - 400 * trait} stroke="#FF2D2D" strokeWidth={46}
            strokeLinecap="round" opacity={trait > 0 ? 1 : 0} />
          <Gros x={500} y={282} taille={72} opacite={lin(t, 4, 10, 0, 1)} contour="#2A0B5E">PAS D'ARGENT ?</Gros>
        </g>
      ) : null}
      <g transform={`translate(500 560) scale(${k * pulse}) rotate(${(1 - Math.min(1, k)) * -12})`}
        opacity={k > 0 ? 1 : 0}>
        <Gros x={0} y={-40} taille={170} couleur="#FFD400" contour="#2A0B5E">100 %</Gros>
        <Gros x={0} y={130} taille={150} couleur="#fff" contour="#2A0B5E">GRATUIT</Gros>
      </g>
      <Confettis t={t} a={e0 + 2} x={500} y={520} n={56} graine="g" />
    </svg>
  );
};

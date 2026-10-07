import React from 'react';
import {Easing} from 'remotion';
import {Defs, Gros, lin, Personne, pop, prog, type PropsScene} from './outils';

// g. « Vous serez remplacé par des petits qui savent utiliser l'IA » : un salarié à son bureau (« VOUS ») ; sur
// l'étape 0, il devient gris, la chaise le pousse hors de l'image, tampon « REMPLACÉ » ; sur l'étape 1, un jeune
// avec l'éclair « IA » arrive sur la chaise et l'écran s'allume.
const ID = 'rem';

const Chaise: React.FC<{tourne: number}> = ({tourne}) => (
  <g>
    <rect x={-14} y={0} width={28} height={110} rx={8} fill="#2E2E44" />
    {[-1, 1].map((s) => <line key={s} x1={0} y1={110} x2={s * 90} y2={140} stroke="#2E2E44" strokeWidth={16}
      strokeLinecap="round" />)}
    {[-90, 90].map((x) => <circle key={x} cx={x} cy={146} r={14} fill="#14141F" />)}
    <g transform={`scale(${Math.cos(tourne)} 1)`}>
      <rect x={-110} y={-28} width={220} height={46} rx={20} fill="#3A3A58" />
      <rect x={-96} y={-250} width={192} height={220} rx={50} fill="#4A4A6E" />
      <rect x={-96} y={-250} width={192} height={90} rx={50} fill="#fff" opacity={0.1} />
    </g>
  </g>
);

const Bureau: React.FC<{allume: number; t: number}> = ({allume, t}) => (
  <g>
    <rect x={0} y={0} width={420} height={36} rx={10} fill="#C98A4B" />
    <rect x={0} y={0} width={420} height={12} rx={6} fill="#fff" opacity={0.2} />
    <rect x={30} y={36} width={26} height={210} fill="#9A6234" />
    <rect x={364} y={36} width={26} height={210} fill="#9A6234" />
    {/* Écran */}
    <rect x={150} y={-30} width={30} height={30} fill="#33334A" />
    <rect x={100} y={-38} width={130} height={14} rx={6} fill="#33334A" />
    <rect x={40} y={-250} width={250} height={220} rx={18} fill="#22223A" />
    <rect x={54} y={-236} width={222} height={192} rx={10} fill={allume > 0.5 ? '#0E1A3A' : '#3B3B52'} />
    {allume > 0.5 ? (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={74 + (i % 2) * 20} y={-216 + i * 34} width={Math.min(170, ((t * 9 + i * 40) % 220))}
            height={16} rx={8} fill={['#5CF0FF', '#FFD400', '#7EE8A8', '#FF7AB6', '#5CF0FF'][i]} />
        ))}
      </g>
    ) : null}
  </g>
);

export const Remplace: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 20, e1 = 60] = etapes;
  const gris = lin(t, e0, e0 + 6, 0, 1);
  const sortie = prog(t, e0 + 8, 14, Easing.in(Easing.cubic));
  const arrivee = pop(t, e1, 160);
  const tourne = t >= e0 + 8 && t < e1 + 14 ? (t - e0 - 8) / 5 : 0;
  const tampon = pop(t, e0 + 4, 260);
  const eclair = pop(t, e1 + 8, 260);
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      <g transform="translate(500 880) scale(1.15) translate(-500 -880)">
      {/* Sol */}
      <rect x={0} y={860} width={1080} height={100} fill="#000" opacity={0.18} />
      <g transform={`translate(520 610) scale(${pop(t, 0, 200)})`} filter={`url(#ombre${ID})`}>
        <Bureau allume={arrivee > 0.4 ? 1 : 0} t={t} />
      </g>
      {/* Ancien salarié, assis, poussé hors de l'image. */}
      {sortie < 1 ? (
        <g transform={`translate(${330 - 700 * sortie} 690) rotate(${-25 * sortie})`} opacity={1 - sortie * 0.5}>
          <Chaise tourne={0} />
          <g transform="translate(0 -40) scale(2.3)">
            <Personne couleur={gris > 0.5 ? '#8C8CA0' : '#F0560F'} peau={gris > 0.5 ? '#9A9AA8' : '#8A5A3C'} />
          </g>
        </g>
      ) : null}
      {/* Nouvelle chaise (vide, elle tourne), puis le jeune avec l'éclair « IA ». */}
      {t >= e0 + 10 ? (
        <g transform={`translate(330 ${690 + (1 - pop(t, e0 + 10, 200)) * 300})`}>
          <Chaise tourne={tourne} />
          {arrivee > 0 ? (
            <g transform={`translate(0 ${-40 - (1 - arrivee) * 500}) scale(2.3)`}>
              <circle cx={0} cy={-60} r={110} fill="#FFD400" opacity={0.25 + 0.1 * Math.sin(t / 4)} />
              <Personne couleur="#1D5BFF" />
              <g transform={`translate(0 -32) scale(${eclair})`}>
                <circle r={26} fill="#FFD400" stroke="#fff" strokeWidth={4} />
                <path d="M 4 -18 L -10 4 L -1 4 L -6 20 L 10 -4 L 1 -4 L 6 -18 Z" fill="#14141F" />
              </g>
            </g>
          ) : null}
        </g>
      ) : null}
      </g>
      <Gros x={500} y={268} taille={80} opacite={1 - lin(t, e0, e0 + 6, 0, 1)} contour="#3A0B0B">VOUS</Gros>
      <g transform={`translate(560 320) rotate(-8) scale(${tampon * (1 - lin(t, e1 - 4, e1, 0, 1))})`}
        opacity={tampon > 0 ? 1 : 0}>
        <rect x={-300} y={-70} width={600} height={120} rx={18} fill="#fff" />
        <rect x={-288} y={-58} width={576} height={96} rx={12} fill="none" stroke="#D92B2B" strokeWidth={10} />
        <Gros x={0} y={18} taille={80} couleur="#D92B2B" contour="#fff">REMPLACÉ</Gros>
      </g>
      <g transform={`translate(500 268) scale(${pop(t, e1 + 6)})`} opacity={t >= e1 + 6 ? 1 : 0}>
        <Gros x={0} y={0} taille={66} couleur="#FFD400" contour="#14141F">IL MAÎTRISE L'IA</Gros>
      </g>
    </svg>
  );
};

import React from 'react';
import {Defs, Gros, POLICE_SVG, pop, type PropsScene} from './outils';

// i. « La soirée, c'est de 18h à 20h. Et la journée, c'est de 9h à 17h » : calendrier « SAMEDI 10 OCTOBRE » et
// repère de carte « Adidogomé, Lycée Moderne 2 » en haut ; les cartes « SOIRÉE 18H – 20H » (étape 0) puis
// « JOURNÉE 9H – 17H » (étape 1) arrivent en dessous.
const ID = 'rdv';

const Carte: React.FC<React.PropsWithChildren<{x: number; y: number; l: number; h: number; k: number; c?: string}>> = (
  {x, y, l, h, k, c = '#fff', children}) => (
  <g transform={`translate(${x + l / 2} ${y + h / 2}) scale(${k}) translate(${-l / 2} ${-h / 2})`}
    opacity={k > 0 ? 1 : 0} filter={`url(#ombre${ID})`}>
    <rect width={l} height={h} rx={28} fill={c} />
    {children}
  </g>
);

const Lune: React.FC = () => (
  <g><circle r={38} fill="#FFE27A" /><circle cx={18} cy={-12} r={34} fill="#2B1A6B" /></g>
);
const Soleil: React.FC<{t: number}> = ({t}) => (
  <g transform={`rotate(${t * 2})`}>
    {Array.from({length: 8}).map((_, i) => <rect key={i} x={-6} y={-56} width={12} height={20} rx={6} fill="#FFB800"
      transform={`rotate(${i * 45})`} />)}
    <circle r={30} fill="#FFC23D" />
  </g>
);

export const RendezVous: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 30, e1 = 100] = etapes;
  const saut = Math.abs(Math.sin(t / 6)) * 22;
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {/* Calendrier */}
      <Carte x={60} y={206} l={380} h={330} k={pop(t, 0)}>
        <rect width={380} height={92} rx={28} fill="#E2324A" />
        <rect y={60} width={380} height={32} fill="#E2324A" />
        {[90, 290].map((x) => <rect key={x} x={x - 12} y={-18} width={24} height={48} rx={12} fill="#33334A" />)}
        <text x={190} y={70} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={52} fill="#fff">OCTOBRE</text>
        <text x={190} y={240} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={150} fill="#1B1B2F">10</text>
        <text x={190} y={306} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={54} fill="#E2324A">SAMEDI</text>
      </Carte>
      {/* Carte du quartier avec repère qui rebondit. */}
      <Carte x={466} y={206} l={470} h={330} k={pop(t, 6)}>
        <svg width={470} height={210} overflow="hidden">
          <rect width={470} height={210} fill="#DDF3E4" />
          <rect x={-10} y={120} width={500} height={34} fill="#fff" transform="rotate(-8 235 137)" />
          <rect x={160} y={-10} width={30} height={240} fill="#fff" transform="rotate(10 175 105)" />
          <rect x={330} y={-10} width={22} height={240} fill="#fff" />
          <rect x={20} y={20} width={110} height={80} rx={10} fill="#A6E3B9" />
          <rect x={220} y={20} width={90} height={70} rx={10} fill="#BFD8FF" />
          <rect x={370} y={150} width={80} height={60} rx={10} fill="#A6E3B9" />
          <circle cx={262} cy={150} r={22 + 10 * Math.abs(Math.sin(t / 6))} fill="#E2324A" opacity={0.25} />
          <g transform={`translate(262 ${142 - saut})`}>
            <path d="M 0 0 C -10 -24 -38 -40 -38 -70 A 38 38 0 0 1 38 -70 C 38 -40 10 -24 0 0 Z" fill="#E2324A"
              stroke="#fff" strokeWidth={5} />
            <circle cy={-70} r={14} fill="#fff" />
          </g>
        </svg>
        <rect y={196} width={470} height={134} fill="#fff" />
        <rect y={196} width={470} height={134} rx={28} fill="#fff" />
        <text x={235} y={260} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={50} fill="#1B1B2F">ADIDOGOMÉ</text>
        <text x={235} y={310} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={34} fill="#0E8F62">LYCÉE MODERNE 2</text>
      </Carte>
      {/* Horaires */}
      <Carte x={60} y={566} l={876} h={142} k={pop(t, e0, 240)} c="#2B1A6B">
        <g transform="translate(80 71)"><Lune /></g>
        <text x={150} y={92} fontFamily={POLICE_SVG} fontWeight={900} fontSize={52} fill="#C9B8FF">SOIRÉE</text>
        <Gros x={846} y={100} taille={88} ancre="end" couleur="#fff" contour="#2B1A6B">18H – 20H</Gros>
      </Carte>
      <Carte x={60} y={728} l={876} h={142} k={pop(t, e1, 240)} c="#FFF4D6">
        <g transform="translate(80 71)"><Soleil t={t} /></g>
        <text x={150} y={92} fontFamily={POLICE_SVG} fontWeight={900} fontSize={52} fill="#C76A00">JOURNÉE</text>
        <Gros x={846} y={100} taille={88} ancre="end" couleur="#1B1B2F" contour="#FFF4D6">9H – 17H</Gros>
      </Carte>
    </svg>
  );
};

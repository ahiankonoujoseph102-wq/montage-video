import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import {Defs, lin, Personne, POLICE_SVG, pop, type PropsScene} from './outils';

// f. « Amazon, plus de 15 000 licenciements » : un compteur monte de 0 à 15 000 (atteint sur l'étape 0, quand le
// chiffre est dit) pendant que des silhouettes de salariés rougissent et s'effacent. Texte seulement, sans logo.
const ID = 'lic';
const COLONNES = 8;
const RANGEES = 3;
const PARTANTS = 19; // silhouettes qui s'effacent (sur 24)

const format = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const Licenciements: React.FC<PropsScene> = ({t, etapes, duree}) => {
  const [e0 = 52] = etapes;
  const valeur = interpolate(t, [4, e0], [0, 15000],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const choc = t >= e0 ? Math.max(0, 1 - (t - e0) / 14) : 0;
  const tremble = choc * 10 * Math.sin(t * 3);
  const ordre = Array.from({length: COLONNES * RANGEES}, (_, i) => i).sort((a, b) => random(`o${a}`) - random(`o${b}`));
  const rang = new Map(ordre.map((v, k) => [v, k]));
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {/* Éclair rouge au moment du chiffre. */}
      <rect width={1080} height={960} fill="#FF2D2D" opacity={0.35 * choc} />
      <g transform={`translate(500 0) scale(${pop(t, 0)})`}>
        <text x={0} y={282} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={76} fill="#fff"
          letterSpacing={6}>AMAZON</text>
        <rect x={-120} y={298} width={240} height={8} rx={4} fill="#FF4D4D" />
      </g>
      <text x={500} y={358} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={40} fill="#FFB3B3"
        opacity={lin(t, e0 - 14, e0 - 6, 0, 1)}>PLUS DE</text>
      <g transform={`translate(${500 + tremble} 520) scale(${1 + 0.12 * choc})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={190} fill="#fff"
          filter={`url(#lueur${ID})`} stroke="#B3001B" strokeWidth={10} style={{paintOrder: 'stroke'}}>
          {format(valeur)}
        </text>
      </g>
      <g transform={`translate(500 590) scale(${pop(t, 8)})`}>
        <rect x={-250} y={-46} width={500} height={70} rx={14} fill="#E01E37" />
        <text x={0} y={8} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={50} fill="#fff">
          LICENCIEMENTS
        </text>
      </g>
      {/* Salariés : ils rougissent puis tombent et s'effacent au fil du compteur. */}
      {Array.from({length: COLONNES * RANGEES}).map((_, i) => {
        const col = i % COLONNES;
        const lig = Math.floor(i / COLONNES);
        const r = rang.get(i) ?? 0;
        const depart = r < PARTANTS ? 6 + ((e0 - 8) * r) / PARTANTS : Infinity;
        const a = t - depart;
        const rouge = lin(a, 0, 6, 0, 1);
        const chute = lin(a, 6, 16, 0, 1);
        const apparition = pop(t, 2 + col * 1.2 + lig * 2, 260);
        const x = 100 + col * 114 + (lig % 2) * 20;
        const y = 700 + lig * 66;
        const couleur = rouge > 0.5 ? '#FF4D4D' : '#E8ECFF';
        return (
          <g key={i} transform={`translate(${x} ${y + chute * 60}) scale(${(0.7 + lig * 0.06) * apparition})`}
            opacity={(1 - chute) * (apparition > 0 ? 1 : 0)}>
            <Personne couleur={couleur} peau={rouge > 0.5 ? '#B0343F' : '#C9A27E'} />
          </g>
        );
      })}
    </svg>
  );
};

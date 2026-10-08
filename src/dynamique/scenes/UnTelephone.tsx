import React from 'react';
import {Application, BANDE, Engrenages, HC, L, PageWeb, Robot} from './Creations';
import {Defs, Gros, lin, pop, Telephone, type PropsScene} from './outils';

// l. « Juste un seul téléphone suffit… créer n'importe quoi » : un téléphone au centre, d'où sortent l'un après
// l'autre (étapes 0, 1, 2) un site web, une application et un robot, puis des automatisations ; enfin
// « N'IMPORTE QUOI ! » claque par-dessus.
// Les dessins des cartes sont ceux de la scène « creations » (ses dégradés utilisent l'identifiant « cre »).
const ID = 'cre';
const TEL = {x: 370, y: 322, l: 260, h: 540};
const SORTIES = [
  {x: 200, y: 468, titre: 'SITE WEB', c: '#1D7CF2', Contenu: PageWeb},
  {x: 796, y: 468, titre: 'APPLI', c: '#F0560F', Contenu: Application},
  {x: 200, y: 744, titre: 'ROBOT IA', c: '#7B2FF7', Contenu: Robot},
  {x: 796, y: 744, titre: 'AUTOMATE', c: '#0E9F6E', Contenu: Engrenages},
];
const E = 0.72; // échelle des cartes

export const UnTelephone: React.FC<PropsScene> = ({t, etapes}) => {
  const es = [etapes[0] ?? 20, etapes[1] ?? 40, etapes[2] ?? 60];
  es.push(es[2] + 8);
  const fin = es[2] + 16;
  const brille = 0.5 + 0.5 * Math.sin(t / 3);
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      <Gros x={500} y={280} taille={66} opacite={lin(t, 2, 8, 0, 1)} contour="#5A1406">UN SEUL TÉLÉPHONE</Gros>
      {/* Halo et rayons derrière le téléphone. */}
      <circle cx={500} cy={590} r={230 + 10 * brille} fill="#FFD400" opacity={0.18} />
      {SORTIES.map((s, i) => {
        const k = pop(t, es[i], 180);
        if (k <= 0) return null;
        const x = 500 + (s.x - 500) * Math.min(1, k);
        const y = 590 + (s.y - 590) * Math.min(1, k);
        return <line key={`r${i}`} x1={500} y1={590} x2={x} y2={y} stroke="#fff" strokeWidth={8} strokeDasharray="14 12"
          strokeDashoffset={-t * 3} opacity={0.7} />;
      })}
      <g transform={`translate(0 ${(1 - pop(t, 0, 180)) * 600}) rotate(${2 * Math.sin(t / 20)} 500 590)`}
        filter={`url(#ombre${ID})`}>
        <Telephone {...TEL} ecran="#14183A">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={24 + (i % 3) * 14} y={70 + i * 46} width={Math.min(170, (t * 6 + i * 30) % 200)} height={18}
              rx={9} fill={['#5CF0FF', '#FFD400', '#7EE8A8', '#FF7AB6', '#B57BFF', '#5CF0FF'][i]} />
          ))}
          <g transform={`translate(122 400) scale(${1 + 0.08 * brille})`}>
            <rect x={-80} y={-40} width={160} height={80} rx={40} fill="#FFD400" />
            <text y={16} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill="#14141F">IA</text>
          </g>
        </Telephone>
      </g>
      {SORTIES.map((s, i) => {
        const k = pop(t, es[i], 180);
        if (k <= 0) return null;
        const x = 500 + (s.x - 500) * Math.min(1, k);
        const y = 590 + (s.y - 590) * Math.min(1, k);
        const flotte = Math.sin((t + i * 13) / 10) * 6;
        const C = s.Contenu;
        return (
          <g key={i} transform={`translate(${x} ${y + flotte}) scale(${E * (0.3 + 0.7 * k)}) translate(${-L / 2} ${-HC / 2})`}
            filter={`url(#ombre${ID})`}>
            <rect width={L} height={HC} rx={26} fill={s.c} stroke="#fff" strokeWidth={8} />
            <svg width={L} height={HC - BANDE} overflow="hidden"><C u={t - es[i]} /></svg>
            <rect y={HC - BANDE - 10} width={L} height={BANDE + 10} fill="#000" opacity={0.3} />
            <text x={L / 2} y={HC - 12} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={56}
              fill="#fff">{s.titre}</text>
          </g>
        );
      })}
      <g transform={`translate(500 640) scale(${pop(t, fin)}) rotate(-5)`} opacity={t >= fin ? 1 : 0}>
        <Gros x={0} y={0} taille={72} couleur="#FFD400" contour="#5A1406">N'IMPORTE QUOI !</Gros>
      </g>
    </svg>
  );
};

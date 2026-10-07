import React from 'react';
import {Easing} from 'remotion';
import {Defs, lin, Marque, POLICE_SVG, pop, prog, type PropsScene} from './outils';

// d. « Questions vagues, réponses vagues » : dans un téléphone, une question floue s'écrit, une réponse grise et
// floue arrive, croix rouge (étape 0) qui claque encore sur « décevants » (étape 1). Puis l'écran se vide
// (étape 2) : question précise, réponse nette, coche verte (étape 3).
const ECRAN = {x: 316, y: 232, l: 308, h: 628};
const ID = 'rep';

const Bulle: React.FC<React.PropsWithChildren<{x: number; y: number; l: number; h: number; moi: boolean; k: number;
  fond?: string}>> = (
  {x, y, l, h, moi, k, fond, children}) => (
  <g transform={`translate(${x + (moi ? l : 0)} ${y + h}) scale(${k}) translate(${moi ? -l : 0} ${-h})`}
    opacity={k > 0 ? 1 : 0}>
    <rect width={l} height={h} rx={20} fill={fond ?? (moi ? '#1D7CF2' : '#E6E6EF')} />
    <path d={moi ? `M ${l - 14} ${h - 4} L ${l + 8} ${h + 8} L ${l - 30} ${h - 2} Z` : `M 14 ${h - 4} L -8 ${h + 8} L 30 ${h - 2} Z`}
      fill={fond ?? (moi ? '#1D7CF2' : '#E6E6EF')} />
    {children}
  </g>
);

const Texte: React.FC<{lignes: string[]; n: number; couleur: string; taille?: number; flou?: boolean; x?: number; y?: number}> = (
  {lignes, n, couleur, taille = 19, flou, x = 16, y = 30}) => {
  let reste = n;
  return (
    <g filter={flou ? `url(#flou${ID})` : undefined}>
      {lignes.map((l, i) => {
        const vis = l.slice(0, Math.max(0, reste));
        reste -= l.length;
        return <text key={i} x={x} y={y + i * (taille + 7)} fontFamily={POLICE_SVG} fontWeight={800} fontSize={taille}
          fill={couleur}>{vis}</text>;
      })}
    </g>
  );
};

const Points: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => (
  <g>{[0, 1, 2].map((i) => <circle key={i} cx={x + i * 22} cy={y - 6 * Math.max(0, Math.sin((t - i * 4) / 3))} r={7}
    fill="#9A9AB0" />)}</g>
);

const Etiquette: React.FC<{x: number; y: number; lignes: string[]; couleur: string; k: number}> = ({x, y, lignes, couleur, k}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={k > 0 ? 1 : 0}>
    {lignes.map((l, i) => (
      <text key={i} y={i * 44} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={40} fill={couleur}
        stroke="#fff" strokeWidth={9} style={{paintOrder: 'stroke'}}>{l}</text>
    ))}
  </g>
);

export const Reponses: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 57, e1 = 163, e2 = 194, e3 = 253] = etapes;
  const vide = prog(t, e2, 10, Easing.in(Easing.cubic)); // l'écran se vide pour la version précise
  const secoue = (a: number) => (t >= a && t < a + 12 ? Math.sin((t - a) * 2.4) * 10 * (1 - (t - a) / 12) : 0);
  // Version floue
  const q1 = ['fais un truc', 'bien pour mon', 'business stp'];
  const n1 = Math.floor(lin(t, 6, 26, 0, 40));
  const kq1 = pop(t, 4);
  const krep1 = pop(t, 30);
  const lignesFloues = Math.floor(lin(t, 42, e0 - 4, 0, 5));
  const kCroix = pop(t, e0, 260) + (t >= e1 ? 0.18 * Math.max(0, Math.sin(((t - e1) / 14) * Math.PI)) : 0);
  // Version précise
  const q2 = ['Écris 3 idées de', 'posts pour ma', 'boutique de pagnes', 'à Lomé, ton joyeux.'];
  const n2 = Math.floor(lin(t, e2 + 10, e2 + 34, 0, 80));
  const kq2 = pop(t, e2 + 8);
  const kpoints2 = t >= e2 + 36 && t < e3 - 12;
  const krep2 = pop(t, e3 - 12);
  const r2 = ['1. Arrivage : 20', '    nouveaux pagnes', '2. Astuce : nouer', '    son pagne', '3. Samedi : -10 %', '    en boutique'];
  const n3 = Math.floor(lin(t, e3 - 10, e3 + 14, 0, 120));
  const kCoche = pop(t, e3, 260);
  const flotte = (i: number) => Math.sin((t + i * 20) / 12) * 14;
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {/* Points d'interrogation flous qui flottent autour de la version vague. */}
      <g opacity={(1 - vide) * lin(t, 10, 20, 0, 0.75)} filter={`url(#flou${ID})`}>
        {[[110, 300, 70], [220, 760, 90], [860, 270, 60], [900, 760, 80]].map(([x, y, s], i) => (
          <text key={i} x={x} y={y + flotte(i)} fontFamily={POLICE_SVG} fontWeight={900} fontSize={s} fill="#fff">?</text>
        ))}
      </g>
      {/* Téléphone */}
      <g transform={`translate(0 ${(1 - pop(t, 0, 180)) * 500}) rotate(${-2 + 2 * Math.sin(t / 30)} 470 545)`}
        filter={`url(#ombre${ID})`}>
        <rect x={296} y={208} width={348} height={676} rx={52} fill="#14141F" />
        <rect x={300} y={212} width={340} height={668} rx={48} fill="#2A2A3C" />
        <rect x={ECRAN.x} y={ECRAN.y} width={ECRAN.l} height={ECRAN.h} rx={34} fill="#F6F6FB" />
        <rect x={430} y={222} width={80} height={14} rx={7} fill="#14141F" />
        <g transform={`translate(${ECRAN.x} ${ECRAN.y})`}>
          {/* En-tête de l'application de discussion */}
          <rect width={ECRAN.l} height={74} rx={34} fill="#fff" />
          <rect y={40} width={ECRAN.l} height={34} fill="#fff" />
          <line x1={0} x2={ECRAN.l} y1={74} y2={74} stroke="#E2E2EA" strokeWidth={2} />
          <circle cx={40} cy={42} r={22} fill="#7B2FF7" />
          <path d="M 40 28 L 44 38 L 54 42 L 44 46 L 40 56 L 36 46 L 26 42 L 36 38 Z" fill="#fff" />
          <text x={72} y={40} fontFamily={POLICE_SVG} fontWeight={900} fontSize={21} fill="#1B1B2F">Assistant IA</text>
          <circle cx={78} cy={56} r={5} fill="#22C55E" />
          <text x={88} y={61} fontFamily={POLICE_SVG} fontWeight={800} fontSize={14} fill="#22A05A">en ligne</text>
          {/* Version floue */}
          <g opacity={1 - vide} transform={`translate(0 ${-200 * vide})`}>
            <Bulle x={96} y={96} l={196} h={96} moi k={kq1}>
              <Texte lignes={q1} n={n1} couleur="#fff" flou />
            </Bulle>
            <g transform={`translate(${secoue(e0) + secoue(e1)} 0)`}>
              {t >= 30 && t < 42 ? <Bulle x={14} y={216} l={110} h={50} moi={false} k={krep1}><Points t={t} x={33} y={30} /></Bulle> : null}
              {t >= 42 ? (
                <Bulle x={14} y={216} l={236} h={190} moi={false} k={1}>
                  <g filter={`url(#flou${ID})`}>
                    {Array.from({length: lignesFloues}).map((_, i) => (
                      <rect key={i} x={18} y={22 + i * 32} width={[190, 160, 200, 120, 170][i]} height={16} rx={8} fill="#A9A9BC" />
                    ))}
                  </g>
                </Bulle>
              ) : null}
            </g>
          </g>
          {/* Version précise */}
          {t >= e2 ? (
            <g>
              <Bulle x={62} y={92} l={232} h={128} moi k={kq2}>
                <Texte lignes={q2} n={n2} couleur="#fff" taille={18} y={30} />
              </Bulle>
              {kpoints2 ? <Bulle x={14} y={246} l={110} h={50} moi={false} k={1}><Points t={t} x={33} y={30} /></Bulle> : null}
              {t >= e3 - 12 ? (
                <Bulle x={14} y={246} l={262} h={218} moi={false} k={krep2} fond="#E8FBEF">
                  <rect x={0} y={10} width={6} height={198} rx={3} fill="#22C55E" />
                  <Texte lignes={r2} n={n3} couleur="#14532D" taille={18} y={34} />
                </Bulle>
              ) : null}
            </g>
          ) : null}
          {/* Champ de saisie */}
          <rect x={14} y={566} width={226} height={46} rx={23} fill="#fff" stroke="#DADAE6" strokeWidth={2} />
          <text x={34} y={596} fontFamily={POLICE_SVG} fontWeight={800} fontSize={16} fill="#A0A0B4">Écris ta question…</text>
          <circle cx={272} cy={589} r={24} fill="#1D7CF2" />
          <path d="M 262 580 L 284 589 L 262 598 L 266 589 Z" fill="#fff" />
        </g>
      </g>
      {/* Verdicts */}
      <g opacity={1 - vide}>
        <Marque x={800} y={430} r={78} type="croix" k={kCroix} id={ID} />
        <Etiquette x={800} y={575} lignes={t < e1 ? ['RÉPONSE', 'VAGUE'] : ['RÉSULTAT', 'DÉCEVANT']} couleur="#D92B2B"
          k={pop(t, e0 + 4)} />
        <Etiquette x={160} y={500} lignes={['QUESTION', 'FLOUE']} couleur="#6B6B80" k={pop(t, 12)} />
      </g>
      <Marque x={800} y={430} r={78} type="coche" k={kCoche} id={ID} />
      <Etiquette x={800} y={575} lignes={['RÉPONSE', 'PRÉCISE']} couleur="#12A150" k={pop(t, e3 + 4)} />
      <Etiquette x={160} y={500} lignes={['QUESTION', 'PRÉCISE']} couleur="#1D5BFF" k={pop(t, e2 + 8)} />
    </svg>
  );
};

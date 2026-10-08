import React from 'react';
import {Easing} from 'remotion';
import {Defs, Gros, lin, POLICE_SVG, pop, prog, Telephone, type PropsScene} from './outils';

// c. « Est-ce que tu sais l'utiliser ? … installé dans ton téléphone » : un grand téléphone avec ses applications ;
// l'appli IA brille, trois grands « ? » se balancent à côté. Sur l'étape 0, un doigt touche l'appli : la discussion
// s'ouvre et l'assistant salue.
const ID = 'tel';
const TEL = {x: 60, y: 204, l: 404, h: 676};
const EL = TEL.l - 36;
const COULEURS = ['#FF5A5A', '#1D7CF2', '#22C55E', '#FFC23D', '#E0337E', '#13B5C9', '#F0560F', '#5B6BD6', '#2E2E44',
  '#0E9F6E', '#B57BFF', '#FF8A00'];
const IA = {x: 182, y: 380}; // centre de l'icône de l'appli IA (repère de l'écran)

const Question: React.FC<{x: number; y: number; taille: number; angle: number}> = ({x, y, taille, angle}) => (
  <text x={x} y={y} fontSize={taille} fontFamily={POLICE_SVG} fontWeight={900} fill="#111" stroke="#fff"
    strokeWidth={taille * 0.12} strokeLinejoin="round" style={{paintOrder: 'stroke'}} textAnchor="middle"
    transform={`rotate(${angle} ${x} ${y})`}>?</text>
);

export const TelephoneQuestion: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 60] = etapes;
  const ouverture = prog(t, e0 + 4, 8, Easing.out(Easing.cubic)); // l'appli s'ouvre depuis son icône
  const doigt = lin(t, e0 - 10, e0, 0, 1);
  const ondes = t >= e0 && t < e0 + 14 ? (t - e0) / 14 : -1;
  const kq = (a: number) => pop(t, a, 200);
  const balance = (i: number) => Math.sin((t + i * 11) / 9) * 9;
  const n = Math.floor(lin(t, e0 + 12, e0 + 22, 0, 22));
  const salut = 'Bonjour ! Je t\'aide ?';
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      <g transform={`translate(0 ${(1 - pop(t, 0, 180)) * 700}) rotate(${1.5 * Math.sin(t / 25)} 262 542)`}
        filter={`url(#ombre${ID})`}>
        <Telephone {...TEL} ecran="#1B2350">
          {/* Écran d'accueil : fond dégradé, heure, grille d'applications. */}
          <defs>
            <linearGradient id={`acc${ID}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B4CCA" /><stop offset="100%" stopColor="#B03FD9" />
            </linearGradient>
          </defs>
          <rect width={EL} height={640} fill={`url(#acc${ID})`} />
          <text x={EL / 2} y={150} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={800} fontSize={72}
            fill="#fff">9:41</text>
          {COULEURS.map((c, i) => {
            const col = i % 4;
            const lig = Math.floor(i / 4);
            const x = 36 + col * 84;
            const y = 220 + lig * 92;
            if (i === 5) return null; // emplacement de l'appli IA
            const k = pop(t, 4 + i, 300);
            return <rect key={i} x={x + 30 * (1 - k)} y={y + 30 * (1 - k)} width={60 * k} height={60 * k} rx={16} fill={c} />;
          })}
          {/* Appli IA : plus grande, elle pulse. */}
          <g transform={`translate(${IA.x} ${IA.y - 52}) scale(${(1.25 + 0.08 * Math.sin(t / 4)) * pop(t, 10)})`}>
            <circle r={58} fill="#FFD400" opacity={0.3 + 0.2 * Math.sin(t / 4)} />
            <rect x={-36} y={-36} width={72} height={72} rx={20} fill="#fff" />
            <path d="M 0 -24 L 7 -7 L 24 0 L 7 7 L 0 24 L -7 7 L -24 0 L -7 -7 Z" fill="#7B2FF7" />
          </g>
          <text x={IA.x} y={IA.y + 16} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={26}
            fill="#fff">IA</text>
          <rect x={20} y={540} width={EL - 40} height={84} rx={28} fill="#fff" opacity={0.22} />
          {['#22C55E', '#1D7CF2', '#FF5A5A', '#FFC23D'].map((c, i) => (
            <rect key={c} x={44 + i * 80} y={552} width={60} height={60} rx={16} fill={c} />
          ))}
          {/* Ondes du toucher. */}
          {ondes >= 0 ? <circle cx={IA.x} cy={IA.y - 52} r={30 + 90 * ondes} fill="none" stroke="#fff"
            strokeWidth={8} opacity={1 - ondes} /> : null}
          {/* L'appli s'ouvre en grandissant depuis son icône. */}
          {ouverture > 0 ? (
            <g transform={`translate(${IA.x * (1 - ouverture)} ${(IA.y - 52) * (1 - ouverture)}) scale(${ouverture})`}>
              <rect width={EL} height={640} fill="#F6F6FB" />
              <rect width={EL} height={96} fill="#fff" />
              <circle cx={56} cy={56} r={28} fill="#7B2FF7" />
              <path d="M 56 38 L 61 51 L 74 56 L 61 61 L 56 74 L 51 61 L 38 56 L 51 51 Z" fill="#fff" />
              <text x={98} y={66} fontFamily={POLICE_SVG} fontWeight={900} fontSize={30} fill="#1B1B2F">Assistant IA</text>
              <g transform={`scale(${pop(t, e0 + 10)})`} opacity={t >= e0 + 10 ? 1 : 0}>
                <rect x={16} y={136} width={EL - 32} height={150} rx={26} fill="#E3E3EE" />
                <text x={36} y={198} fontFamily={POLICE_SVG} fontWeight={900} fontSize={40} fill="#1B1B2F">
                  {salut.slice(0, Math.min(n, 10))}
                </text>
                <text x={36} y={252} fontFamily={POLICE_SVG} fontWeight={900} fontSize={40} fill="#1B1B2F">
                  {salut.slice(10, Math.max(10, n))}
                </text>
              </g>
              <rect x={16} y={572} width={262} height={52} rx={26} fill="#fff" stroke="#DADAE6" strokeWidth={3} />
              <circle cx={318} cy={598} r={30} fill="#1D7CF2" />
            </g>
          ) : null}
        </Telephone>
        {/* Doigt qui vient toucher l'appli. */}
        {doigt > 0 && t < e0 + 12 ? (
          <g transform={`translate(${TEL.x + 18 + IA.x + 40 * (1 - doigt)} ${TEL.y + 18 + IA.y - 20 + 260 * (1 - doigt)})`}>
            <path d="M -18 0 C -18 -30 18 -30 18 0 L 22 120 L -22 120 Z" fill="#8A5A3C" stroke="#fff" strokeWidth={6} />
            <ellipse cx={0} cy={-6} rx={11} ry={13} fill="#E8C4A8" />
          </g>
        ) : null}
      </g>
      {/* Trois grands points d'interrogation qui se balancent. */}
      <g transform={`translate(0 ${-6 * Math.sin(t / 8)})`}>
        <g transform={`scale(${kq(4)})`} style={{transformOrigin: '640px 380px'}}><Question x={640} y={420} taille={170} angle={-14 + balance(0)} /></g>
        <g transform={`scale(${kq(8)})`} style={{transformOrigin: '850px 330px'}}><Question x={850} y={380} taille={140} angle={16 + balance(1)} /></g>
        <g transform={`scale(${kq(12)})`} style={{transformOrigin: '740px 700px'}}><Question x={745} y={760} taille={330} angle={-4 + balance(2)} /></g>
      </g>
      <g transform={`translate(720 860) scale(${pop(t, e0 + 4)})`} opacity={t >= e0 + 4 ? 1 : 0}>
        <Gros x={0} y={0} taille={72} couleur="#FFD400" contour="#14141F">APPLI IA</Gros>
      </g>
    </svg>
  );
};

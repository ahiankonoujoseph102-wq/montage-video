import React from 'react';
import {Defs, lin, Marque, POLICE_SVG, pop, Telephone, type PropsScene} from './outils';

// k. « Créer votre compte, confirmez, rejoignez le groupe » : un grand téléphone montre chaque écran (formulaire,
// compte confirmé, groupe de discussion) ; à droite, les trois étapes se cochent une à une sur leur mot.
const ID = 'ins';
const TEL = {x: 56, y: 204, l: 404, h: 676};
const EL = TEL.l - 36;
const ETAPES = [['CRÉER SON', 'COMPTE'], ['CONFIRMER'], ['REJOINDRE', 'LE GROUPE']];
const COULEURS = ['#1D7CF2', '#F0560F', '#0E9F6E'];

const Ecran: React.FC<{n: number; u: number; t: number}> = ({n, u, t}) => {
  const k = pop(u, 0, 220);
  const champ = (y: number, label: string, texte: string, a: number) => (
    <g>
      <text x={28} y={y} fontFamily={POLICE_SVG} fontWeight={800} fontSize={24} fill="#6B6B80">{label}</text>
      <rect x={24} y={y + 12} width={EL - 48} height={66} rx={16} fill="#fff" stroke="#C9D2E6" strokeWidth={3} />
      <text x={44} y={y + 56} fontFamily={POLICE_SVG} fontWeight={800} fontSize={30} fill="#1B1B2F">
        {texte.slice(0, Math.floor(lin(u, a, a + 10, 0, texte.length)))}
      </text>
    </g>
  );
  if (n === 0) {
    return (
      <g opacity={k > 0 ? 1 : 0}>
        <rect width={EL} height={640} fill="#F2F5FC" />
        <text x={EL / 2} y={110} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={42}
          fill="#1D5BFF">Inscription</text>
        {champ(180, 'Nom', 'Kossi A.', 4)}
        {champ(310, 'Téléphone', '+228 …', 12)}
        <g transform={`translate(${EL / 2} 520) scale(${1 + 0.06 * Math.sin(u / 3)})`}>
          <rect x={-150} y={-44} width={300} height={88} rx={44} fill="#1D5BFF" />
          <text y={14} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={36} fill="#fff">CRÉER</text>
        </g>
      </g>
    );
  }
  if (n === 1) {
    return (
      <g>
        <rect width={EL} height={640} fill="#FFF4EC" />
        <g transform={`translate(${EL / 2} 250) scale(${k})`}>
          <rect x={-120} y={-80} width={240} height={160} rx={18} fill="#F0560F" />
          <path d="M -120 -70 L 0 20 L 120 -70" fill="none" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
        </g>
        <g transform={`translate(${EL / 2 + 100} 320) scale(${pop(u, 8, 260)})`}>
          <circle r={46} fill="#22C55E" stroke="#fff" strokeWidth={8} />
          <polyline points="-20,0 -6,16 22,-16" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round"
            strokeLinejoin="round" />
        </g>
        <text x={EL / 2} y={460} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={44}
          fill="#1B1B2F" opacity={lin(u, 10, 16, 0, 1)}>Compte</text>
        <text x={EL / 2} y={516} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={44}
          fill="#12A150" opacity={lin(u, 12, 18, 0, 1)}>confirmé</text>
      </g>
    );
  }
  return (
    <g>
      <rect width={EL} height={640} fill="#EAF7F0" />
      <rect width={EL} height={110} fill="#0E9F6E" />
      <circle cx={58} cy={58} r={32} fill="#fff" />
      <text x={58} y={70} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={30} fill="#0E9F6E">IA</text>
      <text x={104} y={56} fontFamily={POLICE_SVG} fontWeight={900} fontSize={30} fill="#fff">Groupe</text>
      <text x={104} y={92} fontFamily={POLICE_SVG} fontWeight={800} fontSize={24} fill="#D6FFE9">Formation IA</text>
      {[0, 1, 2].map((i) => {
        const kb = pop(u, 4 + i * 7, 240);
        const moi = i === 2;
        return (
          <g key={i} transform={`translate(${moi ? EL - 24 : 24} ${170 + i * 120}) scale(${kb})`} opacity={kb > 0 ? 1 : 0}>
            <rect x={moi ? -250 : 0} y={0} width={250} height={92} rx={22} fill={moi ? '#22C55E' : '#fff'} />
            <text x={moi ? -230 : 20} y={58} fontFamily={POLICE_SVG} fontWeight={900} fontSize={32}
              fill={moi ? '#fff' : '#1B1B2F'}>{['Bienvenue !', 'Samedi 9h', 'Merci !'][i]}</text>
          </g>
        );
      })}
      <text x={EL / 2} y={590} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={30} fill="#0E9F6E"
        opacity={0.6 + 0.4 * Math.sin(t / 4)}>+1 membre</text>
    </g>
  );
};

export const Inscription: React.FC<PropsScene> = ({t, etapes}) => {
  const es = [etapes[0] ?? 10, etapes[1] ?? 50, etapes[2] ?? 100];
  let n = 0;
  for (let i = 1; i < 3; i++) if (t >= es[i]) n = i;
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      <g transform={`translate(0 ${(1 - pop(t, 0, 180)) * 700}) rotate(${-1.5 + 1.5 * Math.sin(t / 30)} 258 542)`}
        filter={`url(#ombre${ID})`}>
        <Telephone {...TEL}>
          <Ecran n={n} u={t - (n === 0 ? 0 : es[n])} t={t} />
        </Telephone>
      </g>
      {ETAPES.map((lignes, i) => {
        const y = 214 + i * 226;
        const k = pop(t, 3 + i * 4, 240);
        const fait = t >= es[i];
        const actif = n === i;
        return (
          <g key={i} transform={`translate(${680} ${y + 95}) scale(${k * (actif ? 1.04 : 1)}) translate(-205 -95)`}
            opacity={k > 0 ? 1 : 0} filter={`url(#ombre${ID})`}>
            <rect width={410} height={190} rx={30} fill={fait ? '#fff' : 'rgba(255,255,255,0.75)'} />
            {actif ? <rect width={410} height={190} rx={30} fill="none" stroke="#FFD400" strokeWidth={10} /> : null}
            <circle cx={56} cy={95} r={40} fill={COULEURS[i]} />
            <text x={56} y={113} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={52} fill="#fff">{i + 1}</text>
            {lignes.map((l, j) => (
              <text key={j} x={108} y={(lignes.length === 1 ? 110 : 86) + j * 52} fontFamily={POLICE_SVG} fontWeight={900}
                fontSize={42} fill="#1B1B2F">{l}</text>
            ))}
            <Marque x={410} y={6} r={38} type="coche" k={pop(t, es[i] + 2, 260)} id={ID} />
          </g>
        );
      })}
    </svg>
  );
};

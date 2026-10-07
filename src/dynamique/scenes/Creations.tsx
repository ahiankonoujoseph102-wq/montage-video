import React from 'react';
import {Defs, lin, POLICE_SVG, pop, type PropsScene} from './outils';

// e. « Sites web, applications, agents IA, automatisations » : quatre écrans qui se construisent l'un après
// l'autre, chacun sur son mot (étapes 0 à 3) : une page web qui s'assemble, une application, un robot, des
// engrenages reliés.
const ID = 'cre';
const L = 420;
const HC = 300;
const BANDE = 54;
const CARTES = [
  {x: 60, y: 212, titre: 'SITE WEB', c: '#1D7CF2'},
  {x: 520, y: 212, titre: 'APPLICATION', c: '#F0560F'},
  {x: 60, y: 548, titre: 'AGENT IA', c: '#7B2FF7'},
  {x: 520, y: 548, titre: 'AUTOMATISATION', c: '#0E9F6E'},
];

const engrenage = (r: number, dents: number) => {
  const pts: string[] = [];
  for (let i = 0; i < dents * 4; i++) {
    const a = (i / (dents * 4)) * Math.PI * 2;
    const rr = i % 4 === 0 || i % 4 === 1 ? r : r * 0.8;
    pts.push(`${rr * Math.cos(a)},${rr * Math.sin(a)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

const PageWeb: React.FC<{u: number}> = ({u}) => {
  const k = (a: number) => pop(u, a, 260);
  const cx = lin(u, 26, 40, 330, 250);
  const cy = lin(u, 26, 40, 220, 150);
  const clic = u > 40 && u < 46 ? 0.8 : 1;
  return (
    <g>
      <rect x={14} y={12} width={L - 28} height={HC - BANDE - 22} rx={12} fill="#fff" />
      <rect x={14} y={12} width={L - 28} height={30} rx={12} fill="#E6E9F2" />
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => <circle key={c} cx={34 + i * 20} cy={27} r={6} fill={c} />)}
      <rect x={104} y={19} width={200} height={16} rx={8} fill="#fff" />
      <g transform={`translate(${(1 - k(2)) * -380} 0)`}>
        <rect x={26} y={52} width={L - 52} height={86} rx={10} fill="#1D7CF2" />
        <rect x={26} y={52} width={L - 52} height={86} rx={10} fill={`url(#brillance${ID})`} />
        <circle cx={330} cy={94} r={30} fill="#FFC23D" opacity={0.9} />
      </g>
      <g transform={`translate(44 74) scale(${k(8)})`}><rect width={150} height={14} rx={7} fill="#fff" />
        <rect y={22} width={100} height={10} rx={5} fill="#fff" opacity={0.7} /></g>
      <g transform={`translate(44 112) scale(${k(14) * (u > 40 ? 1 + 0.08 * Math.sin(u / 2) : 1)})`}>
        <rect width={84} height={18} rx={9} fill="#FFC23D" /></g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${30 + i * 122} 150) scale(${k(16 + i * 3)})`}>
          <rect width={110} height={70} rx={10} fill="#F1F4FB" stroke="#DCE2F0" strokeWidth={2} />
          <circle cx={22} cy={22} r={11} fill={['#F0560F', '#7B2FF7', '#0E9F6E'][i]} />
          <rect x={12} y={42} width={80} height={8} rx={4} fill="#C9D2E6" />
          <rect x={12} y={56} width={56} height={8} rx={4} fill="#C9D2E6" />
        </g>
      ))}
      {u > 24 ? (
        <g transform={`translate(${cx} ${cy}) scale(${clic})`}>
          <path d="M 0 0 L 0 34 L 9 26 L 16 42 L 23 39 L 16 23 L 28 23 Z" fill="#14141F" stroke="#fff" strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

const Application: React.FC<{u: number}> = ({u}) => {
  const couleurs = ['#F0560F', '#1D7CF2', '#22C55E', '#FFC23D', '#E0337E', '#7B2FF7', '#13B5C9', '#FF5A5A', '#2E2E44'];
  return (
    <g>
      <g transform={`translate(70 ${16 + (1 - pop(u, 0, 200)) * 260})`}>
        <rect width={130} height={224} rx={22} fill="#14141F" />
        <rect x={7} y={7} width={116} height={210} rx={17} fill="#FFF4EC" />
        <rect x={7} y={7} width={116} height={34} rx={17} fill="#F0560F" />
        {couleurs.map((c, i) => {
          const k = pop(u, 4 + i * 2, 280);
          return <rect key={i} x={20 + (i % 3) * 32 + 12 * (1 - k)} y={54 + Math.floor(i / 3) * 34 + 12 * (1 - k)}
            width={24 * k} height={24 * k} rx={7} fill={c} />;
        })}
        <rect x={20} y={164} width={90} height={36} rx={12} fill="#F0560F" opacity={pop(u, 24)} />
      </g>
      {[0, 1, 2].map((i) => {
        const k = pop(u, 16 + i * 6);
        const y = 40 + i * 62 + Math.sin((u + i * 10) / 8) * 4;
        return (
          <g key={i} transform={`translate(${222 + (1 - k) * 160} ${y})`} opacity={k > 0 ? 1 : 0}>
            <rect width={170} height={48} rx={14} fill="#fff" />
            <circle cx={24} cy={24} r={13} fill={['#22C55E', '#FFC23D', '#1D7CF2'][i]} />
            <rect x={46} y={14} width={100} height={8} rx={4} fill="#C9D2E6" />
            <rect x={46} y={28} width={70} height={8} rx={4} fill="#E1E6F2" />
          </g>
        );
      })}
      <g transform={`translate(196 30) scale(${pop(u, 30)})`}>
        <circle r={20} fill="#FF3B3B" /><text y={8} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900}
          fontSize={22} fill="#fff">3</text>
      </g>
    </g>
  );
};

const Robot: React.FC<{u: number}> = ({u}) => {
  const cligne = (u % 46) > 42 ? 0.15 : 1;
  const salut = Math.sin(u / 3.5) * 22;
  const k = pop(u, 0, 200);
  return (
    <g transform={`translate(150 ${236 - (1 - k) * 20}) scale(${k})`}>
      <rect x={-70} y={-62} width={140} height={84} rx={22} fill="#5B6BD6" />
      <rect x={-70} y={-62} width={140} height={40} rx={22} fill="#fff" opacity={0.15} />
      <circle cx={0} cy={-20} r={10} fill="#F0F3FF" />
      <g transform={`translate(78 -50) rotate(${-40 + salut})`}>
        <rect x={-10} y={-70} width={20} height={74} rx={10} fill="#8C98F0" />
        <circle cy={-74} r={16} fill="#8C98F0" />
      </g>
      <rect x={-98} y={-48} width={26} height={60} rx={13} fill="#8C98F0" />
      <g transform="translate(0 -122)">
        <line x1={0} y1={-34} x2={0} y2={-58} stroke="#C3CAF7" strokeWidth={6} />
        <circle cy={-64} r={11} fill="#FF4D6D" opacity={0.6 + 0.4 * Math.sin(u / 3)} />
        <circle cy={-64} r={20} fill="#FF4D6D" opacity={0.2 + 0.2 * Math.sin(u / 3)} />
        <rect x={-80} y={-36} width={160} height={116} rx={30} fill="#E8ECFF" />
        <rect x={-80} y={-36} width={160} height={50} rx={30} fill="#fff" opacity={0.6} />
        <rect x={-60} y={-14} width={120} height={70} rx={18} fill="#1A1E3C" />
        {[-26, 26].map((x) => <rect key={x} x={x - 12} y={4 - 10 * cligne + 10} width={24} height={20 * cligne} rx={8}
          fill="#5CF0FF" />)}
        {[0, 1, 2, 3, 4].map((i) => {
          const h = 4 + 10 * Math.abs(Math.sin(u / 2.5 + i));
          return <rect key={i} x={-22 + i * 10} y={44 - h / 2} width={6} height={h} rx={3} fill="#5CF0FF" />;
        })}
        <rect x={-92} y={4} width={14} height={34} rx={6} fill="#C3CAF7" />
        <rect x={78} y={4} width={14} height={34} rx={6} fill="#C3CAF7" />
      </g>
      <g transform={`translate(120 -190) scale(${pop(u, 14)})`}>
        <rect x={0} y={-30} width={128} height={46} rx={16} fill="#fff" />
        <path d="M 10 10 L -8 28 L 30 12 Z" fill="#fff" />
        <text x={64} y={2} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={20} fill="#5B2FD6">
          Bonjour !
        </text>
      </g>
    </g>
  );
};

const Engrenages: React.FC<{u: number}> = ({u}) => {
  const a = u * 4;
  const progres = ((u * 2.2) % 100) / 100;
  return (
    <g>
      <g transform="translate(205 118)">
        <g transform={`rotate(${a})`}><path d={engrenage(62, 10)} fill="#FFC23D" /><circle r={22} fill="#0E6F4E" /></g>
        <g transform={`translate(98 -40) rotate(${-a * 1.55 + 9})`}><path d={engrenage(42, 7)} fill="#7EE8A8" />
          <circle r={14} fill="#0E6F4E" /></g>
        <g transform={`translate(-88 50) rotate(${-a * 1.3 + 12})`}><path d={engrenage(46, 8)} fill="#fff" />
          <circle r={15} fill="#0E6F4E" /></g>
      </g>
      {/* Flux : un message entre, passe dans les engrenages, ressort validé. */}
      <line x1={40} y1={212} x2={380} y2={212} stroke="#fff" strokeWidth={5} strokeDasharray="10 10"
        strokeDashoffset={-u * 3} opacity={0.8} />
      <g transform="translate(40 212)">
        <rect x={-26} y={-18} width={52} height={36} rx={6} fill="#fff" />
        <path d="M -26 -18 L 0 4 L 26 -18" fill="none" stroke="#0E9F6E" strokeWidth={4} />
      </g>
      <circle cx={70 + 280 * progres} cy={212} r={10} fill="#FFC23D" />
      <g transform="translate(380 212)">
        <circle r={24} fill="#22C55E" stroke="#fff" strokeWidth={4} />
        <polyline points="-10,0 -2,8 11,-8" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      </g>
    </g>
  );
};

const CONTENUS = [PageWeb, Application, Robot, Engrenages];

export const Creations: React.FC<PropsScene> = ({t, etapes}) => {
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {CARTES.map((c, i) => {
        const e = etapes[i] ?? 30 + i * 25;
        const slot = pop(t, 2 + i * 3, 200);
        const k = pop(t, e, 200);
        const u = t - e;
        const Contenu = CONTENUS[i];
        const flotte = Math.sin((t + i * 17) / 14) * 5;
        return (
          <g key={i} transform={`translate(${c.x + L / 2} ${c.y + HC / 2 + flotte})`}>
            {/* Emplacement vide en pointillés avant la construction. */}
            <rect x={-L / 2} y={-HC / 2} width={L} height={HC} rx={26} fill="#fff" fillOpacity={0.08} stroke="#fff"
              strokeOpacity={0.6} strokeWidth={4} strokeDasharray="16 12" strokeDashoffset={-t} transform={`scale(${slot})`}
              opacity={u >= 0 ? 1 - Math.min(1, k) : 1} />
            {u >= 0 ? (
              <g transform={`scale(${0.5 + 0.5 * k}) rotate(${(1 - Math.min(1, k)) * -8})`} filter={`url(#ombre${ID})`}>
                <g transform={`translate(${-L / 2} ${-HC / 2})`}>
                  <rect width={L} height={HC} rx={26} fill={c.c} />
                  <rect width={L} height={HC / 2} rx={26} fill={`url(#brillance${ID})`} />
                  <svg width={L} height={HC - BANDE} overflow="hidden"><Contenu u={u} /></svg>
                  <rect y={HC - BANDE} width={L} height={BANDE} fill="#000" opacity={0.28} />
                  <text x={L / 2} y={HC - 16} textAnchor="middle" fontFamily={POLICE_SVG} fontWeight={900} fontSize={34}
                    fill="#fff" opacity={lin(u, 6, 12, 0, 1)}>{c.titre}</text>
                </g>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

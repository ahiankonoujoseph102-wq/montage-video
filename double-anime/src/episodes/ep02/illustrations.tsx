import {Easing, interpolate} from 'remotion';
import {Etoile} from '../../commun/Ecran';
import {hasard} from '../../commun/hasard';
import {pop, prog} from '../../commun/temps';
import {COULEURS, POLICE} from '../../theme';

// Illustrations animées plein écran, dans le style 2D de la série (aplats,
// couleurs du logo). Aucune marque redessinée : icônes génériques seulement.
// Le dessin occupe la bande y 300–1040 (zone sûre) ; le libellé est dessous.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
const O = COULEURS.or;
const VI = COULEURS.violet;
const VF = COULEURS.violetFonce;
const B = COULEURS.blanc;
const ROUGE = '#ff4d4f';
const VERT = '#2ecc71';

export type Props = {t: number; d: number; tg: number; temps: Record<string, number>; n?: number; texte?: string; partie?: number; phase?: number};

export const Fond: React.FC<{t: number; children: React.ReactNode; libelle?: React.ReactNode; teinte?: string}> = ({t, children, libelle, teinte = '#1b1f63'}) => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 38%, ${teinte} 0%, ${N} 70%)`, overflow: 'hidden', fontFamily: POLICE}}>
    {/* rayons lents et étoiles qui dérivent : le fond n'est jamais figé */}
    <div style={{position: 'absolute', left: 540 - 900, top: 640 - 900, width: 1800, height: 1800, transform: `rotate(${t * 12}deg)`, opacity: 0.18}}>
      <svg width={1800} height={1800} viewBox="-900 -900 1800 1800">
        {Array.from({length: 16}, (_, i) => (
          <path key={i} d={`M0 0 L${Math.cos((i / 16) * 2 * Math.PI) * 900} ${Math.sin((i / 16) * 2 * Math.PI) * 900} L${Math.cos(((i + 0.45) / 16) * 2 * Math.PI) * 900} ${Math.sin(((i + 0.45) / 16) * 2 * Math.PI) * 900} Z`} fill={i % 2 ? VI : '#ffffff'} opacity={0.35} />
        ))}
      </svg>
    </div>
    {Array.from({length: 10}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: 80 + hasard(i) * 860, top: 260 + ((hasard(i + 9) * 1000 - t * 60 * (0.5 + hasard(i + 3))) % 1000 + 1000) % 1000, transform: `rotate(${t * 90 + i * 40}deg)`, opacity: 0.6}}>
        <Etoile taille={18 + hasard(i + 5) * 26} couleur={i % 3 ? VI : O} />
      </div>
    ))}
    {children}
    {libelle ? (
      <div style={{position: 'absolute', left: 60, right: 140, top: 950, textAlign: 'center', color: B, fontWeight: 800, fontSize: 62, lineHeight: 1.08, transform: `scale(${pop(t, 0.12, 0.35)})`, textShadow: '0 6px 20px #000c'}}>
        {libelle}
      </div>
    ) : null}
  </div>
);

export const Svg: React.FC<{children: React.ReactNode; y?: number; h?: number}> = ({children, y = 300, h = 680}) => (
  <svg style={{position: 'absolute', left: 90, top: y}} width={820} height={h} viewBox={`0 0 820 ${h}`}>
    {children}
  </svg>
);

export const Croix: React.FC<{t: number; a: number; cx: number; cy: number; r: number}> = ({t, a, cx, cy, r}) => {
  const p1 = prog(t, a, a + 0.18, Easing.out(Easing.quad));
  const p2 = prog(t, a + 0.14, a + 0.32, Easing.out(Easing.quad));
  const l = r * 2.83;
  return (
    <g stroke={ROUGE} strokeWidth={34} strokeLinecap="round" style={{filter: 'drop-shadow(0 6px 10px #0009)'}}>
      <path d={`M${cx - r} ${cy - r} L${cx + r} ${cy + r}`} strokeDasharray={l} strokeDashoffset={l * (1 - p1)} />
      <path d={`M${cx + r} ${cy - r} L${cx - r} ${cy + r}`} strokeDasharray={l} strokeDashoffset={l * (1 - p2)} />
    </g>
  );
};

// ------------------------------------------------------------------ recherche

export const Recherche: React.FC<Props> = ({t}) => {
  const texte = 'Lomé IA School';
  const n = Math.floor(interpolate(t, [0.05, 0.75], [0, texte.length], clamp));
  const resultat = pop(t, 0.9, 0.35);
  const appui = prog(t, 0.78, 0.86) * (1 - prog(t, 0.86, 0.95));
  return (
    <Fond t={t}>
      <div style={{position: 'absolute', left: 90, width: 820, top: 640, transform: `scale(${pop(t, 0, 0.3)})`}}>
        <div style={{height: 130, borderRadius: 65, background: B, display: 'flex', alignItems: 'center', gap: 24, padding: '0 40px', boxShadow: `0 16px 50px #000a, 0 0 0 6px ${VI}`}}>
          <svg width={64} height={64} viewBox="0 0 64 64">
            <circle cx={26} cy={26} r={17} stroke={N} strokeWidth={7} fill="none" />
            <path d="M39 39 L56 56" stroke={N} strokeWidth={8} strokeLinecap="round" />
          </svg>
          <div style={{fontSize: 58, fontWeight: 700, color: N}}>
            {texte.slice(0, n)}
            <span style={{color: VF, opacity: Math.floor(t * 4) % 2 ? 1 : 0.2}}>|</span>
          </div>
          <div style={{marginLeft: 'auto', width: 84, height: 84, borderRadius: 42, background: O, display: 'grid', placeItems: 'center', transform: `scale(${1 - appui * 0.2})`}}>
            <svg width={44} height={44} viewBox="0 0 44 44">
              <path d="M10 22 H34 M24 12 L34 22 L24 32" stroke={N} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{marginTop: 34, borderRadius: 36, background: '#ffffffee', padding: '28px 36px', transform: `scale(${resultat})`, transformOrigin: '50% 0', boxShadow: `0 16px 50px #000a, 0 0 ${40 * resultat}px ${O}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 64, height: 64, borderRadius: 16, background: N, display: 'grid', placeItems: 'center'}}>
              <Etoile taille={40} couleur={O} />
            </div>
            <div>
              <div style={{fontSize: 30, color: '#4a5078'}}>lomeiaschool.laravel.cloud</div>
              <div style={{fontSize: 44, fontWeight: 800, color: VF}}>Lomé IA School</div>
            </div>
          </div>
          <div style={{fontSize: 34, color: '#3a4166', marginTop: 10}}>Formations en intelligence artificielle</div>
        </div>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ sans ordinateur / sans code

export const SansOrdinateur: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Sans <span style={{color: O}}>ordinateur</span></>} teinte="#3a1730">
    <Svg>
      <g transform={`translate(410 340) scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 3) * 2})`}>
        <rect x={-260} y={-200} width={520} height={330} rx={26} fill="#2b3160" stroke={B} strokeWidth={10} />
        <rect x={-228} y={-170} width={456} height={270} rx={12} fill={VF} />
        <path d="M-330 150 H330 L290 200 H-290 Z" fill="#8f96b3" />
        <rect x={-60} y={150} width={120} height={14} rx={7} fill="#5b6185" />
      </g>
      <Croix t={t} a={0.3} cx={410} cy={340} r={230} />
    </Svg>
  </Fond>
);

export const SansCode: React.FC<Props> = ({t}) => {
  const lignes = [
    [0, 280, O],
    [40, 360, VI],
    [40, 220, B],
    [80, 300, '#5ad1ff'],
    [40, 260, VI],
    [0, 180, O],
  ] as const;
  return (
    <Fond t={t} libelle={<>Sans être <span style={{color: O}}>développeur</span></>} teinte="#3a1730">
      <Svg>
        <g transform={`translate(410 340) scale(${pop(t, 0, 0.3)})`}>
          <rect x={-310} y={-250} width={620} height={500} rx={30} fill="#0d1029" stroke={VI} strokeWidth={8} />
          {[0, 1, 2].map((k) => <circle key={k} cx={-270 + k * 34} cy={-212} r={10} fill={[ROUGE, O, VERT][k]} />)}
          <text x={180} y={-196} fontFamily="Poppins" fontWeight={800} fontSize={56} fill={O}>{'</>'}</text>
          {lignes.map(([x, l, c], i) => (
            <rect key={i} x={-260 + x} y={-150 + i * 62} width={l * prog(t, 0.05 + i * 0.05, 0.25 + i * 0.05)} height={30} rx={15} fill={c} />
          ))}
        </g>
        <Croix t={t} a={0.45} cx={410} cy={340} r={230} />
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ affiliation

export const Recommande: React.FC<Props> = ({t}) => {
  const lien = prog(t, 0.2, 0.75, Easing.inOut(Easing.cubic));
  const panier = pop(t, 0.8, 0.35);
  const perso = (x: number, c: string, s: number) => (
    <g transform={`translate(${x} 380) scale(${s})`}>
      <circle cx={0} cy={-90} r={62} fill={c} />
      <path d="M-110 120 Q-110 -10 0 -10 Q110 -10 110 120 Z" fill={c} />
    </g>
  );
  return (
    <Fond t={t} libelle={<>Il <span style={{color: O}}>recommande</span>… quelqu’un <span style={{color: O}}>achète</span></>}>
      <Svg>
        {perso(150, VI, pop(t, 0, 0.3))}
        {perso(670, O, pop(t, 0.1, 0.3))}
        <path d="M240 300 Q410 160 580 300" stroke={B} strokeWidth={10} fill="none" strokeDasharray="22 18" opacity={0.6} />
        <g transform={`translate(${240 + 340 * lien} ${300 - Math.sin(lien * Math.PI) * 110}) rotate(${lien * 30 - 15})`}>
          <rect x={-80} y={-40} width={160} height={80} rx={40} fill={B} />
          <text x={0} y={14} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={38} fill={VF}>lien</text>
        </g>
        <g transform={`translate(730 220) scale(${panier})`}>
          <path d="M-60 -30 H-40 L-20 50 H50 L65 -10 H-30" stroke={B} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={-10} cy={72} r={11} fill={B} />
          <circle cx={42} cy={72} r={11} fill={B} />
        </g>
      </Svg>
    </Fond>
  );
};

export const Commission: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Il gagne une <span style={{color: O}}>commission</span></>} teinte="#3b3110">
    <Svg>
      {Array.from({length: 12}, (_, i) => {
        const a = 0.05 + i * 0.06;
        const chute = prog(t, a, a + 0.35, Easing.in(Easing.quad));
        const pile = i < 7;
        const yFin = pile ? 560 - i * 34 : 600;
        const x = pile ? 300 + (i % 2) * 8 : 470 + (i - 7) * 70;
        const y = -80 + (yFin + 80) * chute;
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={chute > 0 ? 1 : 0}>
            <ellipse cx={0} cy={0} rx={90} ry={30} fill="#b5891a" />
            <ellipse cx={0} cy={-10} rx={90} ry={30} fill={O} />
            <text x={0} y={2} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={28} fill="#8a6100">FCFA</text>
          </g>
        );
      })}
      <g transform={`translate(600 200) scale(${pop(t, 0.6, 0.35)}) rotate(${-8 + Math.sin(t * 5) * 4})`}>
        <circle r={110} fill={VERT} stroke={B} strokeWidth={10} />
        <text y={26} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={76} fill={B}>+10 %</text>
      </g>
    </Svg>
  </Fond>
);

// ------------------------------------------------------------------ méthode et étapes

export const Methode: React.FC<Props> = ({t}) => {
  const etapes = ['Cahier des charges', 'Dépôt GitHub', 'Claude Code', 'Étape par étape', 'Mise en ligne'];
  return (
    <Fond t={t}>
      <div style={{position: 'absolute', left: 120, top: 330, color: O, fontWeight: 800, fontSize: 70, transform: `scale(${pop(t, 0, 0.3)})`, transformOrigin: '0 50%'}}>Ma méthode</div>
      {etapes.map((e, i) => {
        const a = 0.25 + i * 0.22;
        const p = interpolate(t, [a, a + 0.25], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.6))});
        return (
          <div key={i} style={{position: 'absolute', left: 120, top: 450 + i * 120, display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${p * 900}px)`}}>
            <div style={{width: 96, height: 96, borderRadius: 24, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, display: 'grid', placeItems: 'center', fontSize: 56, fontWeight: 800, color: N}}>{i + 1}</div>
            <div style={{fontSize: 54, fontWeight: 800, color: B}}>{e}</div>
          </div>
        );
      })}
    </Fond>
  );
};

export const Etape: React.FC<Props> = ({t, n = 1, texte}) => {
  const tour = interpolate(t, [0, 0.4], [-200, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <Fond t={t} teinte="#2a1d6e">
      <div style={{position: 'absolute', left: 0, right: 90, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <div style={{fontSize: 70, fontWeight: 800, color: B, letterSpacing: 8, opacity: prog(t, 0.1, 0.3)}}>ÉTAPE</div>
        <div style={{width: 340, height: 340, borderRadius: 80, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, display: 'grid', placeItems: 'center', fontSize: 260, fontWeight: 800, color: N, transform: `rotate(${tour}deg) scale(${pop(t, 0, 0.35) * (1 + 0.03 * Math.sin(t * 8))})`, boxShadow: `0 0 80px ${O}aa`}}>
          {n}
        </div>
        <div style={{fontSize: 72, fontWeight: 800, color: O, textAlign: 'center', transform: `scale(${pop(t, 0.3, 0.35)})`}}>{texte}</div>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ cahier des charges

const Feuille: React.FC<{x: number; y: number; r: number; s?: number; propre?: boolean; t: number; lignes?: number}> = ({x, y, r, s = 1, propre, t, lignes = 6}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-150} y={-200} width={300} height={400} rx={18} fill="#fff8e1" stroke="#e8d9a8" strokeWidth={4} />
    {Array.from({length: lignes}, (_, i) =>
      propre ? (
        <rect key={i} x={-110} y={-150 + i * 50} width={i === 0 ? 160 : 220 - (i % 2) * 50} height={i === 0 ? 24 : 14} rx={7} fill={i === 0 ? VF : '#9aa3c0'} />
      ) : (
        <path key={i} d={`M-110 ${-150 + i * 50} q30 ${-14 + hasard(i + r) * 20} 60 0 t60 ${hasard(i) * 10} t60 ${-8} t40 6`} stroke={i % 2 ? '#5b3fc4' : '#3a4166'} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
      )
    )}
  </g>
);

export const Brouillon: React.FC<Props> = ({t}) => {
  // un stylo écrit en désordre sur le bloc-notes
  const p = prog(t, 0.1, 1.8, (x) => x);
  const lignes = 7;
  const courante = Math.min(lignes - 1, Math.floor(p * lignes));
  const avance = (p * lignes) % 1;
  const sx = 230 + avance * 360;
  const sy = 140 + courante * 64 + Math.sin(t * 30) * 8;
  return (
    <Fond t={t} libelle={<>J’écris un <span style={{color: O}}>brouillon</span></>}>
      <Svg>
        <g transform={`translate(410 340) scale(${pop(t, 0, 0.3)}) rotate(-4)`}>
          <rect x={-250} y={-300} width={500} height={600} rx={26} fill="#fff8e1" />
          <rect x={-250} y={-300} width={500} height={70} rx={26} fill={O} />
          {Array.from({length: 8}, (_, k) => <circle key={k} cx={-200 + k * 57} cy={-300} r={12} fill={N} />)}
          {Array.from({length: lignes}, (_, i) => {
            const l = i < courante ? 1 : i === courante ? avance : 0;
            return (
              <path key={i} d={`M-190 ${-200 + i * 64} q40 ${-18 + hasard(i) * 26} 90 0 t90 ${hasard(i + 2) * 16} t90 -12 t90 10`} stroke={i % 3 ? '#3a4166' : VF} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - l)} transform={`rotate(${(hasard(i + 7) - 0.5) * 8})`} />
            );
          })}
        </g>
        <g transform={`translate(${sx} ${sy}) rotate(35)`}>
          <rect x={-14} y={-150} width={28} height={140} rx={8} fill={VF} />
          <path d="M-14 -10 L0 26 L14 -10 Z" fill="#f5d6a0" />
          <rect x={-14} y={-150} width={28} height={24} rx={8} fill={O} />
        </g>
      </Svg>
    </Fond>
  );
};

export const Checklist: React.FC<Props> = ({t, tg, temps}) => {
  const items = [
    ['ecole', 'Ce que fait mon école'],
    ['cible', 'À qui s’adresse le site'],
    ['formations', 'Quelles formations'],
    ['payer', 'Comment payer'],
    ['recevoir', 'Ce qu’ils reçoivent'],
    ['affiliation', 'L’affiliation'],
  ];
  return (
    <Fond t={t}>
      <div style={{position: 'absolute', left: 110, top: 330, right: 150, padding: '30px 40px', borderRadius: 34, background: '#fff8e1', transform: `rotate(-2deg) scale(${pop(t, 0, 0.3)})`, boxShadow: '0 20px 60px #000b'}}>
        <div style={{fontSize: 52, fontWeight: 800, color: VF, marginBottom: 14}}>Mon brouillon</div>
        {items.map(([cle, texte]) => {
          const a = temps[cle] ?? 0;
          const v = tg >= a - 0.05;
          return (
            <div key={cle} style={{display: 'flex', alignItems: 'center', gap: 20, height: 92, opacity: v ? 1 : 0.18, transform: `scale(${v ? pop(tg, a - 0.05, 0.3) : 1})`, transformOrigin: '0 50%'}}>
              <div style={{width: 58, height: 58, borderRadius: 14, background: v ? VERT : '#d8cfae', display: 'grid', placeItems: 'center', color: B, fontSize: 40, fontWeight: 800}}>{v ? '✓' : ''}</div>
              <div style={{fontSize: 48, fontWeight: 700, color: N}}>{texte}</div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

export const Desordre: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>J’écris tout, même en <span style={{color: O}}>désordre</span></>}>
    <Svg>
      {Array.from({length: 7}, (_, i) => {
        const x = 410 + Math.cos(i * 1.7 + t * (1 + i * 0.2)) * 230;
        const y = 330 + Math.sin(i * 2.3 + t * (1.3 + i * 0.1)) * 170;
        return <Feuille key={i} x={x} y={y} r={(hasard(i) - 0.5) * 70 + t * (i % 2 ? 40 : -40)} s={0.6 * pop(t, i * 0.06, 0.3)} t={t} />;
      })}
    </Svg>
  </Fond>
);

export const Organise: React.FC<Props> = ({t}) => {
  const range = prog(t, 0.3, 1.2, Easing.inOut(Easing.cubic));
  return (
    <Fond t={t} libelle={<>Je l’<span style={{color: O}}>organise</span></>}>
      <Svg>
        {Array.from({length: 7}, (_, i) => {
          const x0 = 410 + Math.cos(i * 1.7) * 230;
          const y0 = 330 + Math.sin(i * 2.3) * 170;
          return <Feuille key={i} x={x0 + (410 - x0) * range} y={y0 + (330 - y0) * range + i * 4 * range} r={((hasard(i) - 0.5) * 70) * (1 - range)} s={0.6 + 0.35 * range} t={t} propre={range > 0.85} />;
        })}
        <g opacity={prog(t, 1.2, 1.4)} transform={`translate(410 ${110}) scale(${pop(t, 1.2, 0.3)})`}>
          <rect x={-230} y={-38} width={460} height={76} rx={38} fill={VF} />
          <text y={16} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={42} fill={B}>Cahier des charges</text>
        </g>
      </Svg>
    </Fond>
  );
};

export const BullePrompt: React.FC<Props> = ({t}) => {
  const m = prog(t, 0.15, 0.7, Easing.inOut(Easing.cubic));
  return (
    <Fond t={t} libelle={<>Il devient mon <span style={{color: O}}>premier prompt</span></>}>
      <Svg>
        <g opacity={1 - m} transform={`translate(410 340) scale(${0.95 - m * 0.5})`}>
          <Feuille x={0} y={0} r={0} s={1} t={t} propre />
        </g>
        <g transform={`translate(410 340) scale(${m * (1 + 0.04 * Math.sin(t * 7))})`}>
          <path d="M-300 -150 Q-300 -210 -240 -210 H240 Q300 -210 300 -150 V110 Q300 170 240 170 H-60 L-170 250 L-140 170 H-240 Q-300 170 -300 110 Z" fill={B} stroke={VI} strokeWidth={10} />
          <text y={-40} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={66} fill={VF}>Premier</text>
          <text y={50} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={66} fill={VF}>prompt</text>
        </g>
        {m > 0.9
          ? [0, 1, 2, 3].map((k) => (
              <g key={k} transform={`translate(${410 + Math.cos(k * 1.6 + t * 2) * 360} ${340 + Math.sin(k * 1.6 + t * 2) * 260}) scale(${pop(t, 0.7 + k * 0.05, 0.3)})`}>
                <path d="M0 -26 Q4 -4 26 0 Q4 4 0 26 Q-4 4 -26 0 Q-4 -4 0 -26Z" fill={O} />
              </g>
            ))
          : null}
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ l'IA ne devine pas

export const Robot: React.FC<Props> = ({t, texte}) => (
  <Fond t={t} libelle={texte === 'devine' ? <>L’IA ne <span style={{color: O}}>devine</span> pas</> : <>L’IA ne peut pas <span style={{color: O}}>deviner</span></>} teinte="#20304f">
    <Svg>
      <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 3) * 5})`}>
        <path d="M0 -230 V-170" stroke="#9aa3c0" strokeWidth={12} />
        <circle cx={0} cy={-240} r={22} fill={ROUGE} opacity={0.6 + 0.4 * Math.sin(t * 10)} />
        <rect x={-210} y={-170} width={420} height={330} rx={70} fill="#c9cfe6" />
        <rect x={-170} y={-120} width={340} height={200} rx={50} fill="#20304f" />
        <circle cx={-70} cy={-30} r={34} fill="#5ad1ff" />
        <circle cx={70} cy={-30} r={34} fill="#5ad1ff" />
        <circle cx={-70 + Math.sin(t * 4) * 10} cy={-30} r={14} fill="#20304f" />
        <circle cx={70 + Math.sin(t * 4) * 10} cy={-30} r={14} fill="#20304f" />
        <path d="M-50 40 Q0 20 50 40" stroke="#5ad1ff" strokeWidth={10} fill="none" strokeLinecap="round" />
        <rect x={-250} y={-60} width={40} height={110} rx={18} fill="#9aa3c0" />
        <rect x={210} y={-60} width={40} height={110} rx={18} fill="#9aa3c0" />
      </g>
      {[0, 1, 2].map((k) => {
        const a = t * 2.4 + (k * 2 * Math.PI) / 3;
        return (
          <text key={k} x={410 + Math.cos(a) * 330} y={350 + Math.sin(a) * 120 - 160} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110 + 20 * Math.sin(t * 5 + k)} fill={k === 1 ? VI : O} transform={`rotate(${Math.sin(t * 4 + k) * 20} ${410 + Math.cos(a) * 330} ${350 + Math.sin(a) * 120 - 160})`} opacity={pop(t, 0.15 + k * 0.1, 0.3) > 0 ? 1 : 0}>
            ?
          </text>
        );
      })}
    </Svg>
  </Fond>
);

// ------------------------------------------------------------------ dépôt, chrono, envoi

const Dossier: React.FC<{ouvert: number}> = ({ouvert}) => (
  <g>
    <path d="M-220 -140 H-60 L-30 -100 H220 V160 H-220 Z" fill="#b5891a" />
    <path d={`M-230 ${-60 - ouvert * 30} H230 L210 160 H-210 Z`} fill={O} />
  </g>
);

export const DossierFichiers: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Le <span style={{color: O}}>dossier en ligne</span> du site</>}>
    <Svg>
      <g transform={`translate(410 430) scale(${pop(t, 0, 0.3)})`}>
        <path d="M-220 -140 H-60 L-30 -100 H220 V160 H-220 Z" fill="#b5891a" />
        {Array.from({length: 5}, (_, i) => {
          const a = 0.2 + i * 0.22;
          const p = prog(t, a, a + 0.4, Easing.in(Easing.quad));
          const x = (i - 2) * 150 * (1 - p);
          const y = -420 + 380 * p;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(1 - p) * (i - 2) * 25})`} opacity={p < 1 ? 1 : 0}>
              <path d="M-50 -65 H25 L50 -40 V65 H-50 Z" fill={B} />
              <rect x={-32} y={-20} width={64} height={8} fill={[VI, O, VF, '#5ad1ff', VI][i]} />
              <rect x={-32} y={0} width={44} height={8} fill="#9aa3c0" />
            </g>
          );
        })}
        <path d="M-230 -60 H230 L210 160 H-210 Z" fill={O} />
        <text y={70} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={60} fill={N}>{'</>'}</text>
      </g>
    </Svg>
  </Fond>
);

export const Chrono: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Deux <span style={{color: O}}>minutes</span>, depuis le téléphone</>}>
    <Svg>
      <g transform={`translate(410 380) scale(${pop(t, 0, 0.3)})`}>
        <rect x={-36} y={-300} width={72} height={60} rx={14} fill={VI} />
        <circle r={250} fill={B} stroke={VI} strokeWidth={24} />
        {Array.from({length: 12}, (_, i) => (
          <rect key={i} x={-5} y={-226} width={10} height={i % 3 ? 20 : 40} fill={N} transform={`rotate(${i * 30})`} />
        ))}
        <path d={`M0 0 L0 -200`} stroke={ROUGE} strokeWidth={14} strokeLinecap="round" transform={`rotate(${t * 520})`} />
        <circle r={20} fill={N} />
        <g transform={`translate(0 120) scale(${pop(t, 0.3, 0.3)})`}>
          <rect x={-110} y={-48} width={220} height={96} rx={48} fill={O} />
          <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={62} fill={N}>2 min</text>
        </g>
      </g>
    </Svg>
  </Fond>
);

export const Envoi: React.FC<Props> = ({t, d}) => {
  const branche = prog(t, 0.1, 0.6, Easing.inOut(Easing.cubic));
  const vol = prog(t, d * 0.5, d * 0.95, Easing.in(Easing.quad));
  return (
    <Fond t={t} libelle={<>J’envoie mon <span style={{color: O}}>premier prompt</span></>}>
      <Svg>
        <g transform={`translate(470 360) scale(${pop(t, 0, 0.3)})`}>
          <rect x={-250} y={-260} width={500} height={480} rx={40} fill="#1b2142" stroke={VI} strokeWidth={8} />
          <rect x={-250} y={-260} width={500} height={70} rx={40} fill={VF} />
          <rect x={-200} y={-160} width={260} height={56} rx={28} fill="#ffffff22" />
          <rect x={-60} y={-80} width={260} height={56} rx={28} fill={VI} />
          <rect x={-200} y={140} width={400} height={56} rx={28} fill="#ffffff22" />
        </g>
        <g transform={`translate(${-60 + 260 * branche} ${470}) scale(0.45)`} opacity={1 - prog(t, 0.6, 0.75)}>
          <Dossier ouvert={0} />
        </g>
        <g transform={`translate(${470 + vol * 520} ${470 - vol * 520}) rotate(${-30 + vol * 10}) scale(${pop(t, 0.6, 0.3) * (1 - vol * 0.4)})`}>
          <path d="M-90 0 L90 -60 L20 70 L0 20 Z" fill={B} />
          <path d="M0 20 L90 -60 L-20 30 Z" fill="#c9cfe6" />
        </g>
        {vol > 0 ? <path d={`M470 470 Q${470 + vol * 260} ${520 - vol * 200} ${470 + vol * 500} ${470 - vol * 500}`} stroke={B} strokeWidth={6} strokeDasharray="16 16" fill="none" opacity={0.6} /> : null}
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ étape 4 : le chemin

export const Chemin: React.FC<Props> = ({t, tg, temps, partie = 1}) => {
  const points = [
    ['vitrine', 'Site vitrine'],
    ['formationsChemin', 'Formations'],
    ['inscription', 'Inscription'],
    ['ama', 'Ama'],
  ];
  const pos = [
    [140, 560],
    [340, 360],
    [560, 560],
    [760, 360],
  ];
  // caméra : gros plan sur les points en cours, puis vue d'ensemble
  const cible = partie === 1 ? [410, 460, 1.06] : partie === 2 ? [490, 460, 1.06] : [450, 460, 1.0];
  const z = interpolate(t, [0, 0.5], [cible[2] * 0.9, cible[2]], clamp);
  return (
    <Fond t={t}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${540 - cible[0] - 90}px, ${0}px) scale(${z})`, transformOrigin: `${cible[0] + 90}px ${cible[1] + 300}px`}}>
        <svg style={{position: 'absolute', left: 90, top: 300}} width={900} height={700} viewBox="0 0 900 700">
          <path d={`M${pos.map((p) => p.join(' ')).join(' L')}`} stroke="#ffffff33" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {pos.map((p, i) => {
            const a = temps[points[i][0]] ?? 0;
            const fait = tg >= a;
            return (
              <g key={i} transform={`translate(${p[0]} ${p[1]})`}>
                {i > 0 ? null : null}
                <circle r={70} fill={fait ? VERT : N} stroke={fait ? B : '#ffffff55'} strokeWidth={8} transform={`scale(${fait ? pop(tg, a, 0.35) : 1})`} />
                {fait ? <path d="M-28 2 L-8 24 L30 -22" stroke={B} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - prog(tg, a, a + 0.25))} /> : <text y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={56} fill="#ffffff88">{i + 1}</text>}
                <text y={i % 2 ? -100 : 130} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={46} fill={fait ? O : B}>{points[i][1]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Fond>
  );
};

export const Oeil: React.FC<Props> = ({t}) => {
  const cligne = Math.max(0, 1 - Math.abs(((t * 1.6) % 1.6) - 0.8) * 12);
  const regard = Math.sin(t * 3) * 40;
  return (
    <Fond t={t} libelle={<>Claude me montre un <span style={{color: O}}>aperçu</span></>}>
      <Svg>
        <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)})`}>
          <path d="M-320 0 Q0 -260 320 0 Q0 260 -320 0 Z" fill={B} stroke={VI} strokeWidth={16} />
          <circle cx={regard} r={110} fill={VF} />
          <circle cx={regard} r={52} fill={N} />
          <circle cx={regard + 30} cy={-30} r={20} fill={B} />
          <path d={`M-330 0 Q0 ${-270 + 270 * cligne} 330 0`} fill="none" stroke={VI} strokeWidth={0} />
          <rect x={-340} y={-280} width={680} height={280 * cligne} fill={N} />
          <rect x={-340} y={280 - 280 * cligne} width={680} height={280 * cligne} fill={N} />
        </g>
      </Svg>
    </Fond>
  );
};

export const Correction: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Je demande la <span style={{color: O}}>correction</span></>}>
    <Svg>
      <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)})`}>
        <g transform={`rotate(${t * 220})`}>
          <path d="M-200 0 A200 200 0 0 1 170 -100" stroke={O} strokeWidth={40} fill="none" strokeLinecap="round" />
          <path d="M140 -170 L220 -90 L120 -60 Z" fill={O} />
          <path d="M200 0 A200 200 0 0 1 -170 100" stroke={VI} strokeWidth={40} fill="none" strokeLinecap="round" />
          <path d="M-140 170 L-220 90 L-120 60 Z" fill={VI} />
        </g>
        <rect x={-90} y={-110} width={180} height={220} rx={20} fill={B} />
        <rect x={-60} y={-70} width={120} height={14} rx={7} fill="#9aa3c0" />
        <rect x={-60} y={-40} width={90} height={14} rx={7} fill="#9aa3c0" />
        <circle cy={40} r={42} fill={t > 0.6 ? VERT : ROUGE} />
        {t > 0.6 ? <path d="M-20 40 L-5 56 L22 24" stroke={B} strokeWidth={10} fill="none" strokeLinecap="round" /> : <path d="M-16 24 L16 56 M16 24 L-16 56" stroke={B} strokeWidth={10} strokeLinecap="round" />}
      </g>
    </Svg>
  </Fond>
);

export const Suivante: React.FC<Props> = (p) => {
  const fleche = ((p.t * 1.4) % 1) * 160;
  return (
    <Fond t={p.t} libelle={<>Et on passe à l’<span style={{color: O}}>étape suivante</span></>}>
      <Svg>
        <g transform={`translate(410 360) scale(${pop(p.t, 0, 0.3)})`}>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M${-200 + k * 140 + fleche - 80} -120 L${-80 + k * 140 + fleche - 80} 0 L${-200 + k * 140 + fleche - 80} 120`} stroke={k === 2 ? O : VI} strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.4 + k * 0.3} />
          ))}
        </g>
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ étape 5

export const Fusee: React.FC<Props> = ({t, d}) => {
  const montee = prog(t, 0.35, d, Easing.in(Easing.quad));
  const tremble = montee < 0.05 ? Math.sin(t * 60) * 4 : 0;
  return (
    <Fond t={t} libelle={<>La <span style={{color: O}}>mise en ligne</span></>} teinte="#2a1d6e">
      <Svg h={740}>
        {Array.from({length: 8}, (_, i) => (
          <circle key={i} cx={410 + (hasard(i) - 0.5) * 300 * (1 + montee)} cy={640 + hasard(i + 4) * 40} r={(40 + hasard(i + 2) * 50) * (0.3 + montee * 1.5) * prog(t, 0.3, 0.5)} fill="#c9cfe6" opacity={0.5 * (1 - montee * 0.6)} />
        ))}
        <g transform={`translate(${410 + tremble} ${560 - montee * 900})`}>
          <path d={`M-40 120 Q0 ${200 + Math.sin(t * 40) * 30} 40 120 Z`} fill={O} opacity={prog(t, 0.25, 0.4)} />
          <path d={`M-22 120 Q0 ${170 + Math.sin(t * 50) * 20} 22 120 Z`} fill={B} opacity={prog(t, 0.25, 0.4)} />
          <path d="M-60 40 L-110 120 L-50 110 Z" fill={VF} />
          <path d="M60 40 L110 120 L50 110 Z" fill={VF} />
          <path d="M0 -170 Q80 -80 60 110 H-60 Q-80 -80 0 -170 Z" fill={B} />
          <circle cy={-30} r={34} fill="#5ad1ff" stroke={VF} strokeWidth={10} />
          <path d="M-60 90 H60 V115 H-60 Z" fill={O} />
        </g>
      </Svg>
    </Fond>
  );
};

export const EnLigne: React.FC<Props> = ({t}) => {
  const coup = interpolate(t, [0.1, 0.3], [2.4, 1], {...clamp, easing: Easing.in(Easing.quad)});
  return (
    <Fond t={t} teinte="#123a2a">
      <Svg>
        <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)})`}>
          <rect x={-300} y={-220} width={600} height={420} rx={30} fill="#1b2142" stroke={VI} strokeWidth={8} />
          <rect x={-300} y={-220} width={600} height={60} rx={30} fill={VF} />
          <rect x={-250} y={-120} width={300} height={36} rx={18} fill={O} />
          <rect x={-250} y={-60} width={480} height={20} rx={10} fill="#ffffff44" />
          <rect x={-250} y={-20} width={420} height={20} rx={10} fill="#ffffff44" />
        </g>
        {t > 0.1 ? (
          <g transform={`translate(410 380) rotate(-14) scale(${coup})`} opacity={prog(t, 0.1, 0.2)}>
            <rect x={-330} y={-100} width={660} height={200} rx={24} fill="none" stroke={VERT} strokeWidth={18} />
            <text y={44} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={126} fill={VERT} letterSpacing={6}>EN LIGNE</text>
          </g>
        ) : null}
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ fin

export const Telephone: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Même depuis ton <span style={{color: O}}>téléphone</span></>}>
    <Svg>
      <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 3) * 6})`}>
        <rect x={-150} y={-290} width={300} height={580} rx={50} fill="#2b3160" stroke={B} strokeWidth={10} />
        <rect x={-122} y={-250} width={244} height={500} rx={24} fill={VF} />
        <rect x={-90} y={-200} width={180} height={40} rx={20} fill={O} />
        <rect x={-90} y={-130} width={180} height={140} rx={16} fill={VI} />
        <rect x={-90} y={40} width={140} height={20} rx={10} fill="#ffffff66" />
        <rect x={-90} y={80} width={180} height={20} rx={10} fill="#ffffff66" />
      </g>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k} transform={`translate(${410 + Math.cos(k * 1.3 + t * 2) * 300} ${360 + Math.sin(k * 1.3 + t * 2) * 300}) scale(${pop(t, 0.2 + k * 0.06, 0.3)})`}>
          <path d="M0 -26 Q4 -4 26 0 Q4 4 0 26 Q-4 4 -26 0 Q-4 -4 0 -26Z" fill={k % 2 ? O : VI} />
        </g>
      ))}
    </Svg>
  </Fond>
);

export const Cta: React.FC<Props> = ({t, phase = 1}) => {
  const pulse = 1 + 0.07 * Math.sin(t * 9);
  return (
    <Fond t={t} teinte="#2a1d6e">
      <div style={{position: 'absolute', left: 0, right: 90, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
        {phase === 2 ? <div style={{fontSize: 64, fontWeight: 800, color: B, transform: `scale(${pop(t, 0, 0.3)})`}}>avec <span style={{color: VI}}>Lomé IA School</span></div> : <div style={{fontSize: 64, fontWeight: 800, color: B, transform: `scale(${pop(t, 0, 0.3)})`}}>Réserve ta</div>}
        <div style={{padding: '36px 56px', borderRadius: 999, whiteSpace: 'nowrap', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: N, fontWeight: 800, fontSize: 64, transform: `scale(${pop(t, 0.08, 0.35) * pulse})`, boxShadow: `0 0 ${50 + 30 * Math.sin(t * 9)}px ${O}, 0 20px 60px #000b`}}>
          Consultation gratuite
        </div>
        <div style={{transform: `translateY(${Math.abs(Math.sin(t * 6)) * 40}px)`, opacity: phase === 2 ? 1 : prog(t, 0.6, 0.9)}}>
          <svg width={140} height={160} viewBox="0 0 140 160">
            <path d="M70 10 V120 M20 80 L70 140 L120 80" stroke={B} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {/* doigt qui appuie */}
      <div style={{position: 'absolute', left: 700, top: 720 + Math.abs(Math.sin(t * 4.5)) * 30, fontSize: 110, transform: 'rotate(-20deg)', opacity: prog(t, 0.3, 0.5)}}>
        <svg width={120} height={150} viewBox="0 0 120 150">
          <path d="M40 140 V40 Q40 20 55 20 Q70 20 70 40 V80 L100 86 Q114 90 110 106 L102 140 Z" fill="#7a4c3b" stroke={N} strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </div>
    </Fond>
  );
};

export const ILLUSTRATIONS: Record<string, React.FC<Props>> = {
  recherche: Recherche,
  sansOrdinateur: SansOrdinateur,
  sansCode: SansCode,
  recommande: Recommande,
  commission: Commission,
  methode: Methode,
  etape: Etape,
  brouillon: Brouillon,
  checklist: Checklist,
  desordre: Desordre,
  organise: Organise,
  bullePrompt: BullePrompt,
  robot: Robot,
  dossier: DossierFichiers,
  chrono: Chrono,
  envoi: Envoi,
  chemin: Chemin,
  oeil: Oeil,
  correction: Correction,
  suivante: Suivante,
  fusee: Fusee,
  enLigne: EnLigne,
  telephone: Telephone,
  cta: Cta,
};

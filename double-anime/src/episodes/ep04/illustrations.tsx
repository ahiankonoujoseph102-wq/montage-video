import {Easing, Img, interpolate, staticFile} from 'remotion';
import {Etoile} from '../../commun/Ecran';
import {pop, prog} from '../../commun/temps';
import {COULEURS, POLICE} from '../../theme';
import {Fond, Props} from '../ep02/illustrations';

// Illustrations de l'épisode 4 (même style que les épisodes 2 et 3).
// Zone sûre TikTok : x ≤ 950, y 192–1536 ; texte ≥ 44 px.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
const O = COULEURS.or;
const VI = COULEURS.violet;
const VF = COULEURS.violetFonce;
const B = COULEURS.blanc;

// Balayage de lumière : bande blanche en diagonale qui traverse l'image.
export const Balayage: React.FC<{t: number; a: number; duree?: number}> = ({t, a, duree = 0.9}) => {
  const p = (t - a) / duree;
  if (p < 0 || p > 1) return null;
  const x = interpolate(p, [0, 1], [-70, 170], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: '-30%', left: `${x}%`, width: '38%', height: '160%', transform: 'rotate(22deg)', background: 'linear-gradient(90deg, transparent, #ffffff00 10%, #ffffffaa 50%, #ffffff00 90%, transparent)', mixBlendMode: 'screen'}} />
    </div>
  );
};

// L'affiche finale en plein écran. Partie 1 : sous le titre de l'épisode (2 premières
// secondes), un peu réduite. Partie 2 : en grand, balayage de lumière et étincelles.
export const AfficheFinale: React.FC<Props> = ({t, tg, partie = 1}) => {
  const grand = partie === 2;
  // l'affiche s'arrête au-dessus des sous-titres (y ≤ 1290) et dans la zone sûre (x ≤ 950)
  const l = grand ? 700 : 520;
  const h = Math.round((l * 1622) / 1080);
  const x = 540 - l / 2;
  const y = grand ? 235 : 505;
  const z = grand ? interpolate(t, [0, 1.8], [1.06, 1.0], clamp) : interpolate(t, [0, 1.8], [1.0, 1.04], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, #2a1d6e 0%, ${N} 75%)`, overflow: 'hidden', fontFamily: POLICE}}>
      {/* rayons lents derrière l'affiche */}
      <div style={{position: 'absolute', left: 540 - 900, top: 860 - 900, width: 1800, height: 1800, transform: `rotate(${tg * 14}deg)`, opacity: 0.22}}>
        <svg width={1800} height={1800} viewBox="-900 -900 1800 1800">
          {Array.from({length: 16}, (_, i) => (
            <path key={i} d={`M0 0 L${Math.cos((i / 16) * 2 * Math.PI) * 900} ${Math.sin((i / 16) * 2 * Math.PI) * 900} L${Math.cos(((i + 0.45) / 16) * 2 * Math.PI) * 900} ${Math.sin(((i + 0.45) / 16) * 2 * Math.PI) * 900} Z`} fill={i % 2 ? O : B} />
          ))}
        </svg>
      </div>
      <div style={{position: 'absolute', left: x, top: y, width: l, height: h, borderRadius: 24, overflow: 'hidden', boxShadow: `0 30px 90px #000d, 0 0 0 6px ${O}, 0 0 80px ${O}88`, transform: `scale(${z}) rotate(${grand ? Math.sin(t * 1.5) * 0.6 : -1.5}deg)`}}>
        <Img src={staticFile('episodes/ep04/affiche1.png')} style={{width: l, height: h, display: 'block'}} />
        <Balayage t={t} a={grand ? 0.15 : 0.35} duree={grand ? 1.1 : 1.2} />
      </div>
      {/* étincelles autour */}
      {[[110, 420], [930, 520], [120, 1300], [940, 1200], [540, 200]].map(([ex, ey], i) => (
        <div key={i} style={{position: 'absolute', left: ex - 30, top: ey - 30, transform: `scale(${pop(t, 0.2 + i * 0.12, 0.3) * (0.7 + 0.3 * Math.sin(tg * 6 + i))}) rotate(${tg * 90}deg)`}}>
          <Etoile taille={60} couleur={i % 2 ? O : B} />
        </div>
      ))}
    </div>
  );
};

// Pastille d'outil : icône ou nom en texte (« ChatGPT », « Pinterest », jamais de logo).
const IconeTelephone: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100">
    <rect x={28} y={6} width={44} height={88} rx={10} fill={N} />
    <rect x={33} y={16} width={34} height={62} rx={4} fill={VI} />
    <rect x={44} y={83} width={12} height={4} rx={2} fill={O} />
  </svg>
);

const IconeBulle: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100">
    <path d="M14 20 Q14 10 24 10 H76 Q86 10 86 20 V60 Q86 70 76 70 H44 L26 88 V70 H24 Q14 70 14 60 Z" fill={N} />
    {[30, 50, 70].map((x) => <circle key={x} cx={x} cy={40} r={6} fill={O} />)}
  </svg>
);

const IconeMur: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100">
    {[[10, 8, 36, 46], [54, 8, 36, 28], [10, 60, 36, 32], [54, 42, 36, 50]].map(([x, y, l, h], i) => (
      <rect key={i} x={x} y={y} width={l} height={h} rx={6} fill={i % 2 ? VF : N} />
    ))}
  </svg>
);

const IconeDocument: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100">
    <path d="M22 6 H64 L80 22 V94 H22 Z" fill={N} />
    <path d="M64 6 V22 H80" fill={VF} />
    {[34, 48, 62, 76].map((y, i) => <rect key={y} x={32} y={y} width={i % 2 ? 30 : 38} height={6} rx={3} fill={i === 0 ? O : '#9aa3c0'} />)}
  </svg>
);

// « Il te faut trois choses » : téléphone, ChatGPT, Pinterest, qui claquent à leur mot.
export const TroisChoses: React.FC<Props> = ({t, tg, temps}) => {
  const items: {a: number; nom: string; icone: React.ReactNode}[] = [
    {a: temps.telephone, nom: 'Ton téléphone', icone: <IconeTelephone taille={130} />},
    // icônes génériques (bulle de discussion, mur d'images) : jamais le logo des marques
    {a: temps.chatgpt, nom: 'ChatGPT', icone: <IconeBulle taille={130} />},
    {a: temps.pinterest, nom: 'Pinterest', icone: <IconeMur taille={130} />},
  ];
  return (
    <Fond t={t} teinte="#2a1d6e">
      <div style={{position: 'absolute', left: 60, width: 860, top: 330, textAlign: 'center', fontSize: 64, fontWeight: 800, color: B, transform: `scale(${pop(t, 0, 0.3)})`}}>
        Il te faut <span style={{color: O}}>3 choses</span>
      </div>
      <div style={{position: 'absolute', left: 90, width: 800, top: 470, display: 'flex', flexDirection: 'column', gap: 34}}>
        {items.map((it, i) => {
          const s = interpolate(tg, [it.a - 0.06, it.a + 0.08, it.a + 0.2], [2.2, 0.92, 1], clamp);
          const vu = tg >= it.a - 0.06;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 34, opacity: vu ? 1 : 0, transform: `scale(${s}) rotate(${vu ? Math.sin(tg * 4 + i) * 1.5 : 0}deg)`, transformOrigin: '20% 50%'}}>
              <div style={{width: 170, height: 170, borderRadius: 44, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, display: 'grid', placeItems: 'center', textAlign: 'center', lineHeight: 1, boxShadow: `0 14px 40px #000a, 0 0 40px ${O}66`}}>
                {it.icone}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                <div style={{width: 74, height: 74, borderRadius: 37, background: VI, color: N, fontSize: 50, fontWeight: 800, display: 'grid', placeItems: 'center'}}>{i + 1}</div>
                <div style={{fontSize: 70, fontWeight: 800, color: B, textShadow: '0 6px 20px #000c'}}>{it.nom}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

// « Et bien sûr, les informations de ton affiche » : une fiche dont les lignes se remplissent.
export const InfosAffiche: React.FC<Props> = ({t}) => {
  const lignes = ['Le titre', 'Le lieu', 'Le salaire', 'Le contact'];
  return (
    <Fond t={t} teinte="#3b3110">
      <div style={{position: 'absolute', left: 60, width: 860, top: 320, textAlign: 'center', fontSize: 62, fontWeight: 800, color: B, lineHeight: 1.1}}>
        + les <span style={{color: O}}>informations</span>
        <br />
        de ton affiche
      </div>
      <div style={{position: 'absolute', left: 150, width: 680, top: 520, padding: '36px 40px', borderRadius: 40, background: B, boxShadow: `0 24px 70px #000c, 0 0 0 6px ${O}`, transform: `scale(${pop(t, 0.05, 0.35)}) rotate(${Math.sin(t * 2) * 1.5}deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20}}>
          <IconeDocument taille={110} />
          <div style={{fontSize: 52, fontWeight: 800, color: N}}>Offre d’emploi</div>
        </div>
        {lignes.map((l, i) => {
          const p = prog(t, 0.35 + i * 0.28, 0.6 + i * 0.28, Easing.out(Easing.cubic));
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 20, height: 92, opacity: p, transform: `translateX(${(1 - p) * 120}px)`}}>
              <svg width={56} height={56} viewBox="-25 -25 50 50">
                <circle r={23} fill="#22d36b" />
                <path d="M-11 0 L-3 9 L12 -9" stroke={B} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{fontSize: 52, fontWeight: 800, color: N}}>{l}</div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ prompts en grand

// Textes des prompts, mot pour mot (prompt 1 du bloc-notes ; prompt 2 tel qu'envoyé).
const PROMPTS: Record<number, string[]> = {
  1: [
    'Je veux créer une affiche Pro sur Canva Pro',
    'Donnez moi les infos nécessaires à mettre sur l’affiche de façon prêt à être copié coller',
    'Et envoyez moi uniquement ces infos en bloc',
    'Quel nom je dois taper sur Pinterest pour m’en inspirer',
  ],
  2: [
    'Inspirez-vous de cette affiche pour me créer une affiche Pro',
    'comme un véritable graphiste Pro avec une expérience de plus de 10 Ans.',
    'De base de l’information que je vous avait fourni précédemment.',
  ],
};
// Lignes mises en avant à chaque partie (ce que la voix est en train de dire).
const ACTIVES: Record<number, number[][]> = {1: [[1], [2, 3]], 2: [[0], [1], [2]]};

export const PromptCarte: React.FC<Props> = ({t, n = 1, partie = 1}) => {
  const lignes = PROMPTS[n];
  const actives = ACTIVES[n][partie - 1] ?? [];
  const entree = partie === 1 ? pop(t, 0, 0.35) : 1;
  return (
    <Fond t={t} teinte={n === 1 ? '#1b2c63' : '#3a1d63'}>
      <div style={{position: 'absolute', left: 60, width: 880, top: 300, transform: `scale(${entree}) rotate(${Math.sin(t * 1.8) * 0.8}deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18}}>
          <div style={{padding: '6px 26px', borderRadius: 16, background: O, color: N, fontSize: 52, fontWeight: 800}}>Prompt {n}</div>
          <div style={{fontSize: 44, fontWeight: 700, color: '#c9cfe6'}}>{n === 1 ? 'dans ChatGPT' : 'avec le modèle'}</div>
        </div>
        <div style={{padding: '30px 34px', borderRadius: 36, background: '#0b1033ee', boxShadow: `0 24px 70px #000c, 0 0 0 5px ${VI}`}}>
          {lignes.map((l, i) => {
            const on = actives.includes(i);
            return (
              <div key={i} style={{fontSize: 46, fontWeight: 700, lineHeight: 1.22, marginTop: i ? 16 : 0, color: on ? B : '#9aa3c0', padding: '4px 12px', borderRadius: 14, background: on ? `${VF}aa` : 'transparent', transform: `scale(${on ? 1 + 0.02 * Math.sin(t * 6) : 1})`, transformOrigin: '0 50%'}}>
                {l}
              </div>
            );
          })}
        </div>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ zooms sur l'affiche finale

// Régions de l'affiche 1 (image 1080 × 1622) : titre, informations, photo, contact WhatsApp.
const REGIONS: {x: number; y: number; l: number; h: number; nom: string}[] = [
  {x: 0, y: 20, l: 760, h: 470, nom: 'Le titre'},
  {x: 0, y: 690, l: 600, h: 500, nom: 'Les informations'},
  {x: 470, y: 120, l: 610, h: 1000, nom: 'La photo'},
  {x: 0, y: 1170, l: 800, h: 360, nom: 'Le contact WhatsApp'},
  {x: 0, y: 0, l: 1080, h: 1622, nom: 'Tout y est !'},
];

export const ZoomAffiche: React.FC<Props> = ({t, tg, partie = 1}) => {
  const r = REGIONS[partie - 1];
  const F = {x: 70, y: 230, l: 880, h: 1050};
  const s0 = Math.min(F.l / r.l, F.h / r.h);
  const s = s0 * interpolate(t, [0, 0.9], [0.92, 1.0], {...clamp, easing: Easing.out(Easing.cubic)});
  const cx = r.x + r.l / 2;
  const cy = r.y + r.h / 2;
  const fini = partie === 5;
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, #2a1d6e 0%, ${N} 75%)`, fontFamily: POLICE}}>
      <div style={{position: 'absolute', left: F.x, top: F.y, width: F.l, height: F.h, borderRadius: 30, overflow: 'hidden', boxShadow: `0 0 0 6px ${O}, 0 30px 80px #000c`, background: N}}>
        <div style={{position: 'absolute', left: F.l / 2 - cx * s, top: F.h / 2 - cy * s, width: 1080 * s, height: 1622 * s}}>
          <Img src={staticFile('episodes/ep04/affiche1.png')} style={{width: 1080 * s, height: 1622 * s, display: 'block'}} />
        </div>
        {fini ? <Balayage t={t} a={0.1} duree={0.7} /> : null}
      </div>
      <div style={{position: 'absolute', left: 60, width: 880, top: 1180, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '8px 30px', borderRadius: 999, background: fini ? '#22d36b' : O, color: N, fontSize: 56, fontWeight: 800, transform: `scale(${interpolate(t, [0, 0.1, 0.2], [1.8, 0.94, 1], clamp)})`, boxShadow: '0 10px 30px #000a'}}>
          <svg width={52} height={52} viewBox="-25 -25 50 50"><circle r={23} fill={N} /><path d="M-11 0 L-3 9 L12 -9" stroke={fini ? '#22d36b' : O} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {r.nom}
        </div>
      </div>
      {fini ? [0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', left: 90 + i * 150, top: 260 + ((i * 337) % 700), transform: `scale(${pop(t, 0.1 + i * 0.06, 0.3)}) rotate(${tg * 120}deg)`}}>
          <Etoile taille={54} couleur={i % 2 ? O : B} />
        </div>
      )) : null}
    </div>
  );
};

// ------------------------------------------------------------------ les trois affiches

const AFFICHES = ['affiche1', 'affiche2', 'affiche3'];

export const TroisAffiches: React.FC<Props> = ({t}) => (
  <Fond t={t} teinte="#2a1d6e">
    <div style={{position: 'absolute', left: 60, width: 880, top: 320, textAlign: 'center', fontSize: 62, fontWeight: 800, color: B}}>
      Celle que <span style={{color: O}}>tu préfères</span>
    </div>
    <div style={{position: 'absolute', left: 70, width: 880, top: 460, display: 'flex', gap: 20}}>
      {AFFICHES.map((a, i) => {
        const choisie = i === 0;
        const vu = pop(t, 0.05 + i * 0.18, 0.3);
        const mise = choisie ? prog(t, 1.0, 1.3) : 0;
        return (
          <div key={a} style={{position: 'relative', width: 280, height: 420, borderRadius: 18, overflow: 'hidden', boxShadow: `0 0 0 ${4 + mise * 4}px ${choisie && mise > 0 ? O : '#ffffff55'}, 0 20px 50px #000b`, transform: `scale(${vu * (1 + mise * 0.08)}) rotate(${(i - 1) * 3 * (1 - mise)}deg) translateY(${mise * -20}px)`, opacity: choisie || t < 1.0 ? 1 : 1 - 0.45 * prog(t, 1.0, 1.3)}}>
            <Img src={staticFile(`episodes/ep04/${a}.png`)} style={{width: 280, height: 420}} />
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', left: 60, width: 880, top: 920, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 1.05, 0.3)})`}}>
      <div style={{padding: '8px 30px', borderRadius: 999, background: O, color: N, fontSize: 52, fontWeight: 800, boxShadow: '0 10px 30px #000a'}}>3 versions au choix</div>
    </div>
  </Fond>
);

// ------------------------------------------------------------------ publier

export const Publier: React.FC<Props> = ({t, tg, temps}) => {
  const lieux: [string, number][] = [['TikTok', temps.tiktok], ['WhatsApp', temps.whatsapp], ['Partout !', temps.partout]];
  return (
    <Fond t={t} teinte="#1b2c63">
      <div style={{position: 'absolute', left: 330, top: 300, width: 420, height: 630, borderRadius: 22, overflow: 'hidden', boxShadow: `0 0 0 6px ${O}, 0 30px 80px #000c`, transform: `scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 2) * 1.5}deg)`}}>
        <Img src={staticFile('episodes/ep04/affiche1.png')} style={{width: 420, height: 630}} />
        <Balayage t={t} a={0.2} duree={0.8} />
      </div>
      {lieux.map(([nom, a], i) => {
        const s = interpolate(tg, [a - 0.05, a + 0.08, a + 0.2], [2, 0.92, 1], clamp);
        return tg >= a - 0.05 ? (
          <div key={nom} style={{position: 'absolute', left: [70, 70, 70][i], top: 380 + i * 190, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px', borderRadius: 999, background: [VI, '#22d36b', O][i], color: N, fontSize: 52, fontWeight: 800, transform: `scale(${s})`, boxShadow: '0 10px 30px #000a'}}>
            <svg width={50} height={50} viewBox="0 0 100 100">
              <path d="M50 12 V62 M30 32 L50 12 L70 32" stroke={N} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 60 V86 H82 V60" stroke={N} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {nom}
          </div>
        ) : null;
      })}
    </Fond>
  );
};

// ------------------------------------------------------------------ modèle Pinterest et affiche finale

export const Comparaison: React.FC<Props> = ({t, tg}) => {
  const fl = interpolate(t, [0.5, 0.9], [0, 1], clamp);
  return (
    <Fond t={t} teinte="#3b3110">
      <div style={{position: 'absolute', left: 60, width: 880, top: 300, textAlign: 'center', fontSize: 60, fontWeight: 800, color: B}}>
        Le <span style={{color: '#c9cfe6'}}>modèle</span> → <span style={{color: O}}>ton affiche</span>
      </div>
      {[
        {img: 'modele', l: 395, h: 587, x: 70, nom: 'Modèle Pinterest', a: 0.05},
        {img: 'affiche1', l: 400, h: 600, x: 545, nom: 'Ton affiche', a: 0.45},
      ].map((c) => (
        <div key={c.img} style={{position: 'absolute', left: c.x, top: 420, width: c.l, transform: `scale(${pop(t, c.a, 0.35)}) rotate(${c.img === 'modele' ? -3 : 3}deg)`}}>
          <div style={{position: 'relative', width: c.l, height: c.h, borderRadius: 20, overflow: 'hidden', boxShadow: `0 0 0 6px ${c.img === 'modele' ? '#c9cfe6' : O}, 0 24px 60px #000c`, filter: c.img === 'modele' ? `saturate(${1 - 0.4 * fl})` : undefined}}>
            <Img src={staticFile(`episodes/ep04/${c.img}.png`)} style={{width: c.l, height: c.h}} />
            {c.img !== 'modele' ? <Balayage t={t} a={0.7} duree={0.9} /> : null}
          </div>
          <div style={{marginTop: 20, marginLeft: -40, marginRight: -40, textAlign: 'center', whiteSpace: 'nowrap', fontSize: 46, fontWeight: 800, color: c.img === 'modele' ? '#c9cfe6' : O}}>{c.nom}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 470, top: 640, transform: `scale(${pop(t, 0.35, 0.3)}) translateX(${Math.sin(tg * 6) * 6}px)`}}>
        <svg width={90} height={90} viewBox="0 0 100 100"><circle cx={50} cy={50} r={46} fill={O} /><path d="M28 50 H70 M54 32 L72 50 L54 68" stroke={N} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ « tu peux la vendre »

const Boutique: React.FC = () => (
  <svg width={120} height={120} viewBox="0 0 100 100">
    <path d="M10 36 L18 14 H82 L90 36 Z" fill={N} />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M${10 + k * 20} 36 Q${20 + k * 20} 50 ${30 + k * 20} 36`} fill={k % 2 ? VF : O} />)}
    <rect x={16} y={44} width={68} height={46} fill={N} />
    <rect x={40} y={58} width={20} height={32} fill={O} />
  </svg>
);
const Eglise: React.FC = () => (
  <svg width={120} height={120} viewBox="0 0 100 100">
    <path d="M50 6 V22 M42 14 H58" stroke={N} strokeWidth={6} strokeLinecap="round" />
    <path d="M30 46 L50 24 L70 46 V90 H30 Z" fill={N} />
    <path d="M12 60 L30 46 V90 H12 Z M88 60 L70 46 V90 H88 Z" fill={VF} />
    <path d="M44 90 V70 Q50 62 56 70 V90 Z" fill={O} />
  </svg>
);
const Ecole: React.FC = () => (
  <svg width={120} height={120} viewBox="0 0 100 100">
    <path d="M8 40 L50 16 L92 40 Z" fill={N} />
    <rect x={14} y={40} width={72} height={50} fill={N} />
    {[22, 40, 58, 76].map((x) => <rect key={x} x={x - 4} y={50} width={10} height={14} fill={O} />)}
    <rect x={44} y={70} width={12} height={20} fill={VF} />
  </svg>
);
const Entreprise: React.FC = () => (
  <svg width={120} height={120} viewBox="0 0 100 100">
    <rect x={18} y={10} width={44} height={80} fill={N} />
    <rect x={62} y={36} width={24} height={54} fill={VF} />
    {[0, 1, 2, 3, 4].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={26 + c * 18} y={18 + r * 14} width={10} height={8} fill={O} />))}
  </svg>
);

export const Vendre: React.FC<Props> = ({t, tg, temps, partie = 1}) => {
  const items: [string, React.ReactNode, number][] = [
    ['Commerçants', <Boutique key="b" />, temps.commercants],
    ['Églises', <Eglise key="e" />, temps.eglises],
    ['Écoles', <Ecole key="c" />, temps.ecoles],
    ['Entreprises', <Entreprise key="n" />, temps.entreprises],
  ];
  return (
    <Fond t={t} teinte="#3b3110">
      {/* pièces « FCFA » qui tombent, derrière le titre et les cartes */}
      {partie >= 2
        ? Array.from({length: 12}, (_, k) => {
            const d = t - k * 0.12;
            if (d < 0) return null;
            const y = 220 + ((d * 520 + k * 97) % 1150);
            return (
              <div key={k} style={{position: 'absolute', left: 60 + ((k * 173) % 830), top: y, width: 110, height: 110, borderRadius: 55, background: `radial-gradient(circle at 35% 30%, ${COULEURS.orClair}, ${COULEURS.orFonce})`, border: `5px solid ${COULEURS.orOmbre}`, display: 'grid', placeItems: 'center', color: N, fontSize: 28, fontWeight: 800, transform: `rotate(${d * 200 + k * 30}deg) scaleX(${0.6 + 0.4 * Math.abs(Math.cos(d * 5 + k))})`, opacity: 0.95}}>
                FCFA
              </div>
            );
          })
        : null}
      <div style={{position: 'absolute', left: 60, width: 880, top: 300, textAlign: 'center', fontSize: 62, fontWeight: 800, color: B, lineHeight: 1.1}}>
        {partie === 3 ? (
          <>Ils ont tous <span style={{color: O}}>besoin d’affiches</span></>
        ) : (
          <>Tu peux la <span style={{color: O}}>vendre</span></>
        )}
      </div>
      <div style={{position: 'absolute', left: 90, width: 820, top: 470, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30}}>
        {items.map(([nom, ic, a], i) => {
          const vu = tg >= a - 0.05;
          const s = vu ? interpolate(tg, [a - 0.05, a + 0.08, a + 0.2], [2, 0.92, 1], clamp) : 0;
          return (
            <div key={nom} style={{height: 300, borderRadius: 34, background: '#ffffff12', border: `4px solid ${O}88`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, transform: `scale(${s}) rotate(${Math.sin(tg * 3 + i) * 2}deg)`}}>
              <div style={{width: 170, height: 170, borderRadius: 44, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, display: 'grid', placeItems: 'center'}}>{ic}</div>
              <div style={{fontSize: 50, fontWeight: 800, color: B}}>{nom}</div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ « Écris AFFICHE en commentaire »

export const CommentaireAffiche: React.FC<Props> = ({t}) => {
  const mot = 'AFFICHE';
  const n = Math.floor(interpolate(t, [0.25, 0.85], [0, mot.length], clamp));
  return (
    <Fond t={t} teinte="#4a1640">
      {Array.from({length: 10}, (_, k) => {
        const d = t - 0.4 - k * 0.11;
        if (d < 0) return null;
        return (
          <svg key={k} style={{position: 'absolute', left: 150 + ((k * 197) % 700) + Math.sin(d * 6 + k) * 30, top: 1050 - d * 520, opacity: interpolate(d, [0, 0.15, 1.1, 1.5], [0, 1, 1, 0], clamp), transform: `scale(${0.6 + (k % 3) * 0.25})`}} width={90} height={84} viewBox="0 0 100 92">
            <path d="M50 88 L10 48 Q-6 28 12 12 Q32 -4 50 20 Q68 -4 88 12 Q106 28 90 48 Z" fill={k % 2 ? '#ff4d6d' : '#ff8fa3'} />
          </svg>
        );
      })}
      <div style={{position: 'absolute', left: 60, width: 880, top: 320, textAlign: 'center', fontSize: 58, fontWeight: 800, color: B}}>
        Écris en <span style={{color: O}}>commentaire</span> :
      </div>
      <div style={{position: 'absolute', left: 90, width: 820, top: 470, transform: `scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 2.5) * 1.5}deg)`}}>
        <div style={{position: 'relative', padding: '40px 44px', borderRadius: 50, background: B, boxShadow: `0 20px 60px #000b, 0 0 0 6px ${VI}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
            <div style={{width: 100, height: 100, borderRadius: 50, background: VI, flex: '0 0 auto'}} />
            <div style={{fontSize: 110, fontWeight: 800, color: N, letterSpacing: 4}}>
              {mot.slice(0, n)}
              <span style={{color: VF, opacity: Math.floor(t * 4) % 2 ? 1 : 0.2}}>|</span>
            </div>
          </div>
          <div style={{position: 'absolute', left: 90, bottom: -50, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: `56px solid ${B}`}} />
          <div style={{position: 'absolute', right: -24, top: -64, transform: `scale(${pop(t, 0.9, 0.35) * (1 + 0.14 * Math.abs(Math.sin(t * 6)))})`}}>
            <svg width={150} height={140} viewBox="0 0 100 92">
              <path d="M50 88 L10 48 Q-6 28 12 12 Q32 -4 50 20 Q68 -4 88 12 Q106 28 90 48 Z" fill="#ff4d6d" stroke={B} strokeWidth={6} />
            </svg>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, width: 880, top: 800, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.95, 0.3) * (1 + 0.05 * Math.sin(t * 9))})`}}>
        <div style={{padding: '14px 36px', borderRadius: 999, background: O, color: N, fontSize: 54, fontWeight: 800, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 9)}px ${O}`}}>Je t’envoie les 2 prompts 🎁</div>
      </div>
    </Fond>
  );
};

export const ILLUSTRATIONS_EP04: Record<string, React.FC<Props>> = {
  affiche: AfficheFinale,
  troisChoses: TroisChoses,
  infosAffiche: InfosAffiche,
  prompt: PromptCarte,
  zoomAffiche: ZoomAffiche,
  troisAffiches: TroisAffiches,
  publier: Publier,
  comparaison: Comparaison,
  vendre: Vendre,
  commentaireAffiche: CommentaireAffiche,
};

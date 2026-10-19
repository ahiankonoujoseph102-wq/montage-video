import {Easing, interpolate} from 'remotion';
import {Etoile} from '../../commun/Ecran';
import {pop, prog} from '../../commun/temps';
import {COULEURS} from '../../theme';
import {Fond, Props, Svg} from '../ep02/illustrations';
import {TamponX} from './Astuce';
import {ROUGE, secousse} from './Fonds';

// Illustrations propres à l'épisode 3 (même style que l'épisode 2).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
const O = COULEURS.or;
const VI = COULEURS.violet;
const VF = COULEURS.violetFonce;
const B = COULEURS.blanc;

// Champ de saisie : « améliore ça » s'écrit, un gros tampon X rouge l'écrase.
export const Accroche: React.FC<Props> = ({t, tg, temps}) => {
  const texte = 'améliore ça';
  const a = temps.ameliore;
  const n = Math.floor(interpolate(tg, [a, a + 0.45], [0, texte.length], clamp));
  const croix = temps.croixAccroche;
  const cam = secousse(tg, [croix], 30);
  const flash = interpolate(tg - croix, [0, 0.05, 0.3], [0, 0.5, 0], clamp);
  return (
    <Fond t={t} teinte="#3a1730">
      <div style={{position: 'absolute', inset: 0, transform: cam.transform}}>
        <div style={{position: 'absolute', left: 90, width: 820, top: 600, transform: `scale(${pop(t, 0, 0.3)})`}}>
          <div style={{fontSize: 44, fontWeight: 700, color: '#c9cfe6', marginBottom: 14, marginLeft: 20}}>Message à ChatGPT</div>
          <div style={{position: 'relative', height: 150, borderRadius: 75, background: B, display: 'flex', alignItems: 'center', padding: '0 50px', boxShadow: `0 16px 50px #000a, 0 0 0 6px ${VI}`}}>
            <div style={{fontSize: 80, fontWeight: 800, color: N}}>
              {texte.slice(0, n)}
              <span style={{color: VF, opacity: Math.floor(t * 4) % 2 ? 1 : 0.2}}>|</span>
            </div>
            <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
              <TamponX t={tg} a={croix} taille={420} />
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: ROUGE, opacity: flash, mixBlendMode: 'screen'}} />
    </Fond>
  );
};

// « Un mauvais prompt, c'est un mauvais résultat » : la feuille grise se froisse
// en boule et part à la corbeille.
export const BoulePapier: React.FC<Props> = ({t, tg, temps}) => {
  const froisse = temps.froisse;
  const f = prog(tg, froisse, froisse + 0.25, Easing.in(Easing.quad));
  const lance = prog(tg, froisse + 0.28, froisse + 0.5, Easing.linear);
  const x = 540 + lance * 315;
  const y = 600 - Math.sin(lance * Math.PI) * 220 + lance * 210;
  const tombe = tg > froisse + 0.5;
  return (
    <Fond t={t} teinte="#2b2b3d">
      {/* légende centrée sur l'image, dans la zone sûre (x 140–940) */}
      <div style={{position: 'absolute', left: 140, width: 800, top: 930, textAlign: 'center', color: B, fontWeight: 800, fontSize: 62, lineHeight: 1.1, transform: `scale(${pop(t, 0.12, 0.35)})`, textShadow: '0 6px 20px #000c'}}>
        Mauvais prompt = <span style={{color: '#ff6b6b'}}>mauvais résultat</span>
      </div>
      {/* corbeille */}
      <svg style={{position: 'absolute', left: 775, top: 735, transform: `scale(${pop(t, 0.3, 0.3) * 0.85}) rotate(${tombe ? Math.sin((tg - froisse) * 30) * 4 * Math.exp(-(tg - froisse - 0.5) * 6) : 0}deg)`}} width={170} height={190} viewBox="0 0 170 190">
        <path d="M15 40 H155 L140 185 H30 Z" fill="#5b6280" stroke={N} strokeWidth={6} />
        <rect x={5} y={22} width={160} height={24} rx={10} fill="#8a90a8" stroke={N} strokeWidth={6} />
        {[50, 85, 120].map((x0) => <path key={x0} d={`M${x0} 60 L${x0 - 4 + (x0 - 85) * 0.1} 170`} stroke={N} strokeWidth={6} />)}
      </svg>
      {f < 1 ? (
        <div style={{position: 'absolute', left: 110, width: 640, top: 330, transform: `scale(${pop(t, 0, 0.3) * (1 - f * 0.82)}) rotate(${f * 160}deg)`, transformOrigin: '390px 360px', borderRadius: 30 + f * 300, background: '#e9ebf3', padding: '34px 40px', boxShadow: '0 20px 50px #000b', clipPath: f > 0 ? `polygon(${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const an = (k / 8) * Math.PI * 2;
          const r = 72 - f * 30 + Math.sin(k * 3.1) * f * 12;
          return `${50 + Math.cos(an) * r}% ${50 + Math.sin(an) * r}%`;
        }).join(', ')})` : undefined}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <svg width={90} height={90} viewBox="0 0 40 40">
              <circle cx={20} cy={20} r={18} fill="#6b7088" />
              <circle cx={14} cy={16} r={2.6} fill="#20243d" />
              <circle cx={26} cy={16} r={2.6} fill="#20243d" />
              <path d="M12 29 Q20 22 28 29" stroke="#20243d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            </svg>
            <div style={{fontSize: 56, fontWeight: 800, color: '#d23b4b'}}>Mauvais résultat</div>
          </div>
          <div style={{filter: 'blur(3px)', marginTop: 24}}>
            {[560, 470, 520, 380].map((l, k) => <div key={k} style={{height: 24, width: l, borderRadius: 12, background: '#a3a8bd', marginTop: k ? 16 : 0}} />)}
          </div>
        </div>
      ) : null}
      {f >= 1 && !tombe ? (
        <svg style={{position: 'absolute', left: x - 70, top: y - 70, transform: `rotate(${lance * 540}deg)`}} width={140} height={140} viewBox="-50 -50 100 100">
          <path d="M-40 -10 L-28 -36 L0 -44 L30 -34 L44 -6 L36 26 L10 44 L-22 40 L-42 18 Z" fill="#e9ebf3" stroke="#a3a8bd" strokeWidth={4} />
          <path d="M-28 -36 L-6 -8 L30 -34 M-6 -8 L-22 40 M-6 -8 L36 26 M-42 18 L-6 -8" stroke="#a3a8bd" strokeWidth={3} fill="none" />
        </svg>
      ) : null}
    </Fond>
  );
};

// Accroche : « Sauvegarde cette vidéo 📌 », pastille qui se balance.
export const Sauvegarde: React.FC<{t: number; a: number; fin: number}> = ({t, a, fin}) => {
  if (t < a || t > fin) return null;
  return (
    <div style={{position: 'absolute', left: 290, width: 650, top: 1120, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, a, 0.35) * (1 - prog(t, fin - 0.2, fin))}) rotate(${-4 + Math.sin(t * 4) * 3}deg)`}}>
      <div style={{padding: '8px 30px', borderRadius: 999, background: O, color: N, fontFamily: 'Poppins, sans-serif', fontSize: 48, fontWeight: 800, boxShadow: '0 10px 30px #000a', whiteSpace: 'nowrap'}}>
        Sauvegarde cette vidéo 📌
      </div>
    </div>
  );
};

// Un mauvais prompt donne un mauvais résultat : réponse grise et floue, visage triste.
export const MauvaisResultat: React.FC<Props> = ({t}) => (
  <Fond t={t} teinte="#2b2b3d">
      {/* légende centrée sur l'image, dans la zone sûre (x 140–940) */}
      <div style={{position: 'absolute', left: 140, width: 800, top: 930, textAlign: 'center', color: B, fontWeight: 800, fontSize: 62, lineHeight: 1.1, transform: `scale(${pop(t, 0.12, 0.35)})`, textShadow: '0 6px 20px #000c'}}>
        Mauvais prompt = <span style={{color: '#ff6b6b'}}>mauvais résultat</span>
      </div>
    <div style={{position: 'absolute', left: 120, right: 160, top: 360, display: 'flex', flexDirection: 'column', gap: 26}}>
      <div style={{alignSelf: 'flex-end', padding: '20px 34px', borderRadius: '34px 34px 8px 34px', background: VF, color: B, fontSize: 52, fontWeight: 800, transform: `scale(${pop(t, 0, 0.3)})`}}>améliore ça</div>
      <div style={{display: 'flex', gap: 20, alignItems: 'center', transform: `scale(${pop(t, 0.35, 0.3)})`, transformOrigin: '0 50%'}}>
        <svg width={120} height={120} viewBox="0 0 40 40" style={{transform: `rotate(${Math.sin(t * 4) * 6}deg)`}}>
          <circle cx={20} cy={20} r={18} fill="#6b7088" />
          <circle cx={14} cy={16} r={2.6} fill="#20243d" />
          <circle cx={26} cy={16} r={2.6} fill="#20243d" />
          <path d="M12 29 Q20 22 28 29" stroke="#20243d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </svg>
        <div style={{flex: 1, padding: '22px 28px', borderRadius: '34px 34px 34px 8px', background: '#ffffff14', filter: `blur(${2 + Math.sin(t * 3)}px)`}}>
          {[300, 420, 360].map((l, i) => <div key={i} style={{height: 26, width: l, borderRadius: 13, background: '#8a90a8', marginTop: i ? 16 : 0}} />)}
        </div>
      </div>
    </div>
  </Fond>
);

// « Regarde la magie opérer » : baguette et étincelles.
export const Magie: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Regarde la <span style={{color: O}}>magie</span> opérer</>} teinte="#2a1d6e">
    <Svg>
      <g transform={`translate(330 450) rotate(${-35 + Math.sin(t * 6) * 12}) scale(${pop(t, 0, 0.3)})`}>
        <rect x={-18} y={-240} width={36} height={300} rx={14} fill={N} stroke={B} strokeWidth={6} />
        <rect x={-18} y={-240} width={36} height={60} rx={14} fill={B} />
      </g>
      {Array.from({length: 12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + t * 1.5;
        const r = 120 + ((t * 160 + i * 30) % 160);
        return (
          <g key={i} transform={`translate(${470 + Math.cos(a) * r} ${230 + Math.sin(a) * r * 0.7}) scale(${pop(t, 0.1 + i * 0.03, 0.3) * (0.6 + 0.4 * Math.sin(t * 8 + i))})`}>
            <path d="M0 -30 Q5 -5 30 0 Q5 5 0 30 Q-5 5 -30 0 Q-5 -5 0 -30Z" fill={i % 3 ? O : VI} />
          </g>
        );
      })}
    </Svg>
  </Fond>
);

// Contexte, résultat voulu, style : trois icônes qui surgissent avec la voix.
export const Trio: React.FC<Props> = ({t, tg, temps, partie = 1}) => {
  const items = [
    ['contexte', 'Le contexte', 'M20 30 H80 V70 H20 Z M30 42 H70 M30 52 H62 M30 62 H54'],
    ['resultat', 'Le résultat voulu', 'M50 14 A36 36 0 1 0 50.1 14 M50 30 A20 20 0 1 0 50.1 30 M50 44 A6 6 0 1 0 50.1 44'],
    ['style', 'Le style', 'M30 80 Q20 50 50 20 Q80 50 70 80 Z M50 20 V60'],
  ] as const;
  const z = partie === 2 ? interpolate(t, [0, 0.4], [1.0, 1.08], clamp) : 1;
  return (
    <Fond t={t}>
      <div style={{position: 'absolute', left: 90, right: 150, top: 330, display: 'flex', flexDirection: 'column', gap: 34, transform: `scale(${z})`}}>
        <div style={{textAlign: 'center', fontSize: 56, fontWeight: 800, color: B}}>Chaque bonne demande donne :</div>
        {items.map(([cle, nom, d], i) => {
          const a = temps[cle] - 0.05;
          const v = tg >= a;
          return (
            <div key={cle} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: v ? 1 : 0.15, transform: `scale(${v ? interpolate(tg, [a, a + 0.12, a + 0.22], [2, 0.94, 1], clamp) : 0.9})`, transformOrigin: '0 50%'}}>
              <div style={{width: 150, height: 150, borderRadius: 40, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, display: 'grid', placeItems: 'center', transform: `rotate(${v ? Math.sin(t * 5 + i) * 5 : 0}deg)`}}>
                <svg width={110} height={110} viewBox="0 0 100 100">
                  <path d={d} stroke={N} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{fontSize: 64, fontWeight: 800, color: v ? O : B}}>{nom}</div>
            </div>
          );
        })}
      </div>
    </Fond>
  );
};

// « Écris-le en commentaire » : grosse bulle qui s'écrit, cœurs qui montent,
// bouton « Ton meilleur prompt ? » qui pulse, « Partage à un ami ».
export const Commentaire: React.FC<Props> = ({t}) => {
  const phrase = 'Mon meilleur prompt…';
  const n = Math.floor(interpolate(t, [0.15, 0.8], [0, phrase.length], clamp));
  return (
    <Fond t={t} teinte="#4a1640">
      {/* cœurs qui montent */}
      {Array.from({length: 9}, (_, k) => {
        const d = t - 0.3 - k * 0.12;
        if (d < 0) return null;
        const y = 1000 - d * 520;
        return (
          <svg key={k} style={{position: 'absolute', left: 180 + ((k * 197) % 640) + Math.sin(d * 6 + k) * 30, top: y, opacity: interpolate(d, [0, 0.15, 1.1, 1.5], [0, 1, 1, 0], clamp), transform: `scale(${0.6 + (k % 3) * 0.25})`}} width={90} height={84} viewBox="0 0 100 92">
            <path d="M50 88 L10 48 Q-6 28 12 12 Q32 -4 50 20 Q68 -4 88 12 Q106 28 90 48 Z" fill={k % 2 ? '#ff4d6d' : '#ff8fa3'} />
          </svg>
        );
      })}
      <div style={{position: 'absolute', left: 70, width: 860, top: 380, transform: `scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 2.5) * 2}deg)`}}>
        <div style={{position: 'relative', padding: '40px 44px', borderRadius: 50, background: B, boxShadow: `0 20px 60px #000b, 0 0 0 6px ${VI}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: 96, height: 96, borderRadius: 48, background: VI, flex: '0 0 auto'}} />
            <div style={{fontSize: 60, fontWeight: 800, color: N}}>
              {phrase.slice(0, n)}
              <span style={{color: VF, opacity: Math.floor(t * 4) % 2 ? 1 : 0.2}}>|</span>
            </div>
          </div>
          <div style={{position: 'absolute', left: 90, bottom: -50, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: `56px solid ${B}`}} />
          <div style={{position: 'absolute', right: -24, top: -64, transform: `scale(${pop(t, 0.45, 0.35) * (1 + 0.14 * Math.abs(Math.sin(t * 6)))})`}}>
            <svg width={150} height={140} viewBox="0 0 100 92">
              <path d="M50 88 L10 48 Q-6 28 12 12 Q32 -4 50 20 Q68 -4 88 12 Q106 28 90 48 Z" fill="#ff4d6d" stroke={B} strokeWidth={6} />
            </svg>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 50, width: 900, top: 720, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.35, 0.3) * (1 + 0.06 * Math.sin(t * 9))})`}}>
        <div style={{padding: '18px 40px', borderRadius: 999, background: O, color: N, fontSize: 60, fontWeight: 800, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 9)}px ${O}`, whiteSpace: 'nowrap'}}>💬 Ton meilleur prompt ?</div>
      </div>
      <div style={{position: 'absolute', left: 50, width: 900, top: 880, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.7, 0.3)})`}}>
        <div style={{padding: '8px 28px', borderRadius: 999, background: '#ffffff22', border: `3px solid ${B}`, color: B, fontSize: 46, fontWeight: 800, whiteSpace: 'nowrap'}}>Partage à un ami 🔁</div>
      </div>
    </Fond>
  );
};

// « Le meilleur prompt » : trophée et étoiles.
export const Trophee: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Ton <span style={{color: O}}>meilleur prompt</span> ?</>} teinte="#3b3110">
    <Svg>
      <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 3) * 4})`}>
        <path d="M-150 -220 H150 V-120 Q150 40 0 70 Q-150 40 -150 -120 Z" fill={O} />
        <path d="M-150 -180 Q-250 -180 -230 -90 Q-210 -20 -130 -20" stroke={O} strokeWidth={26} fill="none" />
        <path d="M150 -180 Q250 -180 230 -90 Q210 -20 130 -20" stroke={O} strokeWidth={26} fill="none" />
        <rect x={-40} y={60} width={80} height={90} fill="#b5891a" />
        <rect x={-130} y={150} width={260} height={60} rx={14} fill="#b5891a" />
        <text y={-60} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill={N}>?</text>
      </g>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k} transform={`translate(${410 + Math.cos(k * 1.3 + t * 2) * 330} ${330 + Math.sin(k * 1.3 + t * 2) * 260}) scale(${pop(t, 0.2 + k * 0.06, 0.3)})`}>
          <Etoile taille={60} couleur={k % 2 ? O : VI} />
        </g>
      ))}
    </Svg>
  </Fond>
);

export const ILLUSTRATIONS_EP03: Record<string, React.FC<Props>> = {
  accroche: Accroche,
  boulePapier: BoulePapier,
  mauvais: MauvaisResultat,
  magie: Magie,
  trio: Trio,
  commentaire: Commentaire,
  trophee: Trophee,
};
export {prog};

import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Etoile} from '../commun/Ecran';
import {hasard} from '../commun/hasard';
import {pop, prog} from '../commun/temps';
import {COULEURS, POLICE} from '../theme';

// Éléments de la publicité. Zone sûre TikTok et Facebook : rien d'important
// au-dessus de y 200, sous y 1536, ni à droite de x 950.

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const CONTOUR = (px: number, c: string = COULEURS.nuit) => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'}) as const;
export const VERT = '#1fbf5c';
export const ROUGE = '#ff3b4a';

// Claque : énorme puis se pose (2,4 → 0,92 → 1), avec une légère rotation.
export const claque = (t: number, depart = 2.4) => interpolate(t, [0, 0.11, 0.22], [depart, 0.92, 1], {...clamp, easing: Easing.out(Easing.cubic)});

const src = (nom: string) => staticFile(`pub2/plans/${nom}.mp4`);

// Vidéo d'un plan, calée sur le début du plan (`debut` en secondes de vidéo).
export const Clip: React.FC<{nom: string; debut: number; duree: number; style?: React.CSSProperties; vitesse?: number}> = ({nom, debut, duree, style, vitesse = 1}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(debut * fps)} durationInFrames={Math.max(1, Math.round(duree * fps))} layout="none">
      <OffthreadVideo src={src(nom)} muted playbackRate={vitesse} style={{display: 'block', ...style}} />
    </Sequence>
  );
};

// ------------------------------------------------------------------ fonds

// Fond animé : dégradé qui respire, faisceaux lents, particules dorées.
export const FondAnime: React.FC<{t: number; teinte?: string; accent?: string}> = ({t, teinte = '#24206e', accent = COULEURS.or}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + Math.sin(t * 0.9) * 14}% ${38 + Math.cos(t * 0.7) * 8}%, ${teinte} 0%, ${COULEURS.nuit} 68%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -460, top: -200, width: 2000, height: 2000, transform: `rotate(${t * 12}deg)`, opacity: 0.12, background: `conic-gradient(${COULEURS.violet}, transparent 12%, ${accent} 25%, transparent 37%, ${COULEURS.violet} 50%, transparent 62%, ${accent} 75%, transparent 87%, ${COULEURS.violet})`}} />
    {Array.from({length: 26}).map((_, i) => {
      const x = hasard(i * 3 + 1) * 1080;
      const v = 40 + hasard(i * 3 + 2) * 90;
      const y = 1920 - ((hasard(i * 3 + 3) * 1920 + t * v) % 2100);
      const s = 3 + hasard(i * 7) * 7;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: i % 3 ? accent : COULEURS.violet, opacity: 0.5, boxShadow: `0 0 ${s * 3}px ${accent}`}} />;
    })}
  </AbsoluteFill>
);

// Fond flou tiré du clip lui-même (jamais étiré net) + voile sombre.
export const FondFlou: React.FC<{nom: string; debut: number; duree: number; t: number}> = ({nom, debut, duree, t}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: COULEURS.nuit}}>
    <Clip nom={nom} debut={debut} duree={duree} style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(38px) brightness(0.5) saturate(1.3)', transform: `scale(${1.25 + 0.04 * Math.sin(t)})`}} />
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, transparent 20%, ${COULEURS.nuit}cc 85%)`}} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ téléphone

export type Pose3D = {rx: number; ry: number; rz: number};
export const POSES: Pose3D[] = [
  {rx: 4, ry: -16, rz: -4},
  {rx: 3, ry: 15, rz: 4},
  {rx: 6, ry: -10, rz: 3},
  {rx: 2, ry: 12, rz: -3},
];

// Téléphone incliné, ombre portée, reflet qui balaie l'écran. `entree` : temps local.
export const Telephone: React.FC<{
  x?: number; y?: number; l?: number; t: number; pose?: Pose3D; entree?: 'gauche' | 'droite' | 'bas' | 'zoom'; children: React.ReactNode; lueur?: string;
}> = ({x = 540, y = 820, l = 600, t, pose = POSES[0], entree = 'zoom', children, lueur = COULEURS.violet}) => {
  const h = (l - 28) * (16 / 9) + 28;
  const e = interpolate(t, [0, 0.3], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const dx = entree === 'gauche' ? -900 * e : entree === 'droite' ? 900 * e : 0;
  const dy = entree === 'bas' ? 1200 * e : 0;
  const s = entree === 'zoom' ? 1 + 0.5 * e : 1;
  const flotte = Math.sin(t * 1.7) * 1.5;
  const reflet = ((t * 0.9) % 2.2) / 2.2;
  return (
    <div style={{position: 'absolute', left: x - l / 2, top: y - h / 2, width: l, height: h, transform: `translate(${dx}px, ${dy + flotte * 4}px) perspective(1700px) rotateX(${pose.rx}deg) rotateY(${pose.ry + flotte}deg) rotateZ(${pose.rz + e * 8}deg) scale(${s})`}}>
      {/* ombre au sol */}
      <div style={{position: 'absolute', left: 30, top: 50, width: l - 20, height: h - 20, borderRadius: 70, background: '#000', filter: 'blur(40px)', opacity: 0.75, transform: 'translate(34px, 40px)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 70, background: 'linear-gradient(150deg, #3a3f63, #0b0d1e 55%, #2b2f50)', boxShadow: `0 0 0 3px #575c86, 0 0 70px ${lueur}66`}}>
        <div style={{position: 'absolute', left: 14, top: 14, right: 14, bottom: 14, borderRadius: 58, overflow: 'hidden', background: '#000'}}>
          {children}
          {/* reflet en biais qui balaie l'écran */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${reflet * 160 - 40}%, #ffffff30 ${reflet * 160 - 25}%, transparent ${reflet * 160 - 10}%)`, pointerEvents: 'none'}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #ffffff1c 0%, transparent 30%)', pointerEvents: 'none'}} />
        </div>
        {/* îlot de la caméra */}
        <div style={{position: 'absolute', left: l / 2 - 56, top: 30, width: 112, height: 30, borderRadius: 15, background: '#04050c'}} />
      </div>
    </div>
  );
};

// Contenu vidéo d'un écran de téléphone (clip 9:16 ou capture TikTok 9:20), avec zoom doux.
export const EcranClip: React.FC<{nom: string; debut: number; duree: number; l: number; t: number; zoom?: [number, number]; foyer?: [number, number]; ratio?: number; vitesse?: number; children?: React.ReactNode}> = ({
  nom, debut, duree, l, t, zoom = [1.0, 1.08], foyer = [0.5, 0.5], ratio = 16 / 9, vitesse = 1, children,
}) => {
  const lw = l - 28;
  const z = interpolate(t, [0, duree], zoom, {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: lw, height: lw * ratio, transformOrigin: `${foyer[0] * 100}% ${foyer[1] * 100}%`, transform: `scale(${z})`}}>
      <Clip nom={nom} debut={debut} duree={duree} vitesse={vitesse} style={{width: lw, height: lw * ratio}} />
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ textes

export const Etiquette: React.FC<{texte: string; t: number; x?: number; y?: number; couleur?: string; fond?: string; taille?: number; angle?: number}> = ({
  texte, t, x = 540, y = 330, couleur = COULEURS.nuit, fond = COULEURS.or, taille = 96, angle = -4,
}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${claque(t)}) rotate(${angle}deg)`, opacity: prog(t, -0.01, 0.04), fontFamily: POLICE}}>
    <div style={{padding: '10px 42px', borderRadius: 26, background: fond, color: couleur, fontSize: taille, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: 1, boxShadow: `0 18px 46px #000c, 0 0 0 6px ${COULEURS.nuit}`}}>{texte}</div>
  </div>
);

export const GrosMot: React.FC<{texte: string; t: number; y?: number; taille?: number; couleur?: string; angle?: number}> = ({texte, t, y = 360, taille = 140, couleur = COULEURS.blanc, angle = -3}) => (
  <div style={{position: 'absolute', left: 60, width: 880, top: y, textAlign: 'center', fontFamily: POLICE, fontSize: taille, fontWeight: 800, lineHeight: 1.02, color: couleur, ...CONTOUR(16), textShadow: `0 0 40px ${couleur === COULEURS.or ? COULEURS.or : '#000'}88`, transform: `scale(${claque(t, 2)}) rotate(${angle}deg)`, opacity: prog(t, -0.01, 0.04)}}>
    {texte}
  </div>
);

// Tampon géant (bord épais, encre légèrement irrégulière).
export const Tampon: React.FC<{lignes: string[]; t: number; couleur?: string; y?: number; taille?: number}> = ({lignes, t, couleur = ROUGE, y = 760, taille = 128}) => (
  <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%, -50%) scale(${interpolate(t, [0, 0.1, 0.2], [3.2, 0.9, 1], {...clamp, easing: Easing.out(Easing.cubic)})}) rotate(-9deg)`, opacity: prog(t, 0, 0.04), fontFamily: POLICE}}>
    <div style={{padding: '18px 44px', border: `16px solid ${couleur}`, borderRadius: 34, color: couleur, background: '#0a0a1acc', textAlign: 'center', fontWeight: 800, fontSize: taille, lineHeight: 1.0, letterSpacing: 2, boxShadow: `0 30px 80px #000d, 0 0 60px ${couleur}66`, whiteSpace: 'nowrap', maskImage: 'radial-gradient(circle at 30% 40%, #000 60%, #000c 75%, #000 90%)'}}>
      {lignes.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  </div>
);

// ------------------------------------------------------------------ icônes barrées

const IcCamera: React.FC = () => (
  <svg width={250} height={250} viewBox="0 0 100 100">
    <rect x={10} y={32} width={56} height={40} rx={8} fill={COULEURS.blanc} />
    <path d="M66,44 L88,32 L88,72 L66,60 Z" fill={COULEURS.blanc} />
    <circle cx={28} cy={24} r={9} fill={COULEURS.blanc} />
    <circle cx={50} cy={24} r={9} fill={COULEURS.blanc} />
    <circle cx={30} cy={52} r={7} fill={COULEURS.nuit} />
  </svg>
);
const IcActeur: React.FC = () => (
  <svg width={250} height={250} viewBox="0 0 100 100">
    {/* clap de cinéma + silhouette */}
    <circle cx={50} cy={30} r={15} fill={COULEURS.blanc} />
    <path d="M22,88 Q22,56 50,56 Q78,56 78,88 Z" fill={COULEURS.blanc} />
    <path d="M58,8 L92,14 L90,24 L56,18 Z" fill={COULEURS.or} />
    <path d="M62,9 L66,19 M72,11 L76,21 M82,13 L86,23" stroke={COULEURS.nuit} strokeWidth={3} />
  </svg>
);

export const IconeBarree: React.FC<{type: 'camera' | 'acteur'; texte: string; t: number}> = ({type, texte, t}) => {
  const barre = interpolate(t, [0.12, 0.26], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 540, top: 470, transform: `translate(-50%, -50%) scale(${claque(t)}) rotate(${type === 'camera' ? -6 : 6}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: POLICE}}>
      <div style={{position: 'relative', width: 340, height: 340, borderRadius: '50%', background: '#0b0d22e6', border: `16px solid ${ROUGE}`, display: 'grid', placeItems: 'center', boxShadow: `0 24px 70px #000d, 0 0 50px ${ROUGE}88`}}>
        {type === 'camera' ? <IcCamera /> : <IcActeur />}
        <div style={{position: 'absolute', left: 24, top: 154, width: 260 * barre, height: 26, borderRadius: 13, background: ROUGE, transform: 'rotate(-45deg)', transformOrigin: '150px 13px', boxShadow: '0 0 0 6px #0b0d22'}} />
      </div>
      <div style={{marginTop: 18, padding: '6px 34px', borderRadius: 20, background: ROUGE, color: COULEURS.blanc, fontWeight: 800, fontSize: 84, ...CONTOUR(0), whiteSpace: 'nowrap', boxShadow: '0 12px 30px #000b'}}>{texte}</div>
    </div>
  );
};

// ------------------------------------------------------------------ grands nombres (captures TikTok)

export const GrandNombre: React.FC<{valeur: string; legende: string; t: number; x: number; y: number; taille?: number; angle?: number; couleur?: string}> = ({
  valeur, legende, t, x, y, taille = 170, angle = -5, couleur = COULEURS.or,
}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${claque(t, 2.6)}) rotate(${angle}deg)`, opacity: prog(t, -0.01, 0.04), fontFamily: POLICE, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <div style={{fontSize: taille, fontWeight: 800, lineHeight: 0.95, color: couleur, ...CONTOUR(18), textShadow: `0 0 50px ${couleur}aa, 0 14px 30px #000`, whiteSpace: 'nowrap'}}>{valeur}</div>
    <div style={{marginTop: 4, padding: '4px 26px', borderRadius: 16, background: COULEURS.blanc, color: COULEURS.nuit, fontSize: taille * 0.36, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 10px 26px #000b'}}>{legende}</div>
  </div>
);

// ------------------------------------------------------------------ cartes de la formation

export const Carte: React.FC<{texte: string; icone: string; t: number; y: number; angle: number; reduite?: number}> = ({texte, icone, t, y, angle, reduite = 0}) => (
  <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%, -50%) scale(${claque(t) * (1 - 0.18 * reduite)}) rotate(${angle}deg)`, opacity: prog(t, -0.01, 0.04), fontFamily: POLICE}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 46px 22px 26px', borderRadius: 34, background: `linear-gradient(135deg, ${COULEURS.blanc}, #e8e9ff)`, boxShadow: `0 24px 60px #000c, 0 0 0 7px ${COULEURS.or}`, whiteSpace: 'nowrap'}}>
      <div style={{width: 112, height: 112, borderRadius: 30, background: VERT, display: 'grid', placeItems: 'center', fontSize: 70, color: COULEURS.blanc, fontWeight: 800}}>{icone}</div>
      <div style={{fontSize: 82, fontWeight: 800, color: COULEURS.nuit}}>{texte}</div>
    </div>
  </div>
);

// ------------------------------------------------------------------ WhatsApp

// Bulle de discussion simple (jamais le logo officiel).
export const Bulle: React.FC<{taille: number; couleur?: string}> = ({taille, couleur = COULEURS.blanc}) => (
  <svg width={taille} height={taille} viewBox="0 0 24 24">
    <path d="M12 2.5c-5.2 0-9.5 3.9-9.5 8.8 0 2.7 1.3 5.1 3.4 6.7L5 21.5l4.1-2.1c.9.2 1.9.4 2.9.4 5.2 0 9.5-3.9 9.5-8.8S17.2 2.5 12 2.5z" fill={couleur} />
  </svg>
);

export const NUMEROS = ['+228 72 24 02 31', '+228 79 16 23 90'];

// Bandeau vert permanent dès le prix.
export const BandeauWhatsApp: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 40, width: 900, top: 1408, height: 122, transform: `translateY(${(1 - pop(t, 0, 0.35)) * 160}px)`, fontFamily: POLICE}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: `linear-gradient(135deg, #25d366, ${VERT} 60%, #128c4a)`, boxShadow: '0 14px 40px #000b, 0 0 0 4px #ffffff55', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 0, bottom: 0, width: 160, left: `${((t * 0.45) % 1.6) * 100 - 30}%`, background: 'linear-gradient(90deg, transparent, #ffffff40, transparent)', transform: 'skewX(-20deg)'}} />
    </div>
    <div style={{position: 'absolute', left: 22, top: 15, width: 92, height: 92, borderRadius: 26, background: '#ffffff26', display: 'grid', placeItems: 'center', transform: `rotate(${Math.sin(t * 6) * 6}deg)`}}>
      <Bulle taille={66} />
    </div>
    <div style={{position: 'absolute', left: 134, top: 10, color: COULEURS.blanc, fontWeight: 800, fontSize: 30, letterSpacing: 2}}>WHATSAPP</div>
    <div style={{position: 'absolute', left: 134, top: 46, color: COULEURS.blanc, fontWeight: 800, fontSize: 56, lineHeight: 1.1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
      {NUMEROS[0].replace('+228 ', '')}
      <span style={{fontSize: 40, opacity: 0.85}}> · </span>
      {NUMEROS[1].replace('+228 ', '')}
    </div>
    <div style={{position: 'absolute', right: 26, top: 12, color: '#eafff1', fontWeight: 700, fontSize: 30}}>+228</div>
  </div>
);

// Numéro en très grand, chaque groupe claque quand il est dit.
export const NumeroGeant: React.FC<{t: number; groupes: number[]; y?: number}> = ({t, groupes, y = 560}) => {
  const morceaux = ['72', '24', '02', '31'];
  return (
    <div style={{position: 'absolute', left: 60, width: 880, top: y, fontFamily: POLICE, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '8px 30px', borderRadius: 22, background: VERT, color: COULEURS.blanc, fontWeight: 800, fontSize: 56, transform: `scale(${pop(t, groupes[0] - 0.35, 0.3)})`, boxShadow: '0 12px 30px #000b'}}>
        <Bulle taille={56} /> WhatsApp · +228
      </div>
      <div style={{marginTop: 20, display: 'flex', gap: 30, fontVariantNumeric: 'tabular-nums'}}>
        {morceaux.map((m, i) => (
          <div key={m + i} style={{fontSize: 172, fontWeight: 800, color: COULEURS.blanc, ...CONTOUR(18), textShadow: `0 0 40px ${VERT}`, opacity: t >= groupes[i] - 0.02 ? 1 : 0.0, transform: `scale(${t >= groupes[i] - 0.02 ? claque(t - groupes[i] + 0.02, 2.2) : 0}) rotate(${(i % 2 ? 3 : -3)}deg)`}}>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ carte finale

export const CarteFinale: React.FC<{t: number}> = ({t}) => {
  const pulse = 1 + 0.05 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{fontFamily: POLICE, overflow: 'hidden'}}>
      <FondAnime t={t} teinte="#2a2580" />
      {[[110, 300, 56], [880, 420, 42], [110, 1060, 40], [880, 1300, 54]].map(([x, y, s], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y + Math.sin(t * 2 + i) * 14, transform: `rotate(${t * 50 + i * 40}deg) scale(${pop(t, 0.2 + i * 0.08)})`}}>
          <Etoile taille={s} couleur={i % 2 ? COULEURS.or : COULEURS.violet} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 40, width: 910, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Img src={staticFile('marque/logo.jpg')} style={{marginTop: 215, width: 200, height: 200, borderRadius: 40, boxShadow: `0 0 ${40 + 20 * Math.sin(t * 3)}px ${COULEURS.or}99`, transform: `translateY(${Math.sin(t * 2.2) * 8}px) scale(${pop(t, 0, 0.4)})`}} />
        <div style={{marginTop: 26, textAlign: 'center', color: COULEURS.blanc, fontWeight: 800, fontSize: 60, lineHeight: 1.1, transform: `scale(${pop(t, 0.12, 0.35)})`}}>
          Créer et monter des vidéos <span style={{color: COULEURS.or}}>avec l’IA</span>
        </div>
        <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${pop(t, 0.3, 0.35)})`}}>
          <div style={{position: 'relative', color: '#c9cbe0', fontWeight: 800, fontSize: 64}}>
            25 000 F
            <div style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 9, borderRadius: 5, background: ROUGE, transform: 'rotate(-8deg)'}} />
          </div>
          <div style={{color: COULEURS.or, fontWeight: 800, fontSize: 130, ...CONTOUR(12), transform: `scale(${pulse})`}}>3 600 F</div>
        </div>
        <div style={{marginTop: 4, padding: '8px 30px', borderRadius: 18, background: ROUGE, color: COULEURS.blanc, fontWeight: 800, fontSize: 46, transform: `scale(${pop(t, 0.45, 0.3)}) rotate(-2deg)`}}>
          Aujourd’hui seulement · 10 places
        </div>
        <div style={{marginTop: 34, width: 860, padding: '26px 30px', borderRadius: 40, background: `linear-gradient(135deg, #25d366, ${VERT} 60%, #128c4a)`, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 6)}px #25d36699, 0 18px 44px #000b`, transform: `scale(${pop(t, 0.6, 0.35) * (1 + 0.02 * Math.sin(t * 6))})`, display: 'flex', alignItems: 'center', gap: 26}}>
          <div style={{width: 120, height: 120, borderRadius: 34, background: '#ffffff2e', display: 'grid', placeItems: 'center', transform: `rotate(${Math.sin(t * 8) * 8}deg)`}}>
            <Bulle taille={84} />
          </div>
          <div style={{color: COULEURS.blanc, fontWeight: 800}}>
            <div style={{fontSize: 38, letterSpacing: 2}}>ÉCRIS SUR WHATSAPP</div>
            {NUMEROS.map((n, i) => (
              <div key={n} style={{fontSize: 70, lineHeight: 1.1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', opacity: t >= 0.8 + i * 0.35 ? 1 : 0, transform: `scale(${t >= 0.8 + i * 0.35 ? pop(t, 0.8 + i * 0.35, 0.3) : 0})`, transformOrigin: '0 50%'}}>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop: 30, padding: '16px 38px', borderRadius: 999, background: COULEURS.blanc, color: COULEURS.nuit, fontWeight: 800, fontSize: 50, transform: `scale(${pop(t, 1.6, 0.35) * pulse})`, whiteSpace: 'nowrap'}}>
          « Coach Joseph, je suis prêt. »
        </div>
        <div style={{marginTop: 22, color: COULEURS.or, fontWeight: 800, fontSize: 46, opacity: prog(t, 1.9, 2.2)}}>⏰ Fin de l’offre à 23 h 59</div>
      </div>
    </AbsoluteFill>
  );
};

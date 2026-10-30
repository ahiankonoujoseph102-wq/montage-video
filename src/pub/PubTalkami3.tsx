import React, {useEffect, useState} from 'react';
import {fitText} from '@remotion/layout-utils';
import {Lottie, type LottieAnimationData} from '@remotion/lottie';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile,
  useCurrentFrame} from 'remotion';
import {Blocage, Entree, Fond, Logo, pop, prog} from './PubTalkami';

// Publicité Talkami v3 : style et déroulé de la première version (fond bleu Talkami), optimisés :
// - bande fixe en bas (1 290 → 1 920 px) qui porte les sous-titres : jamais sur un écran ni sur un visage ;
// - téléphones géants (écran à 78 %, soit 1 500 px de haut) qui glissent et zooment lentement derrière la bande ;
// - professeurs cadrés serré sur le visage et le sourire ; aucun plan immobile (zoom lent partout) ;
// - coupes rapides sur la phrase 2, emojis animés (Noto, CC BY 4.0) et badges qui rebondissent sur les mots clés ;
// - fin animée de 2,5 s au plus : logo, « talkami.net » lettre par lettre, bouton « Évaluation orale gratuite ».
// Temps en secondes dans la voix v3 (projets/talkami-pub/voix-v3/), mots au texte exact.
const FPS = 30;
const NAVY = '#0F2D62';
const NAVY_FONCE = '#0A1F4A';
const ORANGE = '#FF7A1A';
const VERT = '#22C55E';
const ROUGE = '#EF4444';
const POLICE = 'Montserrat';
const CX = 500;
const BANDE = 1290;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const kit = (f: string) => staticFile(`talkami-pub/kit/${f}`);
const S = (s: number) => Math.round(s * FPS);

export type Mot3 = {t: string; ph: number; a: number; b: number};
export type Bloc3 = {n: number; geant?: boolean; cle?: string[]};
export type PubV3Props = {duree: number; mots: Mot3[]; blocs: Bloc3[]; emojis: string[]};

// --- Emojis animés (Noto, lottie) ---
const EmojiCtx = React.createContext<Record<string, LottieAnimationData>>({});
const Emoji: React.FC<{code: string; x: number; y: number; taille: number; a?: number; angle?: number}> = (
  {code, x, y, taille, a = 0, angle = 0}) => {
  const f = useCurrentFrame();
  const data = React.useContext(EmojiCtx)[code];
  const k = pop(f, a, 260);
  if (!data || f < a) return null;
  return (
    <div style={{position: 'absolute', left: x - taille / 2, top: y - taille / 2, width: taille, height: taille,
      transform: `scale(${k}) rotate(${angle}deg)`, filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.4))'}}>
      <Lottie animationData={data} loop style={{width: taille, height: taille}} />
    </div>
  );
};

// --- Plans ---

// Zoom lent commun à tous les plans (aucun plan immobile).
const Lent: React.FC<React.PropsWithChildren<{duree: number; de?: number; a?: number; ox?: number; oy?: number}>> = (
  {duree, de = 1, a = 1.06, ox = 540, oy = 700, children}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, duree], [de, a], clamp);
  return <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>;
};

// Téléphone géant : écran à 78 % (842 × 1 498 px) ; « vue » = décalage vertical (début → fin) pour faire glisser
// la partie utile au-dessus de la bande ; zoom lent vers une cible de l'écran.
const ECH = 0.78;
const TL = 1080 * ECH;
const TH = 1920 * ECH;
const Telephone: React.FC<{src: string; depuis: number; duree: number; vue?: [number, number]; zoom?: [number, number];
  cible?: [number, number]; entree?: 'bas' | 'droite' | 'gauche'}> = (
  {src, depuis, duree, vue = [0, -40], zoom = [1, 1.06], cible = [540, 700], entree = 'bas'}) => {
  const f = useCurrentFrame();
  const av = interpolate(f, [0, duree], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const e = prog(f, 0, 8, Easing.out(Easing.cubic));
  const dy = vue[0] + (vue[1] - vue[0]) * av + (entree === 'bas' ? (1 - e) * 500 : 0);
  const dx = entree === 'droite' ? (1 - e) * 900 : entree === 'gauche' ? (1 - e) * -900 : 0;
  const z = zoom[0] + (zoom[1] - zoom[0]) * av;
  const x0 = CX - TL / 2;
  const y0 = 150;
  return (
    <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${z})`,
      transformOrigin: `${x0 + cible[0] * ECH}px ${y0 + cible[1] * ECH}px`}}>
      <div style={{position: 'absolute', left: x0 - 22, top: y0 - 22, width: TL + 44, height: TH + 44, borderRadius: 96,
        background: '#0B1222', boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 5px #2B3550 inset'}} />
      <div style={{position: 'absolute', left: x0, top: y0, width: TL, height: TH, borderRadius: 76, overflow: 'hidden',
        background: '#fff'}}>
        <OffthreadVideo src={kit(src)} muted startFrom={Math.max(0, S(depuis))} style={{width: TL, height: TH}} />
      </div>
      <div style={{position: 'absolute', left: CX - 90, top: y0 + 14, width: 180, height: 40, borderRadius: 20,
        background: '#0B1222'}} />
    </AbsoluteFill>
  );
};

// Professeur cadré serré : le visage (fx, fy dans le clip) amené vers (520, 640), zoom lent.
const VISAGES: Record<string, [number, number, number]> = {
  'joe-salut.mp4': [640, 1010, 1.5], 'rose-salut.mp4': [640, 1010, 1.5],
  'joe-sourire.mp4': [540, 900, 1.42], 'rose-sourire.mp4': [540, 900, 1.42],
  'joe-ecoute.mp4': [540, 920, 1.4], 'rose-ecoute.mp4': [540, 900, 1.42],
  'rose-hochement.mp4': [540, 900, 1.42], 'joe-hochement.mp4': [540, 900, 1.42],
};
const Prof: React.FC<{src: string; depuis?: number; duree: number; etiquette?: string; sens?: 1 | -1}> = (
  {src, depuis = 0, duree, etiquette, sens = 1}) => {
  const f = useCurrentFrame();
  const [fx, fy, z0] = VISAGES[src];
  const z = z0 * interpolate(f, [0, duree], sens > 0 ? [1, 1.08] : [1.08, 1], clamp);
  const tx = 520 - fx * z;
  const ty = 640 - fy * z;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0',
        transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>
        <OffthreadVideo src={kit(src)} muted startFrom={S(depuis)} style={{width: 1080, height: 1920}} />
      </div>
      {etiquette ? <Etiquette texte={etiquette} /> : null}
    </AbsoluteFill>
  );
};

const Etiquette: React.FC<{texte: string}> = ({texte}) => {
  const f = useCurrentFrame();
  const k = prog(f, 1, 7, Easing.out(Easing.back(1.8)));
  return (
    <div style={{position: 'absolute', top: 1110, left: CX - 400, width: 800, display: 'flex', justifyContent: 'center',
      transform: `translateX(${(1 - k) * -1000}px)`}}>
      <div style={{background: NAVY, border: '6px solid #fff', borderRadius: 50, padding: '12px 42px', display: 'flex',
        alignItems: 'center', gap: 20, boxShadow: '0 16px 36px rgba(0,0,0,0.4)'}}>
        <div style={{width: 26, height: 26, borderRadius: 13, background: ORANGE}} />
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 76, color: '#fff'}}>{texte}</span>
      </div>
    </div>
  );
};

// Passage de la séance agrandi : séance floutée en fond, dialogue découpé en grand, puce de correction.
const Dialogue: React.FC<{src: string; fond: string; cadre: [number, number, number, number]; duree: number;
  puce: {a: number; faux?: string; juste?: string; texte?: string}}> = ({src, fond, cadre, duree, puce}) => {
  const f = useCurrentFrame();
  const [x1, y1, x2, y2] = cadre;
  const k = 900 / (x2 - x1);
  const l = (x2 - x1) * k;
  const h = (y2 - y1) * k;
  const z = interpolate(f, [0, duree], [1, 1.08], clamp);
  const ent = pop(f, 0, 200);
  const kp = pop(f, puce.a, 230);
  const barre = prog(f, puce.a + 4, 6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(14px) brightness(0.45)', transform: `scale(${1.1 * z})`}}>
        <OffthreadVideo src={kit(fond)} muted startFrom={330} style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: CX - l / 2, top: 560 - h / 2, width: l, height: h, borderRadius: 36,
        overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.55)', border: '6px solid #fff',
        transform: `scale(${(0.6 + 0.4 * ent) * z})`, opacity: ent > 0 ? 1 : 0}}>
        <Img src={kit(src)} style={{position: 'absolute', width: 1080 * k, left: -x1 * k, top: -y1 * k}} />
      </div>
      <div style={{position: 'absolute', top: 1035, left: CX - 440, width: 880, display: 'flex', justifyContent: 'center',
        transform: `scale(${kp})`, opacity: kp > 0 ? 1 : 0}}>
        {puce.faux ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 24, background: '#fff', borderRadius: 60, padding: '10px 38px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}>
            <span style={{position: 'relative', fontFamily: POLICE, fontWeight: 900, fontSize: 92, color: ROUGE}}>{puce.faux}
              <span style={{position: 'absolute', left: -6, top: '50%', height: 11, width: `${barre * 110}%`, background: ROUGE,
                borderRadius: 6}} /></span>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 80, color: NAVY}}>→</span>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 92, color: '#15803D'}}>{puce.juste}</span>
            <span style={{width: 76, height: 76, borderRadius: 38, background: VERT, color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontFamily: POLICE, fontWeight: 900, fontSize: 50}}>✓</span>
          </div>
        ) : (
          <div style={{background: ORANGE, color: '#fff', borderRadius: 50, padding: '14px 46px', border: '6px solid #fff',
            fontFamily: POLICE, fontWeight: 900, fontSize: 78, boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}>{puce.texte}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Badge « ÉVALUATION ORALE GRATUITE » qui claque.
const Badge: React.FC<{a: number}> = ({a}) => {
  const f = useCurrentFrame();
  const k = pop(f, a, 240);
  const pulse = f > a + 12 ? 1 + 0.035 * Math.sin((f - a) / 4) : 1;
  return (
    <div style={{position: 'absolute', left: CX - 420, width: 840, top: 290, display: 'flex', justifyContent: 'center',
      transform: `scale(${k * pulse}) rotate(${-3 * Math.min(1, k)}deg)`, opacity: k > 0 ? 1 : 0}}>
      <div style={{background: ORANGE, borderRadius: 40, padding: '18px 40px', border: '7px solid #fff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)', textAlign: 'center'}}>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 58, lineHeight: 1.05, color: NAVY}}>ÉVALUATION ORALE</div>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 100, lineHeight: 1.0, color: '#fff'}}>GRATUITE</div>
      </div>
    </div>
  );
};

// Joe et Rose côte à côte, cadrés sur les deux visages, logo blanc au-dessus.
const Duo: React.FC<{duree: number}> = ({duree}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, duree], [1.12, 1.2], clamp);
  const k = pop(f, 2, 200);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0',
        transform: `translate(${500 - 529 * z}px, ${720 - 890 * z}px) scale(${z})`}}>
        <OffthreadVideo src={kit('joe-et-rose-cote-a-cote.mp4')} muted style={{width: 1080, height: 1920}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 470,
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY} 60%, rgba(15,45,98,0) 100%)`}} />
      <Img src={kit('logo-talkami-blanc-transparent.png')} style={{position: 'absolute', width: 620, left: CX - 310,
        top: 285, transform: `scale(${k})`}} />
    </AbsoluteFill>
  );
};

// Fin animée (2,5 s) : logo, « talkami.net » lettre par lettre, trait orange, bouton qui pulse, reflet.
const Fin: React.FC<{pulse: number}> = ({pulse}) => {
  const f = useCurrentFrame();
  const lettres = 'talkami.net'.split('');
  const taille = Math.min(200, fitText({text: 'talkami.net', withinWidth: 860, fontFamily: POLICE, fontWeight: '900'}).fontSize);
  const kl = pop(f, 0, 200);
  const kb = pop(f, 20, 220);
  const p = f >= pulse && f < pulse + 14 ? 1 + 0.06 * Math.sin(((f - pulse) / 14) * Math.PI) : 1;
  const reflet = interpolate(f, [28, 46], [-300, 1300], clamp);
  const trait = prog(f, 14, 10);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 540px 800px, #17407F 0%, ${NAVY} 45%, ${NAVY_FONCE} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${CX} 820) rotate(${f * 1.2})`} opacity={0.35}>
          {Array.from({length: 16}).map((_, i) => <path key={i} d="M 0 0 L -60 -1200 L 60 -1200 Z" fill={ORANGE}
            opacity={0.3} transform={`rotate(${i * 22.5})`} />)}
        </g>
      </svg>
      <Img src={kit('logo-talkami-blanc-transparent.png')} style={{position: 'absolute', width: 560, left: CX - 280,
        top: 470, transform: `scale(${kl})`}} />
      <div style={{position: 'absolute', top: 760, left: CX - 440, width: 880, display: 'flex', justifyContent: 'center',
        transform: `scale(${p})`, overflow: 'hidden'}}>
        {lettres.map((c, i) => {
          const k = pop(f, 3 + i * 1.2, 300);
          return <span key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.1,
            color: c === '.' ? ORANGE : '#fff', display: 'inline-block', transform: `translateY(${(1 - Math.min(1, k)) * 120}px) scale(${k})`,
            opacity: k > 0 ? 1 : 0, textShadow: '0 10px 24px rgba(0,0,0,0.45)'}}>{c}</span>;
        })}
        <div style={{position: 'absolute', top: 0, bottom: 0, left: reflet, width: 120, transform: 'skewX(-20deg)',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)'}} />
      </div>
      <div style={{position: 'absolute', top: 760 + taille * 1.15, left: CX - 100 * trait, width: 200 * trait, height: 10,
        borderRadius: 5, background: ORANGE}} />
      <div style={{position: 'absolute', top: 1040, left: CX - 430, width: 860, display: 'flex', justifyContent: 'center',
        transform: `scale(${kb * (f > 34 ? 1 + 0.03 * Math.sin((f - 34) / 4) : 1)})`, opacity: kb > 0 ? 1 : 0}}>
        <div style={{background: ORANGE, borderRadius: 70, padding: '24px 56px', fontFamily: POLICE, fontWeight: 900,
          fontSize: 66, color: NAVY, boxShadow: '0 18px 40px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>Évaluation orale gratuite</div>
      </div>
    </AbsoluteFill>
  );
};

// Titre géant de l'accroche (3 lignes, chacune ajustée à la largeur), dans la zone au-dessus de la bande.
const TitreGeant: React.FC = () => {
  const f = useCurrentFrame();
  const lignes = ["L'ANGLAIS", 'VOUS', 'BLOQUE ?'];
  const style = (taille: number): React.CSSProperties => ({fontFamily: POLICE, fontWeight: 900, fontSize: taille,
    lineHeight: 1.0, WebkitTextStroke: `${Math.round(taille * 0.16)}px ${NAVY_FONCE}`, paintOrder: 'stroke fill',
    filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))', whiteSpace: 'nowrap'});
  return (
    <div style={{position: 'absolute', left: CX - 420, width: 840, top: 790, display: 'flex', flexDirection: 'column',
      alignItems: 'center'}}>
      {lignes.map((l, i) => {
        const taille = Math.min(160, fitText({text: l, withinWidth: 840, fontFamily: POLICE, fontWeight: '900'}).fontSize);
        const k = pop(f, i * 4, 280);
        return <div key={i} style={{...style(taille), color: i === 2 ? ORANGE : '#fff', transform: `scale(${k})`,
          opacity: k > 0 ? 1 : 0}}>{l}</div>;
      })}
    </div>
  );
};

// --- Bande des sous-titres (fixe) ---

const Bande: React.FC<{mots: Mot3[]; blocs: Bloc3[]; cache: (t: number) => boolean}> = ({mots, blocs, cache}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (cache(t)) return null;
  // Découpe des mots en blocs (n mots chacun), dans l'ordre.
  const liste: {mots: Mot3[]; bloc: Bloc3}[] = [];
  let i = 0;
  for (const b of blocs) {
    liste.push({mots: mots.slice(i, i + b.n), bloc: b});
    i += b.n;
  }
  let cur = -1;
  for (let k = 0; k < liste.length; k++) if (liste[k].mots[0].a - 0.04 <= t) cur = k;
  const bl = cur >= 0 ? liste[cur] : null;
  const fin = bl ? bl.mots[bl.mots.length - 1].b + 0.6 : 0;
  const montre = bl && !bl.bloc.geant && (t <= fin || (liste[cur + 1] && t >= liste[cur + 1].mots[0].a - 0.04));
  const texte = bl ? bl.mots.map((m) => m.t).join(' ').toUpperCase() : '';
  const taille = Math.min(98, fitText({text: texte || 'A', withinWidth: 840, fontFamily: POLICE, fontWeight: '900'}).fontSize);
  const d = bl ? f - S(bl.mots[0].a - 0.04) : 0;
  const k = interpolate(d, [0, 3], [1.12, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const cles = new Set((bl?.bloc.cle ?? []).map((c) => c.toUpperCase()));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: BANDE, bottom: 0,
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_FONCE} 100%)`, boxShadow: '0 -18px 40px rgba(0,0,0,0.45)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: BANDE - 4, height: 8,
        background: `linear-gradient(90deg, rgba(255,122,26,0), ${ORANGE}, rgba(255,122,26,0))`, boxShadow: `0 0 20px ${ORANGE}`}} />
      {montre && bl ? (
        <div style={{position: 'absolute', left: CX - 420, width: 840, top: 1392 - (taille * 1.05) / 2, display: 'flex',
          justifyContent: 'center', transform: `scale(${k})`}}>
          <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.05, whiteSpace: 'nowrap',
            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
            {bl.mots.map((m, j) => {
              const mot = m.t.toUpperCase();
              const cle = cles.has(mot.replace(/[,.:?…]/g, '').trim()) || cles.has(mot);
              const dit = t >= m.a - 0.04;
              const kc = cle && dit ? pop(f, S(m.a - 0.04), 320) : 1;
              return <span key={j} style={{display: 'inline-block', color: cle ? ORANGE : '#fff',
                opacity: dit ? 1 : 0.5, transform: `scale(${cle ? 0.75 + 0.25 * kc : 1})`,
                marginLeft: j > 0 ? taille * 0.28 : 0}}>{mot}</span>;
            })}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Flash: React.FC<{images: number[]}> = ({images}) => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...images.map((i) => (f >= i && f < i + 3 ? [0.5, 0.25, 0.08][f - i] : 0)));
  return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

// --- Montage ---

export const PubTalkami3: React.FC<PubV3Props> = ({mots, blocs, emojis, duree}) => {
  const [attente] = useState(() => delayRender('Montserrat et emojis'));
  const [pret, setPret] = useState(false);
  const [donnees, setDonnees] = useState<Record<string, LottieAnimationData>>({});
  useEffect(() => {
    Promise.all([
      document.fonts.load('900 100px Montserrat'), document.fonts.load('800 100px Montserrat'),
    ]).then(() => Promise.all(emojis.map((c) => fetch(staticFile(`talkami-pub/emojis/${c}.json`))
      .then((r) => r.json()).then((j: LottieAnimationData) => [c, j] as [string, LottieAnimationData]))))
    .then((res) => {
      const d: Record<string, LottieAnimationData> = {};
      for (const [c, j] of res) d[c] = j;
      setDonnees(d);
      setPret(true);
      continueRender(attente);
    });
  }, [attente, emojis]);
  const f = useCurrentFrame();
  if (!pret) return null;
  const A = (t: string, ph?: number, n = 0) => {
    const l = mots.filter((x) => x.t === t && (ph === undefined || x.ph === ph));
    if (!l[n]) throw new Error(`mot introuvable : ${t}`);
    return l[n].a;
  };
  const p: Record<string, [number, number]> = {};
  const bornes: [string, number][] = [
    ['h0', 0], ['h1', A('Vous', 1) - 0.05], ['h2', A('mais') - 0.05], ['logo', A('Avec') - 0.15],
    ['parlez', A('vous', 2) - 0.08], ['joe', A('avec', 2) - 0.05], ['rose', A('ou') - 0.05],
    ['tel1', A('directement') - 0.05], ['tel2', A('votre', 2) - 0.05], ['zero1', A('Même') - 0.08],
    ['zero2', A('de', 2, 0) - 0.05], ['ecoute1', A('Ils') - 0.08], ['ecoute2', A('écoutent,') - 0.05],
    ['corrige', A('corrigent') - 0.05], ['francais', A('et', 3) - 0.05], ['bloquez', A('quand') - 0.05],
    ['eval', A('Commencez') - 0.1], ['duo', A('Talkami :') - 0.1], ['oser1', A('vous', 5) - 0.06],
    ['oser2', A('le', 5, 0) - 0.04], ['fin', A('Rendez-vous') - 0.1], ['_', duree],
  ];
  bornes.slice(0, -1).forEach(([n, a], i) => { p[n] = [a, bornes[i + 1][1]]; });
  const D = (n: string) => S(p[n][1]) - S(p[n][0]);
  const R = (n: string, t: number) => S(t) - S(p[n][0]);
  const seq = (n: string, mode: string | undefined, c: React.ReactNode, fond = true) => (
    <Sequence key={n} from={S(p[n][0])} durationInFrames={D(n)}>
      {fond ? <Fond f={f} /> : null}
      <Entree f={f - S(p[n][0])} mode={mode}>{c}</Entree>
    </Sequence>
  );
  // Choix du professeur : le doigt touche « Choisir Teacher Rose » à 4,0 s du clip, pile sur « téléphone ».
  const depuisChoix = 4.0 - (A('téléphone.') - p.tel1[0]);
  const depuisEval = 2.5 - (A('évaluation') - p.eval[0]);
  return (
    <EmojiCtx.Provider value={donnees}>
      <AbsoluteFill style={{background: NAVY}}>
        {seq('h0', undefined, <Lent duree={D('h0')}><Blocage f={f - S(p.h0[0])} etat={0} /><TitreGeant /></Lent>)}
        {seq('h1', undefined, <Lent duree={D('h1')}><Blocage f={f - S(p.h1[0])} etat={1} />
          <Emoji code="1f914" x={CX} y={1130} taille={250} a={R('h1', A('comprenez…'))} /></Lent>)}
        {seq('h2', undefined, <Lent duree={D('h2')}><Blocage f={f - S(p.h2[0])} etat={2} />
          <Emoji code="1f630" x={CX} y={1130} taille={250} a={R('h2', A('parler ?', 1)) - 4} /></Lent>)}
        {seq('logo', undefined, <Lent duree={D('logo')} oy={760}><Logo f={f - S(p.logo[0])} rebond={R('logo', A('Talkami,'))} /></Lent>)}
        {seq('parlez', 'droite', <Telephone src="ecran-accueil-pastille-rose.mp4" depuis={0.4} duree={D('parlez')} vue={[0, -60]} entree="droite" />)}
        {seq('joe', undefined, <><Prof src="joe-salut.mp4" depuis={0.2} duree={D('joe')} etiquette="TEACHER JOE" />
          <Emoji code="1f44b" x={830} y={420} taille={210} a={3} angle={-8} /></>, false)}
        {seq('rose', undefined, <><Prof src="rose-salut.mp4" depuis={0.2} duree={D('rose')} etiquette="TEACHER ROSE" sens={-1} />
          <Emoji code="1f44b" x={830} y={420} taille={210} a={3} angle={8} /></>, false)}
        {seq('tel1', 'bas', <Telephone src="ecran-choix-du-professeur.mp4" depuis={depuisChoix} duree={D('tel1')} vue={[0, -80]} />)}
        {seq('tel2', undefined, <Telephone src="ecran-choix-du-professeur.mp4" depuis={depuisChoix + (p.tel2[0] - p.tel1[0])}
          duree={D('tel2')} vue={[-80, -120]} zoom={[1.15, 1.32]} cible={[540, 820]} entree={undefined} />)}
        {seq('zero1', undefined, <Prof src="joe-sourire.mp4" depuis={0.2} duree={D('zero1')} />, false)}
        {seq('zero2', undefined, <><Prof src="rose-sourire.mp4" depuis={0.5} duree={D('zero2')} sens={-1} />
          <Emoji code="1f60a" x={830} y={430} taille={200} a={2} /></>, false)}
        {seq('ecoute1', undefined, <Prof src="joe-ecoute.mp4" depuis={0.6} duree={D('ecoute1')} />, false)}
        {seq('ecoute2', undefined, <><Prof src="rose-ecoute.mp4" depuis={0.8} duree={D('ecoute2')} sens={-1} />
          <Emoji code="1f442" x={830} y={430} taille={200} a={1} /></>, false)}
        {seq('corrige', undefined, <><Dialogue src="seance-correction-douce.png" fond="ecran-seance-correction-douce.mp4"
          cadre={[100, 780, 960, 1250]} duree={D('corrige')} puce={{a: R('corrige', A('douceur,')), faux: 'I go', juste: 'I went'}} />
          <Emoji code="2705" x={860} y={300} taille={170} a={R('corrige', A('douceur,')) + 3} /></>, false)}
        {seq('francais', undefined, <><Dialogue src="seance-explication-en-francais.png" fond="ecran-seance-explication-francais.mp4"
          cadre={[70, 780, 1010, 1210]} duree={D('francais')} puce={{a: R('francais', A('français')), texte: 'EN FRANÇAIS'}} />
          <Emoji code="1f4ac" x={860} y={300} taille={170} a={R('francais', A('français')) + 3} /></>, false)}
        {seq('bloquez', undefined, <Prof src="rose-hochement.mp4" depuis={0.3} duree={D('bloquez')} />, false)}
        {seq('eval', 'bas', <><Telephone src="ecran-bouton-evaluation-gratuite.mp4" depuis={depuisEval} duree={D('eval')}
          vue={[-120, -420]} zoom={[1, 1.12]} cible={[540, 1530]} />
          <Badge a={R('eval', A('gratuite.'))} />
          <Emoji code="1f381" x={850} y={1110} taille={190} a={R('eval', A('gratuite.')) + 4} /></>)}
        {seq('duo', undefined, <Duo duree={D('duo')} />, false)}
        {seq('oser1', undefined, <><Prof src="rose-sourire.mp4" depuis={1.2} duree={D('oser1')} />
          <Emoji code="1f4aa" x={830} y={430} taille={220} a={R('oser1', A('oser'))} /></>, false)}
        {seq('oser2', undefined, <><Prof src="joe-sourire.mp4" depuis={1.4} duree={D('oser2')} sens={-1} />
          <Emoji code="1f389" x={830} y={430} taille={220} a={1} /></>, false)}
        {seq('fin', undefined, <Fin pulse={R('fin', A('talkami.net.'))} />, false)}
        <Bande mots={mots} blocs={blocs} cache={(t) => t >= p.fin[0]} />
        <Flash images={[0, S(p.logo[0]), S(p.fin[0])]} />
      </AbsoluteFill>
    </EmojiCtx.Provider>
  );
};

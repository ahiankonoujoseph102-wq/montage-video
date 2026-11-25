import React, {useEffect, useState} from 'react';
import {fitText} from '@remotion/layout-utils';
import {Lottie, type LottieAnimationData} from '@remotion/lottie';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, random, Sequence, spring,
  staticFile, useCurrentFrame} from 'remotion';
import {FONDS_ILLUSTRATION} from '../dynamique/Illustrations';
import {SousTitresMot} from '../dynamique/SousTitresMot';
import type {Mot} from '../types';
import {etatDouble, type EtapeExpression, type EtapeGeste} from '../double/commun/animationDouble';
import {BrasDouble2D, Double2D} from '../double/v2d/Double2D';
import {Bureau2D, Decor2D} from '../double/v2d/Decor2D';
import {MISE_EN_PAGE} from '../double/theme';
const ECRAN = MISE_EN_PAGE.ecran;

// Vidéo automatique (test, étape 1) : style dynamique en écran partagé.
// - en haut (0 → 900 px) : une scène générique par phrase (carte, question, alerte, numéro, demande tapée, deux cartes,
//   liste, téléphone, fin), sur un dégradé animé, avec un emoji animé (Noto, CC BY 4.0) ;
// - bandeau sombre (900 → 1 035 px) : sous-titres bleus du style dynamique, un ou deux mots (SousTitresMot) ;
// - en bas : le double animé (copié de montage-videos), bouche calée sur la voix (visèmes), gestes selon le plan.
const FPS = 30;
const HAUT = 900;
const BANDEAU = 135;
const OR = '#FFC83D';
const BLANC = '#fff';
const ROUGE = '#EF4444';
const VERT = '#22C55E';
const POLICE = 'Montserrat';
const CX = 500;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const S = (s: number) => Math.round(s * FPS);

export type Scene = {type: string; texte?: string; kicker?: string; sous?: string; emoji?: string; n?: number;
  gauche?: {texte: string; ok: boolean}; droite?: {texte: string; ok: boolean}; a?: string | string[];
  titre?: string; items?: {texte: string; a: string; ok?: boolean}[]; lignes?: string[]; geste?: string; doigts?: number;
  expression?: string; outil?: string; outils?: OutilScene[]; prompt?: string; reponse?: string; logo?: boolean; mise?: string; nom?: string; note?: string; fichier?: string; credit?: string; recherche?: string;
  eteint?: boolean; depart?: number;
  calc?: {texte: string; montant: number; a: string; total?: boolean}[]; etapes?: {texte: string; a: string; doute?: boolean}[];
  cartes?: {texte: string; a: string}[]; de?: number; vers?: number;
  fichier2?: string; fondVideo?: string;
  // Pub Zéro Perte : démonstration de l'appli (enregistrement d'écran dans un téléphone), repères, étiquettes.
  clips?: ClipApp[]; cadres?: CadreApp[]; reperes?: RepereApp[]; badges?: BadgeApp[];
  notif?: {a: string; titre: string; texte: string}; numeros?: string[]};
export type ClipApp = {a?: string; fichier: string; de: number; vitesse?: number};
export type CadreApp = {a?: string; x?: number; y: number; e: number};
export type RepereApp = {a: string; x: number; y: number; l: number; h: number; couleur?: string; jusqua?: string};
export type BadgeApp = {a: string; texte: string; couleur?: string; emoji?: string; y?: number; jusqua?: string};
export type OutilScene = {id: string; nom: string; site: string; logo: boolean; capture: boolean};
export type MotAuto = {t: string; ph: number; a: number; b: number};
export type AutoProps = {duree: number; phrases: {a: number; b: number}[]; mots: MotAuto[]; motsFrames: Mot[];
  masques: [number, number][]; visemes: string; bouche: number[]; scenes: Scene[]; fonds: string[]; emojis: string[];
  decalageDouble: number; titre?: {lignes: string[]; cle?: string}; carton?: {debut: number; whatsapp?: string}; marque?: 'zeroperte'; logoDes?: number; logos?: Record<string, {nom: string; couleur: string}>};

const pop = (f: number, a = 0, raide = 220, amorti = 10) =>
  f < a ? 0 : spring({frame: f - a, fps: FPS, config: {damping: amorti, stiffness: raide, mass: 0.7}});

const EmojiCtx = React.createContext<Record<string, LottieAnimationData>>({});
const Emoji: React.FC<{code?: string; x: number; y: number; taille: number; a?: number}> = ({code, x, y, taille, a = 4}) => {
  const f = useCurrentFrame();
  const data = React.useContext(EmojiCtx)[code ?? ''];
  if (!data || f < a) return null;
  const k = pop(f, a, 260);
  return (
    <div style={{position: 'absolute', left: x - taille / 2, top: y - taille / 2, width: taille, height: taille,
      transform: `scale(${k}) rotate(${Math.sin(f / 9) * 6}deg)`, filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.4))'}}>
      <Lottie animationData={data} loop style={{width: taille, height: taille}} />
    </div>
  );
};

// Gros texte blanc à contour, ajusté à la largeur (une ou plusieurs lignes séparées par \n).
const Gros: React.FC<{texte: string; y: number; max?: number; largeur?: number; couleur?: string; k?: number}> = (
  {texte, y, max = 120, largeur = 820, couleur = BLANC, k = 1}) => {
  // Une ligne trop longue (plus de 16 caractères) est coupée en deux lignes équilibrées : jamais de texte minuscule.
  const lignes = texte.split('\n').flatMap((l) => {
    const mots = l.trim().split(/\s+/);
    if (l.length <= 16 || mots.length < 2 || texte.includes('\n')) return [l];
    let best = 1;
    let ecart = Infinity;
    for (let c = 1; c < mots.length; c++) {
      const e = Math.abs(mots.slice(0, c).join(' ').length - mots.slice(c).join(' ').length);
      if (e < ecart) { ecart = e; best = c; }
    }
    return [mots.slice(0, best).join(' '), mots.slice(best).join(' ')];
  });
  const taille = Math.min(max, ...lignes.map((l) => fitText({text: l, withinWidth: largeur, fontFamily: POLICE,
    fontWeight: '900'}).fontSize));
  return (
    <div style={{position: 'absolute', left: CX - largeur / 2, width: largeur, top: y, textAlign: 'center',
      transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
      {lignes.map((l, i) => (
        <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.05, color: couleur,
          WebkitTextStroke: `${Math.round(taille * 0.14)}px #0B0F2E`, paintOrder: 'stroke fill',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))', whiteSpace: 'nowrap'}}>{l}</div>
      ))}
    </div>
  );
};

const Kicker: React.FC<{texte: string; y: number; k: number}> = ({texte, y, k}) => (
  <div style={{position: 'absolute', left: CX - 420, width: 840, top: y, display: 'flex', justifyContent: 'center',
    transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
    <div style={{background: OR, color: '#1B1446', borderRadius: 40, padding: '8px 34px', fontFamily: POLICE,
      fontWeight: 900, fontSize: 52, letterSpacing: 2, boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>{texte}</div>
  </div>
);

const Marque: React.FC<{ok: boolean; k: number; taille?: number}> = ({ok, k, taille = 92}) => (
  <div style={{width: taille, height: taille, borderRadius: taille / 2, background: ok ? VERT : ROUGE, border: '6px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: POLICE, fontWeight: 900,
    fontSize: taille * 0.6, transform: `scale(${k})`, opacity: k > 0 ? 1 : 0, boxShadow: '0 8px 18px rgba(0,0,0,0.35)'}}>
    {ok ? '✓' : '✗'}
  </div>
);

// Particules de lumière qui flottent (bokeh) et reflet chaud qui passe lentement : de la vie sur chaque image.
const Lumieres: React.FC<{h: number; graine: number; chaud?: boolean}> = ({h, graine, chaud = true}) => {
  const f = useCurrentFrame();
  const reflet = (f % 240) / 240;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={h} style={{position: 'absolute'}}>
        {Array.from({length: 18}).map((_, i) => {
          const x = (random(`lx${graine}${i}`) * 1080 + Math.sin((f + i * 40) / 60) * 30);
          const y = ((random(`ly${graine}${i}`) * h - f * (0.4 + random(`lv${graine}${i}`) * 0.9)) % h + h) % h;
          const r = 4 + random(`lr${graine}${i}`) * 14;
          const o = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin((f + i * 17) / 20));
          return <circle key={i} cx={x} cy={y} r={r} fill={chaud ? '#FFE3A3' : '#CFE0FF'} opacity={o} style={{filter: 'blur(3px)'}} />;
        })}
      </svg>
      {chaud ? <AbsoluteFill style={{background: `linear-gradient(115deg, rgba(255,170,60,0) ${reflet * 140 - 40}%, rgba(255,170,60,0.16) ${reflet * 140 - 20}%, rgba(255,170,60,0) ${reflet * 140}%)`,
        mixBlendMode: 'screen'}} /> : null}
    </AbsoluteFill>
  );
};

// Fond d'une scène : vidéo libre de droits assombrie (émotion, mouvement) si le plan en donne une, sinon dégradé animé.
const FondScene: React.FC<{s: Scene; nom: string; graine: number; h?: number}> = ({s, nom, graine, h = HAUT}) => {
  const f = useCurrentFrame();
  if (!s.fondVideo) return <Fond nom={nom} graine={graine} h={h} />;
  return (
    <AbsoluteFill style={{background: '#05070F'}}>
      <OffthreadVideo src={staticFile(s.fondVideo)} muted style={{width: 1080, height: h, objectFit: 'cover',
        transform: `scale(${1.05 + 0.0006 * f})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,25,0.55), rgba(5,7,25,0.42) 50%, rgba(5,7,25,0.62))'}} />
      <Lumieres h={h} graine={graine} />
    </AbsoluteFill>
  );
};

// Instant (image, relative à la scène) où un mot de la phrase est dit.
type Ctx = {debut: number; fin: number; motA: (m: string) => number; h?: number; s0?: number; s1?: number};

const SceneVue: React.FC<{s: Scene; c: Ctx}> = ({s: brute, c}) => {
  // Filet de sécurité : une scène d'image sans fichier préparé devient une carte de texte (le rendu ne casse jamais).
  const s: Scene = (brute.type === 'photo' && !brute.fichier) || (brute.type === 'outil' && !(brute.outils ?? []).length)
    ? {type: 'carte', texte: (brute.texte ?? 'L\'IA').toUpperCase(), emoji: brute.emoji}
    : brute.type === 'demo' && brute.logo && !brute.outil ? {...brute, logo: false} : brute;
  const f = useCurrentFrame();
  const k = pop(f, 0);
  const duree = c.fin - c.debut;
  switch (s.type) {
    case 'reponseIA': {
      const n = Math.floor(interpolate(f, [8, Math.max(20, duree * 0.7)], [0, (s.texte ?? '').length], clamp));
      return (
        <>
          <div style={{position: 'absolute', left: 90, top: 250, width: 820, height: 560, borderRadius: 40, background: '#F6F7FB',
            boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `scale(${0.7 + 0.3 * k})`, overflow: 'hidden'}}>
            <div style={{height: 110, background: '#fff', display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px',
              borderBottom: '3px solid #E3E5EE'}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: '#6D4BFF', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, fontFamily: POLICE}}>✦</div>
              <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: '#1B1B2F'}}>Assistant IA</div>
            </div>
            <div style={{margin: '50px 40px', background: '#E4E6F0', borderRadius: 34, padding: '30px 36px',
              fontFamily: POLICE, fontWeight: 800, fontSize: 58, color: '#1B1B2F', lineHeight: 1.2, minHeight: 180}}>
              {(s.texte ?? '').slice(0, n)}<span style={{opacity: f % 20 < 10 ? 1 : 0}}>|</span>
            </div>
          </div>
          <Emoji code={s.emoji} x={830} y={300} taille={200} a={Math.max(10, duree - 30)} />
        </>
      );
    }
    case 'question':
      return (
        <>
          {[[170, 380, 140, -14], [860, 420, 120, 16], [220, 760, 110, 10], [820, 760, 150, -8]].map(([x, y, t, r], i) => (
            <div key={i} style={{position: 'absolute', left: x - 60, top: y - 80 + Math.sin((f + i * 13) / 9) * 12,
              fontFamily: POLICE, fontWeight: 900, fontSize: t, color: BLANC, opacity: 0.35, transform: `rotate(${r}deg)`}}>?</div>
          ))}
          <Gros texte={s.texte ?? ''} y={410} max={230} k={k} couleur={OR} />
          {s.sous ? <Gros texte={s.sous} y={690} max={64} k={pop(f, 8)} /> : null}
          <Emoji code={s.emoji} x={CX} y={300} taille={170} a={6} />
        </>
      );
    case 'alerte': {
      const tremble = f < 14 ? Math.sin(f * 2.6) * 12 * (1 - f / 14) : 0;
      return (
        <>
          <svg width={1080} height={HAUT} style={{position: 'absolute', transform: `translateX(${tremble}px)`}}>
            <g transform={`translate(${CX} 420) scale(${k})`}>
              <path d="M 0 -170 L 190 150 L -190 150 Z" fill={OR} stroke="#fff" strokeWidth={14} strokeLinejoin="round" />
              <rect x={-14} y={-80} width={28} height={140} rx={14} fill="#1B1446" />
              <circle cx={0} cy={105} r={18} fill="#1B1446" />
            </g>
          </svg>
          <Gros texte={s.texte ?? ''} y={600} max={100} k={pop(f, 5)} />
          <Emoji code={s.emoji} x={840} y={300} taille={180} a={8} />
        </>
      );
    }
    case 'carte':
      return (
        <>
          {s.kicker ? <Kicker texte={s.kicker} y={290} k={k} /> : null}
          <Gros texte={s.texte ?? ''} y={410} max={150} k={pop(f, 4)} />
          {s.sous ? <Gros texte={s.sous} y={720} max={66} k={pop(f, 10)} couleur={OR} /> : null}
          <Emoji code={s.emoji} x={830} y={s.sous ? 300 : 760} taille={180} a={8} />
        </>
      );
    case 'numero': {
      const kn = pop(f, 0, 300, 8);
      return (
        <>
          <div style={{position: 'absolute', left: CX - 150, top: 230, width: 300, height: 300, borderRadius: 150,
            background: `radial-gradient(circle at 35% 30%, #FFE27A, ${OR} 60%, #E8A20C)`, border: '10px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: POLICE, fontWeight: 900, fontSize: 210,
            color: '#1B1446', transform: `scale(${kn}) rotate(${(1 - Math.min(1, kn)) * 40}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
            {s.n}
          </div>
          <Gros texte={s.texte ?? ''} y={580} max={96} k={pop(f, 6)} />
          <Emoji code={s.emoji} x={810} y={300} taille={180} a={10} />
        </>
      );
    }
    case 'prompt': {
      const n = Math.floor(interpolate(f, [6, Math.max(14, duree - 12)], [0, (s.texte ?? '').length], clamp));
      const taille = (s.texte ?? '').length > 45 ? 58 : 66;
      return (
        <>
          <Kicker texte="ÉCRIS :" y={250} k={k} />
          <div style={{position: 'absolute', left: 90, top: 370, width: 820, display: 'flex', justifyContent: 'flex-end',
            transform: `scale(${0.7 + 0.3 * k})`, opacity: k > 0 ? 1 : 0}}>
            <div style={{background: '#1D7CF2', color: '#fff', borderRadius: '40px 40px 8px 40px', padding: '32px 40px',
              fontFamily: POLICE, fontWeight: 800, fontSize: taille, lineHeight: 1.2, maxWidth: 820,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
              {(s.texte ?? '').slice(0, n)}<span style={{opacity: f % 20 < 10 ? 1 : 0}}>|</span>
            </div>
          </div>
        </>
      );
    }
    case 'deux': {
      const ancres = (Array.isArray(s.a) ? s.a : []).map((m) => c.motA(m));
      const carte = (x: number, d: {texte: string; ok: boolean}, a: number, angle: number) => {
        const kc = pop(f, Math.min(Math.max(0, a - 4), angle < 0 ? 3 : 8), 200); // carte visible tôt, marque sur le mot
        return (
          <div style={{position: 'absolute', left: x - 200, top: 300, width: 400, height: 440, borderRadius: 40,
            background: '#fff', boxShadow: '0 24px 50px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 30, transform: `scale(${kc}) rotate(${angle}deg)`,
            opacity: kc > 0 ? 1 : 0}}>
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 58, color: '#1B1B2F', textAlign: 'center',
              lineHeight: 1.1, whiteSpace: 'pre-line'}}>{d.texte}</div>
            <Marque ok={d.ok} k={pop(f, a + 2, 260)} taille={110} />
          </div>
        );
      };
      return (
        <>
          {carte(280, s.gauche!, ancres[0] ?? 4, -3)}
          {carte(720, s.droite!, ancres[1] ?? 20, 3)}
        </>
      );
    }
    case 'liste':
      return (
        <>
          <Kicker texte={s.titre ?? ''} y={240} k={k} />
          {(s.items ?? []).map((it, i) => {
            const a = c.motA(it.a);
            const ki = pop(f, Math.max(0, a - 3), 240);
            const n = (s.items ?? []).length;
            const pas = Math.min(140, 520 / Math.max(3, n));
            const y = 345 + i * pas;
            return (
              <div key={i} style={{position: 'absolute', left: 130, top: y, width: 740, height: Math.min(110, pas - 14), borderRadius: 30,
                background: '#fff', display: 'flex', alignItems: 'center', gap: 28, padding: '0 30px',
                transform: `translateX(${(1 - Math.min(1, ki)) * 600}px)`, opacity: ki > 0 ? 1 : 0,
                boxShadow: '0 14px 28px rgba(0,0,0,0.35)'}}>
                <Marque ok={it.ok !== false} k={pop(f, a, 260)} taille={n > 4 ? 62 : 74} />
                <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: n > 4 ? 48 : 56, color: '#1B1B2F', whiteSpace: 'nowrap'}}>{it.texte}</div>
              </div>
            );
          })}
        </>
      );
    case 'telephone': {
      const chiffres = (s.texte ?? '').split('');
      return (
        <>
          <Kicker texte="WHATSAPP" y={280} k={k} />
          <div style={{position: 'absolute', left: CX - 70, top: 380, width: 140, height: 140, borderRadius: 70,
            background: '#25D366', border: '8px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${pop(f, 2)})`}}>
            <svg width={70} height={70} viewBox="0 0 24 24"><path fill="#fff" d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>
          </div>
          <div style={{position: 'absolute', left: CX - 440, width: 880, top: 580, textAlign: 'center', whiteSpace: 'nowrap'}}>
            {chiffres.map((ch, i) => {
              const kc = pop(f, 6 + i * 2, 300);
              return <span key={i} style={{display: 'inline-block', fontFamily: POLICE, fontWeight: 900, fontSize: 104,
                color: BLANC, WebkitTextStroke: '14px #0B0F2E', paintOrder: 'stroke fill', transform: `scale(${kc})`,
                opacity: kc > 0 ? 1 : 0}}>{ch === ' ' ? ' ' : ch}</span>;
            })}
          </div>
        </>
      );
    }
    case 'outil': {
      // Outils cités : logo officiel (identification seulement) + nom en texte ; capture réelle de la page publique
      // quand il n'y a qu'un outil et qu'elle existe. Aucune affiliation suggérée.
      const outils = s.outils ?? [];
      const tuile = (o: OutilScene, x: number, y: number, taille: number, a: number) => {
        const kt = pop(f, a, 240, 11);
        return (
          <div key={o.id} style={{position: 'absolute', left: x - taille / 2, top: y, width: taille, textAlign: 'center',
            transform: `scale(${kt})`, opacity: kt > 0 ? 1 : 0}}>
            <div style={{width: taille, height: taille, borderRadius: taille * 0.24, background: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 36px rgba(0,0,0,0.45)'}}>
              {o.logo ? <Img src={staticFile(`test-auto/logos/${o.id}.svg`)} style={{width: taille * 0.62, height: taille * 0.62}} />
                : <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille * 0.4, color: '#1B1B2F'}}>{o.nom.slice(0, 1)}</div>}
            </div>
          </div>
        );
      };
      if (outils.length === 1 && outils[0].capture) {
        const o = outils[0];
        const kc = pop(f, 5, 200, 12);
        return (
          <>
            {tuile(o, 205, 175, 150, 0)}
            <div style={{position: 'absolute', left: 300, top: 205, fontFamily: POLICE, fontWeight: 900, fontSize: 84,
              color: BLANC, WebkitTextStroke: '12px #0B0F2E', paintOrder: 'stroke fill', transform: `scale(${k})`,
              transformOrigin: 'left center'}}>{o.nom}</div>
            <div style={{position: 'absolute', left: 90, top: 345, width: 900, height: 520, borderRadius: 28, overflow: 'hidden',
              background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `scale(${0.6 + 0.4 * kc})`,
              opacity: kc > 0 ? 1 : 0}}>
              <div style={{height: 52, background: '#E9EBF2', display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px'}}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
                <div style={{marginLeft: 14, flex: 1, height: 34, borderRadius: 17, background: '#fff', fontFamily: POLICE,
                  fontWeight: 700, fontSize: 24, color: '#444', display: 'flex', alignItems: 'center', padding: '0 18px'}}>{o.site}</div>
              </div>
              <Img src={staticFile(`test-auto/outils/${o.id}.png`)} style={{width: 900, height: 468, objectFit: 'cover',
                objectPosition: 'top', transform: `scale(${interpolate(f, [0, Math.max(1, duree)], [1, 1.06], clamp)})`,
                transformOrigin: 'top center'}} />
            </div>
          </>
        );
      }
      const n = Math.max(1, outils.length);
      const taille = n === 1 ? 330 : n === 2 ? 270 : n === 3 ? 230 : 190;
      const ecart = Math.min(300, 840 / n);
      return (
        <>
          {s.texte ? <Kicker texte={s.texte} y={215} k={k} /> : null}
          {outils.map((o, i) => tuile(o, CX + (i - (n - 1) / 2) * ecart, n === 1 ? 300 : 340, taille, 3 + i * 5))}
          {outils.map((o, i) => (
            <Gros key={o.id} texte={o.nom} y={(n === 1 ? 300 : 340) + taille + 30} max={n === 1 ? 110 : 64} largeur={Math.min(820, ecart - 10)}
              k={pop(f, 6 + i * 5)} />
          )).map((g, i) => <div key={i} style={{position: 'absolute', left: (i - (n - 1) / 2) * ecart, top: 0, width: 1080, height: HAUT}}>{g}</div>)}
        </>
      );
    }
    case 'demo': {
      // Démonstration : le prompt est tapé dans l'outil, puis la réponse (écrite par l'IA) s'affiche ligne par ligne.
      const prompt = s.prompt ?? '';
      const lignes = (s.reponse ?? '').split('\n').filter((l) => l.trim());
      const finFrappe = Math.max(18, Math.round(duree * 0.38));
      const nTape = Math.floor(interpolate(f, [6, finFrappe], [0, prompt.length], clamp));
      const kc = pop(f, 0, 200, 12);
      return (
        <div style={{position: 'absolute', left: 70, top: 200, width: 940, height: 670, borderRadius: 34, background: '#F7F7FA',
          overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `scale(${0.7 + 0.3 * kc})`, opacity: kc > 0 ? 1 : 0}}>
          <div style={{height: 96, background: '#fff', display: 'flex', alignItems: 'center', gap: 20, padding: '0 30px',
            borderBottom: '2px solid #E5E7EF'}}>
            {s.logo ? <Img src={staticFile(`test-auto/logos/${s.outil}.svg`)} style={{width: 58, height: 58}} />
              : <div style={{width: 58, height: 58, borderRadius: 29, background: '#6D4BFF', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, fontFamily: POLICE}}>✦</div>}
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 42, color: '#1B1B2F'}}>{s.nom ?? 'Assistant IA'}</div>
          </div>
          <div style={{padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 22}}>
            <div style={{alignSelf: 'flex-end', maxWidth: 760, background: '#2B59FF', color: '#fff', borderRadius: '30px 30px 6px 30px',
              padding: '20px 26px', fontFamily: POLICE, fontWeight: 700, fontSize: 34, lineHeight: 1.25}}>
              {prompt.slice(0, nTape)}{nTape < prompt.length ? <span style={{opacity: f % 16 < 8 ? 1 : 0}}>|</span> : null}
            </div>
            {f > finFrappe + 4 ? (
              <div style={{alignSelf: 'flex-start', maxWidth: 840, background: '#fff', border: '2px solid #E5E7EF',
                borderRadius: '30px 30px 30px 6px', padding: '20px 26px', fontFamily: POLICE, fontWeight: 600, fontSize: 31,
                color: '#1B1B2F', lineHeight: 1.3}}>
                {lignes.map((l, i) => {
                  const a = finFrappe + 6 + i * Math.max(6, Math.round((duree - finFrappe - 12) / Math.max(1, lignes.length)));
                  const kl = interpolate(f, [a, a + 6], [0, 1], clamp);
                  return <div key={i} style={{opacity: kl, transform: `translateY(${(1 - kl) * 14}px)`}}>{l}</div>;
                })}
              </div>
            ) : f > finFrappe - 2 ? <div style={{fontFamily: POLICE, fontSize: 40, color: '#888'}}>• • •</div> : null}
          </div>
          {s.note && f > finFrappe + 4 ? <div style={{position: 'absolute', left: 30, bottom: 16, fontFamily: POLICE, fontWeight: 600,
            fontSize: 22, color: '#8A8FA3'}}>{s.note}</div> : null}
        </div>
      );
    }
    case 'photo': {
      // Image IA ou vidéo libre de droits. Mouvement de caméra varié (avant, arrière, glissé gauche/droite), particules
      // de lumière, vignette et reflet chaud : jamais d'image figée. « fichier2 » : second plan sur la 2e moitié.
      const h = c.h ?? HAUT;
      const t = c.debut + f;
      const milieu = c.s0 !== undefined && c.s1 !== undefined ? (c.s0 + c.s1) / 2 : Infinity;
      const second = !!s.fichier2 && t >= milieu;
      const fichier = second ? s.fichier2! : (s.fichier ?? '');
      const d0 = second ? milieu : (c.s0 ?? c.debut);
      const d1 = second ? (c.s1 ?? c.fin) : Math.min(milieu, c.s1 ?? c.fin);
      const prog = interpolate(t, [d0, Math.max(d0 + 1, d1)], [0, 1], clamp);
      let graine = 0;
      for (const ch of fichier) graine = (graine * 31 + ch.charCodeAt(0)) % 997;
      const mv = graine % 4;
      const z = mv === 1 ? 1.2 - 0.12 * prog : 1.06 + 0.12 * prog;
      const dx = mv === 2 ? -50 + 100 * prog : mv === 3 ? 50 - 100 * prog : 0;
      const gris = s.eteint ? interpolate(f, [duree * 0.45, Math.max(duree * 0.45 + 1, duree - 4)], [0, 1], clamp) : 0;
      const style: React.CSSProperties = {width: 1080, height: h, objectFit: 'cover', transform: `scale(${z}) translateX(${dx}px)`,
        filter: gris ? `grayscale(${gris}) brightness(${1 - 0.45 * gris})` : undefined};
      const src = staticFile(fichier);
      const flash = second ? interpolate(t, [milieu, milieu + 5], [0.5, 0], clamp) : 0;
      return (
        <>
          <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
            {fichier.endsWith('.mp4') ? <OffthreadVideo src={src} muted style={style} /> : <Img src={src} style={style} />}
          </AbsoluteFill>
          <Lumieres h={h} graine={graine} chaud={!s.eteint} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
          {flash ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
          {s.texte ? <Gros texte={s.texte} y={h > HAUT ? 1010 : 650} max={h > HAUT ? 130 : 110} k={pop(f, 6)} /> : null}
          {/* Crédit de la photo : dans l'e-mail et la description, jamais sur l'image (demande de Joseph). */}
        </>
      );
    }
    case 'app':
      return <SceneApp s={s} c={c} />;
    case 'logo':
      return <SceneLogo c={c} />;
    case 'appareils':
      return <SceneAppareils s={s} c={c} />;
    case 'contact':
      return <SceneContact s={s} c={c} />;
    case 'final':
      return (
        <>
          <Gros texte={(s.lignes ?? [])[0] ?? ''} y={300} max={130} k={k} couleur={OR} />
          {(s.lignes ?? []).slice(1).map((l, i) => <Gros key={i} texte={l} y={500 + i * 90} max={62} k={pop(f, 8 + i * 6)} />)}
          <Emoji code="2728" x={850} y={760} taille={170} a={10} />
        </>
      );
    case 'chiffre': {
      // Chiffre clé en très grand, doré, qui arrive avec un rebond.
      const kc = pop(f, 3, 260, 9);
      return (
        <>
          {s.kicker ? <Kicker texte={s.kicker} y={250} k={k} /> : null}
          <Gros texte={s.texte ?? ''} y={400} max={150} couleur={OR} k={kc} />
          {s.sous ? <Gros texte={s.sous} y={600} max={80} k={pop(f, 10)} /> : null}
          <Emoji code={s.emoji} x={CX} y={800} taille={160} a={14} />
        </>
      );
    }
    case 'calcul': {
      // Le compte du mois : chaque ligne arrive sur son mot et le solde se vide en direct (compteur animé).
      const lignes = s.calc ?? [];
      const fmt = (v: number) => `${Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F`;
      const ancres = lignes.map((l) => c.motA(l.a));
      const base = (lignes[0]?.montant ?? 0) > 0 ? 0 : (s.depart ?? 0);
      const solde = base + lignes.reduce((t, l, i) => l.total ? t : t + l.montant *
        interpolate(f, [ancres[i], ancres[i] + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}), 0);
      const pas = Math.min(104, 430 / Math.max(3, lignes.length));
      const aSolde = lignes.some((l) => l.total);
      const faible = solde < (s.depart ?? 1) * 0.2;
      return (
        <>
          <Kicker texte={s.titre ?? ''} y={215} k={k} />
          {lignes.map((l, i) => {
            const kl = pop(f, Math.max(0, ancres[i] - 2), 240);
            const rouge = l.montant < 0;
            return (
              <div key={i} style={{position: 'absolute', left: 110, top: 300 + i * pas, width: 780, height: pas - 16,
                borderRadius: 26, background: l.total ? OR : '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 34px', boxShadow: '0 14px 28px rgba(0,0,0,0.35)',
                transform: `translateX(${(1 - Math.min(1, kl)) * -700}px)`, opacity: kl > 0 ? 1 : 0}}>
                <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: '#1B1B2F'}}>{l.texte}</div>
                <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 50, color: l.total ? '#1B1446' : rouge ? ROUGE : '#159947'}}>
                  {l.total ? fmt(solde) : `${rouge ? '−' : '+'}${fmt(Math.abs(l.montant))}`}</div>
              </div>
            );
          })}
          {!aSolde ? (
            <div style={{position: 'absolute', left: 60, width: 880, top: 300 + lignes.length * pas + 8, textAlign: 'center',
              fontFamily: POLICE, fontWeight: 900, fontSize: 88, color: faible ? ROUGE : BLANC, whiteSpace: 'nowrap',
              WebkitTextStroke: '12px #0B0F2E', paintOrder: 'stroke fill',
              transform: `scale(${faible ? 1 + 0.04 * Math.sin(f / 3) : 1})`}}>
              {`RESTE : ${fmt(Math.max(0, solde))}`}
            </div>
          ) : null}
        </>
      );
    }
    case 'chemin': {
      // Le parcours, étape par étape, relié par des flèches ; la dernière étape (doute) reste suspendue à un « ? ».
      const etapes = s.etapes ?? [];
      const n = etapes.length;
      const pas = Math.min(130, 560 / Math.max(3, n));
      return (
        <>
          <Kicker texte={s.titre ?? ''} y={205} k={k} />
          {etapes.map((e, i) => {
            const a = e.a ? c.motA(e.a) : 0;
            const ke = pop(f, Math.max(0, a - 2), 230);
            const y = 310 + i * pas;
            const doute = !!e.doute;
            return (
              <React.Fragment key={i}>
                {i > 0 ? <div style={{position: 'absolute', left: CX - 6, top: y - pas * 0.32, width: 12, height: pas * 0.3,
                  background: OR, opacity: ke > 0 ? 1 : 0, borderRadius: 6}} /> : null}
                <div style={{position: 'absolute', left: CX - 260, top: y, width: 520, height: pas * 0.66, borderRadius: 999,
                  background: doute ? 'rgba(255,255,255,0.12)' : '#fff', border: doute ? `6px dashed ${OR}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
                  transform: `scale(${ke}) rotate(${doute ? Math.sin(f / 6) * 2.5 : 0}deg)`, opacity: ke > 0 ? 1 : 0,
                  boxShadow: '0 12px 26px rgba(0,0,0,0.35)'}}>
                  <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: Math.min(58, pas * 0.4),
                    color: doute ? OR : '#1B1B2F'}}>{e.texte}</div>
                </div>
              </React.Fragment>
            );
          })}
        </>
      );
    }
    case 'annee': {
      // 2026 qui bascule vers 2027 : le temps presse.
      const de = s.de ?? 2026;
      const vers = s.vers ?? de + 1;
      const t = interpolate(f, [Math.max(10, duree * 0.45), Math.max(14, duree * 0.45 + 10)], [0, 1], clamp);
      const tremble = t > 0 && t < 1 ? Math.sin(f * 2) * 6 : 0;
      return (
        <>
          <Kicker texte="LE TEMPS PRESSE" y={250} k={k} />
          <div style={{position: 'absolute', left: 0, width: 1080, top: 380, height: 260, overflow: 'hidden',
            transform: `translateX(${tremble}px)`}}>
            {[de, vers].map((an, i) => (
              <div key={an} style={{position: 'absolute', left: 0, width: 1000, top: (i - t) * 260, textAlign: 'center',
                fontFamily: POLICE, fontWeight: 900, fontSize: 230, lineHeight: '260px', color: i ? OR : BLANC,
                WebkitTextStroke: '18px #0B0F2E', paintOrder: 'stroke fill'}}>{an}</div>
            ))}
          </div>
          <Emoji code={s.emoji} x={CX} y={780} taille={170} a={Math.max(14, Math.round(duree * 0.45 + 8))} />
        </>
      );
    }
    case 'cadenas': {
      // Les réponses de la partie 2, encore verrouillées : on donne envie sans rien dévoiler.
      const cartes = s.cartes ?? [];
      const n = cartes.length;
      const pas = Math.min(170, 540 / Math.max(2, n));
      return (
        <>
          <Kicker texte="DANS LA PARTIE 2" y={215} k={k} />
          {cartes.map((cte, i) => {
            const a = cte.a ? c.motA(cte.a) : 0;
            const kc = pop(f, Math.max(0, a - 2), 230);
            return (
              <div key={i} style={{position: 'absolute', left: 140, top: 320 + i * pas, width: 720, height: pas - 30,
                borderRadius: 30, background: 'rgba(255,255,255,0.14)', border: '4px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', gap: 30, padding: '0 36px', backdropFilter: 'blur(6px)',
                transform: `scale(${kc})`, opacity: kc > 0 ? 1 : 0}}>
                <div style={{fontSize: 70, transform: `rotate(${Math.sin((f + i * 11) / 7) * 8}deg)`}}>🔒</div>
                <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 58, color: BLANC, filter: 'blur(0.6px)', whiteSpace: 'nowrap',
                  WebkitTextStroke: '8px #0B0F2E', paintOrder: 'stroke fill'}}>{cte.texte}</div>
              </div>
            );
          })}
        </>
      );
    }
    case 'partie2': {
      const pulse = 1 + 0.04 * Math.sin(f / 5);
      return (
        <>
          <div style={{position: 'absolute', left: CX - 330, top: 270, width: 660, height: 660, borderRadius: 330,
            background: `radial-gradient(circle, rgba(255,201,40,${0.35 + 0.15 * Math.sin(f / 6)}) 0%, rgba(255,201,40,0) 70%)`}} />
          <Gros texte={s.texte ?? ''} y={420} max={170} couleur={OR} k={k * pulse} />
          {s.sous ? <Gros texte={s.sous} y={640} max={80} k={pop(f, 8)} /> : null}
          <Emoji code={s.emoji} x={840} y={330} taille={170} a={10} />
        </>
      );
    }
    case 'commentaire': {
      // Appel à l'action : bouton « S'abonner » puis commentaire « PARTIE 2 » tapé dans une bulle TikTok (sans logo).
      const kb = pop(f, 2, 220);
      const ka = pop(f, Math.round(duree * 0.4), 220);
      const txt = s.texte ?? '';
      const nTape = Math.floor(interpolate(f, [Math.round(duree * 0.4) + 6, Math.round(duree * 0.4) + 26], [0, txt.length], clamp));
      const clic = f > 16 && f < 24;
      return (
        <>
          <div style={{position: 'absolute', left: CX - 280, top: 250, width: 560, height: 150, borderRadius: 75,
            background: clic || f >= 24 ? '#3A3F55' : '#FE2C55', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: POLICE, fontWeight: 900, fontSize: 64, color: '#fff', transform: `scale(${kb * (clic ? 0.92 : 1)})`,
            boxShadow: '0 18px 36px rgba(0,0,0,0.45)'}}>{f >= 24 ? 'Abonné ✓' : "S'abonner"}</div>
          <div style={{position: 'absolute', left: 90, top: 480, width: 840, borderRadius: 34, background: '#fff', padding: '30px 34px',
            display: 'flex', alignItems: 'center', gap: 24, transform: `translateY(${(1 - Math.min(1, ka)) * 300}px)`,
            opacity: ka > 0 ? 1 : 0, boxShadow: '0 24px 50px rgba(0,0,0,0.45)'}}>
            <div style={{width: 96, height: 96, borderRadius: 48, background: '#6D4BFF', flexShrink: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 52}}>🙋🏾</div>
            <div>
              <div style={{fontFamily: POLICE, fontWeight: 700, fontSize: 30, color: '#8A8FA3'}}>Ton commentaire</div>
              <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 76, color: '#1B1B2F'}}>
                {txt.slice(0, nTape)}<span style={{opacity: nTape < txt.length && f % 16 < 8 ? 1 : 0}}>|</span></div>
            </div>
          </div>
          <Emoji code={s.emoji} x={860} y={820} taille={150} a={Math.round(duree * 0.4) + 28} />
        </>
      );
    }
    default:
      return null;
  }
};

// Fond animé du panneau du haut (même esprit que les scènes illustrées).
const Fond: React.FC<{nom: string; graine: number; h?: number}> = ({nom, graine, h = HAUT}) => {
  const f = useCurrentFrame();
  const [a, b, c] = FONDS_ILLUSTRATION[nom] ?? FONDS_ILLUSTRATION.bleu;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${160 + 12 * Math.sin(f / 40)}deg, ${a} 0%, ${b} 55%, ${c} 100%)`}}>
      <svg width={1080} height={h} style={{position: 'absolute'}}>
        <circle cx={250 + 90 * Math.sin(f / 33)} cy={330 + 60 * Math.cos(f / 41)} r={340} fill="#fff" opacity={0.08} />
        <circle cx={850 + 70 * Math.cos(f / 29)} cy={720 + 50 * Math.sin(f / 37)} r={280} fill="#fff" opacity={0.06} />
        {Array.from({length: 24}).map((_, i) => {
          const x = random(`x${graine}${i}`) * 1080;
          const y = ((random(`y${graine}${i}`) * h - f * (1 + random(`v${graine}${i}`) * 2)) % h + h) % h;
          return <circle key={i} cx={x} cy={y} r={2 + random(`r${graine}${i}`) * 4} fill="#fff" opacity={0.25} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Gestes et expressions du double : plan d'abord, sinon règle simple (alternance repos / explique).
const choregraphie = (scenes: Scene[], phrases: {a: number; b: number}[]) => {
  const gestes: EtapeGeste[] = [{t: 0, geste: 'repos'}];
  const expressions: EtapeExpression[] = [{t: 0, expression: 'neutre'}];
  scenes.forEach((s, i) => {
    const p = phrases[i];
    if (!p) return;
    const geste = (s.geste ?? (i % 2 ? 'explique' : 'repos')) as EtapeGeste['geste'];
    gestes.push({t: p.a, geste, ...(s.doigts ? {doigts: s.doigts as 1 | 2 | 3 | 4} : {})});
    expressions.push({t: p.a, expression: (s.expression ?? 'parle') as EtapeExpression['expression']});
    if (s.expression === 'grimace' || s.expression === 'surpris') expressions.push({t: p.a + 1.2, expression: 'parle'});
  });
  const fin = phrases[phrases.length - 1];
  expressions.push({t: fin.b + 0.2, expression: 'sourire'});
  return {gestes, expressions};
};

export const VideoAuto: React.FC<AutoProps> = (p) => {
  const [attente] = useState(() => delayRender('Montserrat et emojis'));
  const [donnees, setDonnees] = useState<Record<string, LottieAnimationData> | null>(null);
  useEffect(() => {
    Promise.all([document.fonts.load('900 100px Montserrat'), document.fonts.load('800 100px Montserrat')])
      .then(() => Promise.all(p.emojis.map((c) => fetch(staticFile(`test-auto/emojis/${c}.json`)).then((r) => r.json())
        .then((j: LottieAnimationData) => [c, j] as [string, LottieAnimationData]))))
      .then((res) => {
        setDonnees(Object.fromEntries(res));
        continueRender(attente);
      });
  }, [attente, p.emojis]);
  const f = useCurrentFrame();
  if (!donnees) return null;
  const t = f / FPS;
  const {gestes, expressions} = choregraphie(p.scenes, p.phrases);
  const etat = etatDouble(t, gestes, expressions, p.bouche, p.visemes, FPS);
  // Bornes des scènes : de la fin de la phrase précédente (ou 0) à la fin de la sienne.
  const bornes = p.phrases.map((ph, i) => [i === 0 ? 0 : S(p.phrases[i - 1].b), i === p.phrases.length - 1 ? S(p.duree) : S(ph.b)]);
  const segs = plans(p.scenes, bornes, misesAuto(p.scenes, bornes));
  let ic = 0;
  segs.forEach((g, k) => { if (f >= g.a) ic = k; });
  const mise = segs[ic]?.mise ?? 'partage';
  const depuis = f - (segs[ic]?.a ?? 0);
  // Changement de mise en page : coup de zoom + éclair blanc de 5 images (coupe nette, jamais de fondu mou).
  const change = ic > 0 && segs[ic - 1].mise !== mise;
  const coup = change ? interpolate(depuis, [0, 7], [1.1, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const eclair = change ? interpolate(depuis, [0, 5], [0.55, 0], clamp) : 0;
  // Cadrage du double : alterne normal / serré à chaque phrase (coupe franche), en plus du coup d'ouverture.
  const serre = ic % 2 === 1 ? 1.07 : 1;  // ic = indice du plan
  const z0 = zoomDouble(f);
  const ctxDe = (i: number, a: number, b: number, h?: number): Ctx => ({debut: a, fin: b, h,
    s0: S(p.phrases[i].a), s1: S(p.phrases[i].b), motA: (m) => {
    const x = p.mots.find((w) => w.ph === i && w.t === m);
    return x ? S(x.a) - a : 6;
  }});
  const corpsDouble = (
    <>
      <Double2D etat={etat} />
      <Bureau2D />
      <BrasDouble2D etat={etat} />
    </>
  );
  const partages: [number, number][] = segs.filter((g) => g.mise === 'partage').map((g) => [g.a, g.b]);
  return (
    <EmojiCtx.Provider value={donnees}>
      <AbsoluteFill style={{background: '#020629', overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: `scale(${coup})`}}>
          {mise === 'partage' ? (
            /* Écran partagé : double dans la moitié basse, illustration en haut. */
            <AbsoluteFill style={{top: HAUT + BANDEAU - 40, overflow: 'hidden'}}>
              <AbsoluteFill style={{transform: `translateY(${p.decalageDouble - HAUT - BANDEAU + 40}px) translate(${z0.x}px, ${z0.y}px) scale(${z0.z * serre})`,
                transformOrigin: '540px 1260px'}}>
                <Decor2D />
                {corpsDouble}
              </AbsoluteFill>
            </AbsoluteFill>
          ) : mise === 'double' ? (
            /* Présentateur : le double en grand dans son studio, l'idée affichée sur le grand écran derrière lui. */
            <AbsoluteFill style={{transform: `scale(${(serre === 1 ? 1.04 : 1.12) + 0.03 * Math.min(1, depuis / 120)})`,
              transformOrigin: '540px 760px'}}>
              <Decor2D />
              <div style={{position: 'absolute', left: ECRAN.x, top: ECRAN.y, width: ECRAN.l, height: ECRAN.h, overflow: 'hidden',
                borderRadius: 10}}>
                {segs.map(({i, a, b, mise: m}, k) => {
                  if (m !== 'double' || b <= a) return null;
                  // Toute l'illustration tient sur l'écran (rien de coupé) ; le fond remplit les côtés.
                  const ech = Math.min(ECRAN.l / 1080, ECRAN.h / HAUT);
                  return (
                    <Sequence key={k} from={a} durationInFrames={b - a}>
                      <FondScene s={p.scenes[i]} nom={p.fonds[i] ?? 'bleu'} graine={i} />
                      <div style={{position: 'absolute', left: (ECRAN.l - 1080 * ech) / 2, top: (ECRAN.h - HAUT * ech) / 2,
                        width: 1080, height: HAUT, transform: `scale(${ech})`, transformOrigin: '0 0'}}>
                        <SceneVue s={p.scenes[i]} c={ctxDe(i, a, b)} />
                      </div>
                    </Sequence>
                  );
                })}
                <AbsoluteFill style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 40%)'}} />
              </div>
              {corpsDouble}
            </AbsoluteFill>
          ) : null}
          {/* Illustrations : en haut (partage) ou en plein écran (plein). */}
          {segs.map(({i, a, b, mise: m}, k) => {
            const s = p.scenes[i];
            if (b <= a || m === 'double') return null;
            const sens = k % 3;
            if (m === 'plein') {
              const photo = PLEIN_NATIF.includes(s.type);
              return (
                <Sequence key={k} from={a} durationInFrames={b - a}>
                  <Entree sens={sens} hauteur={1920}>
                    <FondScene s={s} nom={p.fonds[i] ?? 'bleu'} graine={i} h={1920} />
                    {photo ? <SceneVue s={s} c={ctxDe(i, a, b, 1920)} /> : (
                      <PleinEcran>
                        <SceneVue s={s} c={ctxDe(i, a, b)} />
                      </PleinEcran>
                    )}
                  </Entree>
                </Sequence>
              );
            }
            return (
              <Sequence key={k} from={a} durationInFrames={b - a}>
                <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: HAUT, overflow: 'hidden'}}>
                  <Entree sens={sens}>
                    <FondScene s={s} nom={p.fonds[i] ?? 'bleu'} graine={i} />
                    <SceneVue s={s} c={ctxDe(i, a, b)} />
                  </Entree>
                </div>
              </Sequence>
            );
          })}
          {mise === 'partage' ? (
            <>
              {/* Bandeau des sous-titres et liserés. */}
              <div style={{position: 'absolute', left: 0, right: 0, top: HAUT, height: BANDEAU,
                background: 'linear-gradient(180deg, rgba(6,8,22,0.92), rgba(6,8,22,0.8))'}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: HAUT - 4, height: 8,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.2), #fff, rgba(255,255,255,0.2))', boxShadow: '0 0 24px rgba(255,255,255,0.8)'}} />
            </>
          ) : (
            /* Léger dégradé sombre sous les sous-titres hors écran partagé. */
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(2,6,30,0.55) 82%, rgba(2,6,30,0.2) 100%)'}} />
          )}
        </AbsoluteFill>
        {p.titre ? <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: HAUT, overflow: 'hidden'}}>
          <OuvertureAuto lignes={p.titre.lignes} cle={p.titre.cle} /></div> : null}
        <SousTitresMot mots={p.motsFrames} masques={p.titre ? [[0, FIN_TITRE_GEANT], ...p.masques] : p.masques}
          partages={partages} />
        {eclair > 0 ? <AbsoluteFill style={{background: '#fff', opacity: eclair}} /> : null}
        {/* Logo Lomé IA School pendant toute la vidéo (zone sûre : sous les 10 % du haut, à gauche). */}
        {(!p.carton || f < p.carton.debut) && p.marque !== 'zeroperte' ? <LogoCoin /> : null}
        {p.marque === 'zeroperte' && f >= (p.logoDes ?? 0) && (!p.carton || f < p.carton.debut) ? <LogoCoinZP /> : null}
        {p.carton ? (
          <Sequence from={p.carton.debut}>
            {p.marque === 'zeroperte' ? <CartonZeroPerte /> : <CartonFinAuto whatsapp={p.carton.whatsapp ?? '+228 72 24 02 31'} />}
          </Sequence>
        ) : null}
        {/* Flash blanc léger à l'impact d'ouverture. */}
        {f < 2 ? <AbsoluteFill style={{background: '#fff', opacity: f === 0 ? 0.6 : 0.3}} /> : null}
      </AbsoluteFill>
    </EmojiCtx.Provider>
  );
};

// Mise en page de chaque scène : celle du plan ("mise") si elle est valable, sinon d'après le type ; puis règles de
// rythme : écran partagé pendant l'ouverture (titre géant), jamais 3 fois de suite la même mise, le double en grand au
// moins toutes les 20 s, les photos en plein écran.
type Mise = 'partage' | 'plein' | 'double';
const misesAuto = (scenes: Scene[], bornes: number[][]): Mise[] => {
  const parType = (s: Scene, i: number): Mise => {
    if (s.type === 'photo') return 'plein';
    if (['numero', 'alerte', 'question', 'carte', 'final'].includes(s.type)) return i % 2 ? 'double' : 'plein';
    if (['demo', 'reponseIA', 'prompt', 'outil', 'telephone'].includes(s.type)) return i % 2 ? 'plein' : 'partage';
    return 'partage';
  };
  const res: Mise[] = [];
  let dernierDouble = 0;
  scenes.forEach((s, i) => {
    const a = bornes[i]?.[0] ?? 0;
    let m: Mise = (['partage', 'plein', 'double'] as Mise[]).includes(s.mise as Mise) ? (s.mise as Mise) : parType(s, i);
    if (a < S(5)) m = 'partage';
    else {
      if (i >= 2 && res[i - 1] === m && res[i - 2] === m) m = m === 'double' ? (s.type === 'photo' ? 'plein' : 'partage') : 'double';
      if (a - dernierDouble > S(20) && s.type !== 'photo') m = 'double';
    }
    if (m === 'double' || m === 'partage') dernierDouble = a;
    res.push(m);
  });
  return res;
};

// Logo discret de l'école, en haut à gauche, toute la vidéo (même rendu que la série animée).
const LogoCoin: React.FC = () => (
  <div style={{position: 'absolute', left: 40, top: 205, width: 112, height: 112, borderRadius: 24, overflow: 'hidden',
    opacity: 0.95, boxShadow: `0 0 0 3px ${OR}66, 0 8px 24px rgba(0,0,0,0.55)`}}>
    <Img src={staticFile('test-auto/marque/logo.jpg')} style={{width: '100%', height: '100%'}} />
  </div>
);

// Carton de fin habituel (4 s) : logo qui flotte, « ABONNE-TOI • LIKE • PARTAGE », « Consultation gratuite »,
// « Lien dans la bio », WhatsApp ; étoiles qui tournent, aucun élément figé.
const CartonFinAuto: React.FC<{whatsapp: string}> = ({whatsapp}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const entree = interpolate(f, [0, 8], [0, 1], clamp);
  const respire = 1 + 0.04 * Math.sin(t * 4.4);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + Math.sin(t * 1.3) * 12}% ${38 + Math.cos(t * 1.1) * 8}%, #1b1f63 0%, #020629 68%)`,
      opacity: entree}}>
      {[[160, 300, 64, OR], [900, 380, 48, '#8B5CF6'], [130, 1330, 44, '#8B5CF6'], [910, 1260, 60, OR]].map(([x, y, tl, c], i) => (
        <div key={i} style={{position: 'absolute', left: x as number, top: y as number, fontSize: tl as number, color: c as string,
          transform: `rotate(${t * 40 + i * 30}deg) scale(${pop(f, 9 + i * 3)})`}}>✦</div>
      ))}
      <Img src={staticFile('test-auto/marque/logo.jpg')} style={{position: 'absolute', left: CX - 210, top: 270, width: 420, height: 420,
        borderRadius: 60, boxShadow: `0 0 60px ${OR}55`, transform: `translateY(${Math.sin(t * 2.2) * 16}px) rotate(${Math.sin(t * 1.7) * 3}deg) scale(${pop(f, 3, 200)})`}} />
      <Gros texte={'ABONNE-TOI\nLIKE • PARTAGE'} y={740} max={92} k={pop(f, 14) * respire} />
      <Gros texte={'Consultation\ngratuite'} y={960} max={74} couleur={OR} k={pop(f, 24)} />
      <div style={{position: 'absolute', left: CX - 330, width: 660, top: 1145, display: 'flex', justifyContent: 'center',
        transform: `scale(${pop(f, 32) * (1 + 0.05 * Math.sin(t * 6))})`}}>
        <div style={{background: '#fff', color: '#020629', borderRadius: 999, padding: '16px 40px', fontFamily: POLICE,
          fontWeight: 900, fontSize: 52, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 6)}px ${OR}`}}>Lien dans la bio ↓</div>
      </div>
      <Gros texte={`WhatsApp\n${whatsapp}`} y={1265} max={58} k={pop(f, 40)} />
    </AbsoluteFill>
  );
};

// Plans : une phrase longue (plus de 7 s) est coupée en plans de 3,5 s au moins qui changent de mise en page
// (ex. illustration en plein écran puis le double en présentateur), pour qu'aucune image ne reste figée.
type Plan = {i: number; a: number; b: number; mise: Mise};
const plans = (scenes: Scene[], bornes: number[][], mises: Mise[]): Plan[] => {
  const res: Plan[] = [];
  scenes.forEach((s, i) => {
    const [a, b] = bornes[i] ?? [0, 0];
    const m = mises[i] ?? 'partage';
    const n = b - a > S(7) && a >= S(5) ? Math.min(3, Math.floor((b - a) / S(3.5))) : 1;
    const autre: Mise = m === 'double' ? (s.type === 'photo' ? 'plein' : 'plein') : 'double';
    for (let k = 0; k < n; k++) {
      res.push({i, a: Math.round(a + ((b - a) * k) / n), b: Math.round(a + ((b - a) * (k + 1)) / n), mise: k % 2 ? autre : m});
    }
  });
  return res;
};

// Illustration du panneau (1080 × 900) posée au centre de l'écran entier, avec une lente poussée de caméra.
const PleinEcran: React.FC<React.PropsWithChildren> = ({children}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, top: 330, width: 1080, height: HAUT,
      transform: `scale(${1.14 + 0.05 * Math.min(1, f / 150)})`, transformOrigin: '500px 450px'}}>{children}</div>
  );
};

// Ouverture (modèle habituel) : titre d'accroche géant de 3 lignes qui claquent une à une (toutes les 5 images,
// étirement vertical qui se pose en 4 images), mot-clé en noir sur bloc jaune ; à 2,5 s il rétrécit et monte dans un
// bandeau en haut jusqu'à 5 s. Sous-titres masqués tant qu'il est géant.
export const FIN_TITRE_GEANT = S(2.5) + 12;
const OuvertureAuto: React.FC<{lignes: string[]; cle?: string}> = ({lignes, cle}) => {
  const f = useCurrentFrame();
  if (f >= S(5)) return null;
  const norm = (m: string) => m.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const cles = new Set((cle ?? '').split(' ').map(norm).filter(Boolean));
  const LARG = 840;
  const tailles = lignes.map((l) => Math.min(230, fitText({text: l.toUpperCase(), withinWidth: LARG - 40, fontFamily: POLICE,
    fontWeight: '900'}).fontSize));
  let total = tailles.reduce((h, x) => h + x * 1.08, 0);
  const red = Math.min(1, 640 / total);
  total *= red;
  const haut0 = 215 + (660 - total) / 2;
  const p = interpolate(f, [S(2.5), S(2.5) + 12], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ech = 1 - 0.58 * p;
  const dy = (200 - haut0) * p;
  const sortie = interpolate(f, [S(5) - 8, S(5)], [1, 0], clamp);
  let y = 0;
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1F2D8F 0%, #0A0F33 70%)', opacity: 1 - p, height: HAUT}} />
      <div style={{position: 'absolute', left: CX - LARG / 2, width: LARG, top: haut0, height: total, opacity: sortie,
        transform: `translateY(${dy}px) scale(${ech})`, transformOrigin: '50% 0%', borderRadius: 40,
        background: `rgba(8,10,30,${0.75 * p})`, borderBottom: `${Math.round(14 * p)}px solid rgba(255,200,61,${p})`}}>
        {lignes.map((l, i) => {
          const taille = tailles[i] * red;
          const local = f - i * 5;
          const top = y;
          y += taille * 1.08;
          if (local < 0) return null;
          const etire = interpolate(local, [0, 4], [1.25, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div key={i} style={{position: 'absolute', left: 0, width: LARG, top, height: taille * 1.08, display: 'flex',
              justifyContent: 'center', alignItems: 'center', gap: taille * 0.26, transform: `scaleY(${etire})`,
              transformOrigin: '50% 0%'}}>
              {l.toUpperCase().split(' ').map((m, j) => {
                const estCle = cles.has(norm(m));
                return (
                  <span key={j} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1,
                    color: estCle ? '#0B0F2E' : BLANC, background: estCle ? OR : 'transparent',
                    padding: estCle ? `0 ${taille * 0.12}px` : 0, borderRadius: estCle ? taille * 0.12 : 0,
                    WebkitTextStroke: estCle ? '0px' : `${Math.round(taille * 0.16)}px #0B0F2E`, paintOrder: 'stroke fill',
                    filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.5))', whiteSpace: 'nowrap'}}>{m}</span>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Coup de zoom d'ouverture sur le double (35 % → cadre normal en 12 images, recul linéaire, tremblement amorti),
// puis changement de cadrage toutes les 1,5 s pendant les 5 premières secondes.
const zoomDouble = (f: number) => {
  if (f < 12) {
    const z = 1.35 - (0.35 * f) / 12;
    const tremble = 14 * (1 - f / 12) * Math.sin(f * 2.3);
    return {z, x: tremble, y: tremble * 0.6};
  }
  const pas = [S(1.5), S(3), S(4.5), S(5.5)];
  const cibles = [1, 1.09, 1, 1.09, 1];
  let z = 1;
  pas.forEach((a, i) => {
    z += (cibles[i + 1] - cibles[i]) * interpolate(f, [a, a + 4], [0, 1], clamp);
  });
  return {z, x: 0, y: 0};
};

// Entrée de chaque scène : glissement, coup de zoom ou bascule (en rotation), 7 images.
const Entree: React.FC<React.PropsWithChildren<{sens: number; hauteur?: number}>> = ({sens, hauteur = HAUT, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const tr = sens === 0 ? `translateX(${(1 - p) * 1080}px)` : sens === 1 ? `scale(${1.25 - 0.25 * p})` : `translateY(${(1 - p) * -hauteur}px)`;
  return <AbsoluteFill style={{transform: tr, opacity: sens === 1 ? p : 1}}>{children}</AbsoluteFill>;
};

// ======================================================================================================
// Pub Zéro Perte : scènes propres à la publicité (démonstration de l'appli, logo, appareils, contact, carton).
// ======================================================================================================
const PLEIN_NATIF = ['photo', 'app', 'logo', 'appareils', 'contact'];
const ZP_VERT = '#22C55E';
const ZP_VERT_FONCE = '#15803D';
const ZP_NUIT = '#0B1530';
const REC = {l: 824, h: 1830}; // enregistrement d'écran du téléphone de Joseph
const lisse = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

// Logo Zéro Perte : pastille verte (pièce barrée d'une coche) + « ZÉRO PERTE ».
const PastilleZP: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 200 200">
    <defs>
      <linearGradient id="zpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4ADE80" /><stop offset="1" stopColor={ZP_VERT_FONCE} /></linearGradient>
    </defs>
    <rect x="6" y="6" width="188" height="188" rx="46" fill="url(#zpg)" stroke="#fff" strokeWidth="8" />
    <circle cx="100" cy="100" r="58" fill="none" stroke="#fff" strokeWidth="20" />
    <path d="M70 102 L92 124 L134 78" fill="none" stroke="#FFD43B" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MotZP: React.FC<{taille: number}> = ({taille}) => (
  <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1, whiteSpace: 'nowrap',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'}}>
    <span style={{color: '#fff', WebkitTextStroke: `${Math.round(taille * 0.12)}px ${ZP_NUIT}`, paintOrder: 'stroke fill'}}>ZÉRO </span>
    <span style={{color: ZP_VERT, WebkitTextStroke: `${Math.round(taille * 0.12)}px ${ZP_NUIT}`, paintOrder: 'stroke fill'}}>PERTE</span>
  </div>
);

// Téléphone qui joue l'enregistrement d'écran ; la caméra se cale sur une zone (cadres) à chaque mot donné,
// repères lumineux autour des éléments importants, étiquettes qui claquent sur leur mot.
const SceneApp: React.FC<{s: Scene; c: Ctx}> = ({s, c}) => {
  const f = useCurrentFrame();
  const h = c.h ?? HAUT;
  const plein = h > HAUT;
  const quand = (m?: string) => (m ? c.motA(m) : 0);
  // Cadrage : interpolation douce d'un cadre au suivant (10 images).
  const cadres = (s.cadres?.length ? s.cadres : [{y: REC.h / 2, e: plein ? 0.56 : 0.5}]).map((k) => ({...k, t: quand(k.a)}));
  let cx = cadres[0].x ?? REC.l / 2;
  let cy = cadres[0].y;
  let e = cadres[0].e;
  for (let i = 1; i < cadres.length; i++) {
    const p = lisse(f, cadres[i].t - 3, 12);
    cx += ((cadres[i].x ?? REC.l / 2) - cx) * p;
    cy += (cadres[i].y - cy) * p;
    e += (cadres[i].e - e) * p;
  }
  e *= 1 + 0.025 * Math.min(1, f / 120); // lente poussée
  const centreY = plein ? 760 : h / 2;
  const entree = interpolate(f, [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const rot = (1 - entree) * 28 + Math.sin(f / 40) * 1.2;
  const tx = CX - cx * e;
  const ty = centreY - cy * e + (1 - entree) * 400;
  const clips = (s.clips ?? []).map((k) => ({...k, t: quand(k.a)}));
  const bord = 34;
  return (
    <AbsoluteFill style={{perspective: 2200}}>
      <AbsoluteFill style={{background: plein ? 'radial-gradient(circle at 50% 40%, rgba(34,197,94,0.25), rgba(0,0,0,0) 60%)' : undefined}} />
      <div style={{position: 'absolute', left: tx, top: ty, width: REC.l * e, height: REC.h * e,
        transform: `rotateY(${rot}deg) rotateX(${(1 - entree) * 10}deg)`, transformOrigin: '50% 30%'}}>
        <div style={{position: 'absolute', left: -bord * e, top: -bord * e, width: (REC.l + 2 * bord) * e, height: (REC.h + 2 * bord) * e,
          borderRadius: 110 * e, background: 'linear-gradient(145deg, #3A4256, #0B0F1A 45%, #2B3242)',
          boxShadow: `0 ${50 * e}px ${120 * e}px rgba(0,0,0,0.65), 0 0 0 ${4 * e}px #5B6478 inset`}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: REC.l * e, height: REC.h * e, borderRadius: 80 * e,
          overflow: 'hidden', background: '#0A1022'}}>
          {clips.map((k, i) => {
            const debut = Math.max(0, k.t);
            const fin = i + 1 < clips.length ? Math.max(debut + 1, clips[i + 1].t) : 100000;
            return (
              <Sequence key={i} from={debut} durationInFrames={fin - debut} layout="none">
                <OffthreadVideo src={staticFile(k.fichier)} muted trimBefore={Math.round(k.de * FPS)}
                  playbackRate={k.vitesse ?? 1} style={{width: REC.l * e, height: REC.h * e, display: 'block'}} />
                {i > 0 ? <AbsoluteFill style={{background: '#fff', opacity: interpolate(f - debut, [0, 4], [0.5, 0], clamp)}} /> : null}
              </Sequence>
            );
          })}
          <AbsoluteFill style={{background: 'linear-gradient(125deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 35%)'}} />
        </div>
        {/* Repères : cadre lumineux qui se dessine autour de l'élément montré. */}
        {(s.reperes ?? []).map((r, i) => {
          const a = quand(r.a);
          const z = r.jusqua ? quand(r.jusqua) : 100000;
          if (f < a || f >= z) return null;
          const k = pop(f, a, 260, 11);
          const coul = r.couleur ?? '#FFD43B';
          const pulse = 0.6 + 0.4 * Math.sin((f - a) / 4);
          return (
            <div key={i} style={{position: 'absolute', left: (r.x - 14) * e, top: (r.y - 14) * e, width: (r.l + 28) * e,
              height: (r.h + 28) * e, borderRadius: 26 * e, border: `${Math.max(6, 10 * e)}px solid ${coul}`,
              boxShadow: `0 0 ${30 * pulse}px ${coul}, inset 0 0 ${20 * pulse}px ${coul}66`, transform: `scale(${1.25 - 0.25 * Math.min(1, k)})`,
              opacity: Math.min(1, k)}} />
          );
        })}
      </div>
      {(s.badges ?? []).map((b, i) => {
        const a = quand(b.a);
        const z = b.jusqua ? quand(b.jusqua) : 100000;
        if (f < a || f >= z) return null;
        const k = pop(f, a, 280, 10);
        const y = b.y ?? (plein ? 1090 : 690);
        const coul = b.couleur ?? ZP_VERT;
        return (
          <div key={i} style={{position: 'absolute', left: CX - 440, width: 880, top: y, display: 'flex', justifyContent: 'center',
            transform: `scale(${k}) rotate(${-2 + Math.sin((f - a) / 9)}deg)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, background: coul, border: '7px solid #fff', borderRadius: 34,
              padding: '14px 34px', boxShadow: '0 18px 36px rgba(0,0,0,0.5)', fontFamily: POLICE, fontWeight: 900, fontSize: 60,
              color: coul === '#FFD43B' || coul === OR ? '#14141F' : '#fff', whiteSpace: 'nowrap', letterSpacing: 0.5}}>
              {b.emoji ? <span style={{fontSize: 62}}>{b.emoji}</span> : null}{b.texte}
            </div>
          </div>
        );
      })}
      {s.emoji ? <Emoji code={s.emoji} x={plein ? 860 : 880} y={plein ? 330 : 190} taille={plein ? 210 : 160} a={quand(s.a as string | undefined) + 6} /> : null}
    </AbsoluteFill>
  );
};

// Révélation du nom : éclair, rayons qui tournent, pastille qui tombe et rebondit, nom qui claque, slogan.
const SceneLogo: React.FC<{c: Ctx}> = ({c}) => {
  const f = useCurrentFrame();
  const h = c.h ?? HAUT;
  const plein = h > HAUT;
  const cy = plein ? 640 : 400;
  const k = pop(f, 2, 240, 9);
  const km = pop(f, 9, 260, 10);
  const ks = pop(f, c.motA('Zéro') + 4, 200, 12);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${cy / (plein ? 19.2 : 9)}%, #1E7A45 0%, #0B3D24 35%, ${ZP_NUIT} 75%)`}}>
      <svg width={1080} height={h} style={{position: 'absolute'}}>
        <g transform={`translate(${CX} ${cy}) rotate(${f * 1.2})`} opacity={0.22 * Math.min(1, k)}>
          {Array.from({length: 16}).map((_, i) => <path key={i} d="M 0 0 L -70 -1400 L 70 -1400 Z" fill="#fff" transform={`rotate(${i * 22.5})`} />)}
        </g>
      </svg>
      <div style={{position: 'absolute', left: CX - 190, top: cy - 300, transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -30}deg)`,
        filter: `drop-shadow(0 0 ${40 + 20 * Math.sin(f / 6)}px rgba(74,222,128,0.8))`}}><PastilleZP taille={380} /></div>
      <div style={{position: 'absolute', left: 0, width: 1000, top: cy + 120, display: 'flex', justifyContent: 'center',
        transform: `scale(${km})`}}><MotZP taille={150} /></div>
      {plein ? (
        <div style={{position: 'absolute', left: CX - 420, width: 840, top: cy + 330, textAlign: 'center', transform: `scale(${ks})`,
          fontFamily: POLICE, fontWeight: 900, fontSize: 52, color: '#FFD43B', lineHeight: 1.15,
          WebkitTextStroke: `7px ${ZP_NUIT}`, paintOrder: 'stroke fill'}}>L'APPLI QUI PROTÈGE<br />VOTRE ARGENT</div>
      ) : null}
      <Confettis f={f} a={6} />
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.85, 0], clamp)}} />
    </AbsoluteFill>
  );
};

const Confettis: React.FC<{f: number; a: number; x?: number; y?: number}> = ({f, a, x = CX, y = 600}) => {
  if (f < a) return null;
  const u = f - a;
  const couleurs = ['#FFD43B', '#4ADE80', '#38BDF8', '#fff', '#F472B6', '#FB923C'];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 46}).map((_, i) => {
        const ang = (i / 46) * Math.PI * 2 + Math.sin(i * 7.3) * 0.4;
        const v = 16 + ((i * 37) % 14);
        const px = x + Math.cos(ang) * v * u * 0.9;
        const py = y + Math.sin(ang) * v * u * 0.9 + 0.6 * u * u;
        return <rect key={i} x={px - 14} y={py - 7} width={28} height={14} rx={4} fill={couleurs[i % couleurs.length]}
          opacity={Math.max(0, 1 - u / 45)} transform={`rotate(${u * (8 + (i % 5) * 4)} ${px} ${py})`} />;
      })}
    </svg>
  );
};

// Téléphone, tablette et ordinateur qui arrivent l'un après l'autre (vrais écrans de l'appli), et « SANS INTERNET ».
const SceneAppareils: React.FC<{s: Scene; c: Ctx}> = ({s, c}) => {
  const f = useCurrentFrame();
  const h = c.h ?? HAUT;
  const plein = h > HAUT;
  const y0 = plein ? 360 : 150;
  const ech = plein ? 1 : 0.72;
  const [m1 = '', m2 = '', m3 = '', m4 = ''] = (s.a as string[] | undefined) ?? [];
  const kInt = pop(f, c.motA(m1), 240, 10);
  const kTel = pop(f, c.motA(m2) - 2, 220, 11);
  const kTab = pop(f, c.motA(m3) - 2, 220, 11);
  const kPc = pop(f, c.motA(m4) - 2, 220, 11);
  const ecran = (src: string, de: number, l: number, hh: number) => (
    <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(de * FPS)} style={{width: l, height: hh, objectFit: 'cover', display: 'block'}} />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: y0, width: 1000, height: 900, transform: `scale(${ech})`, transformOrigin: '500px 0'}}>
        {/* Ordinateur portable */}
        <div style={{position: 'absolute', left: 150, top: 120, width: 700, transform: `scale(${kPc})`, transformOrigin: '50% 100%'}}>
          <div style={{width: 700, height: 410, background: '#111827', borderRadius: '24px 24px 0 0', padding: 16, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
            <div style={{width: 668, height: 378, overflow: 'hidden', borderRadius: 6}}>{ecran('test-auto/app/pc.mp4', 0.5, 668, 378)}</div>
          </div>
          <div style={{width: 820, marginLeft: -60, height: 34, background: 'linear-gradient(#D1D5DB, #9CA3AF)', borderRadius: '0 0 30px 30px'}} />
        </div>
        {/* Tablette */}
        <div style={{position: 'absolute', left: 20, top: 330, width: 330, height: 470, background: '#1F2937', borderRadius: 34, padding: 16,
          transform: `scale(${kTab}) rotate(-6deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.55)'}}>
          <div style={{width: 298, height: 438, overflow: 'hidden', borderRadius: 18}}>{ecran('test-auto/app/06_benefice.mp4', 3, 298, 662)}</div>
        </div>
        {/* Téléphone */}
        <div style={{position: 'absolute', left: 700, top: 340, width: 230, height: 490, background: '#0B0F1A', borderRadius: 40, padding: 11,
          transform: `scale(${kTel}) rotate(7deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.55)'}}>
          <div style={{width: 208, height: 468, overflow: 'hidden', borderRadius: 30}}>{ecran('test-auto/app/02_vendre.mp4', 12, 208, 462)}</div>
        </div>
      </div>
      {/* Wi-Fi barré + SANS INTERNET */}
      <div style={{position: 'absolute', left: 0, width: 1000, top: plein ? 180 : 40, display: 'flex', justifyContent: 'center',
        transform: `scale(${kInt})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 999, padding: '14px 40px 14px 24px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.45)'}}>
          <svg width={92} height={92} viewBox="0 0 100 100">
            <path d="M10 40 Q50 5 90 40" stroke="#1F2937" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M24 56 Q50 32 76 56" stroke="#1F2937" strokeWidth={10} fill="none" strokeLinecap="round" />
            <circle cx={50} cy={74} r={9} fill="#1F2937" />
            <line x1={14} y1={14} x2={86} y2={86} stroke="#EF4444" strokeWidth={12} strokeLinecap="round" />
          </svg>
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: plein ? 76 : 60, color: ZP_NUIT}}>SANS INTERNET</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Contact : bulle WhatsApp verte, numéro qui s'écrit chiffre par chiffre, second numéro, « Joseph Ahiankonou ».
const SceneContact: React.FC<{s: Scene; c: Ctx}> = ({s, c}) => {
  const f = useCurrentFrame();
  const h = c.h ?? HAUT;
  const plein = h > HAUT;
  const [n1 = '', n2 = ''] = s.numeros ?? [];
  const a = c.motA((s.a as string) ?? '');
  const visibles = Math.max(0, Math.floor((f - a) / 1.5));
  const y = plein ? 330 : 120;
  const k = pop(f, 0, 220, 10);
  const pulse = 1 + 0.04 * Math.sin(f / 4);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: CX - 150, top: y, width: 300, height: 300, transform: `scale(${k * pulse})`}}>
        <div style={{width: 300, height: 300, borderRadius: 150, background: '#25D366', border: '12px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${50 + 30 * Math.sin(f / 4)}px rgba(37,211,102,0.8)`}}>
          <svg width={170} height={170} viewBox="0 0 100 100">
            <path d="M30 18 C24 18 18 26 20 36 C24 56 44 76 64 80 C74 82 82 76 82 70 L82 62 L66 56 L60 64 C50 60 40 50 36 40 L44 34 L38 18 Z" fill="#fff" />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: CX - 230, top: y + 330, width: 460, textAlign: 'center', transform: `scale(${pop(f, 5)})`,
        fontFamily: POLICE, fontWeight: 900, fontSize: 56, color: '#fff', WebkitTextStroke: `8px ${ZP_NUIT}`, paintOrder: 'stroke fill'}}>WhatsApp / Appel</div>
      <div style={{position: 'absolute', left: CX - 460, width: 920, top: y + 430, textAlign: 'center', fontFamily: POLICE, fontWeight: 900,
        fontSize: 118, color: '#1E5BFF', WebkitTextStroke: '22px #fff', paintOrder: 'stroke fill', whiteSpace: 'pre',
        filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))'}}>
        {n1.split('').map((ch, i) => <span key={i} style={{opacity: i < visibles ? 1 : 0}}>{ch}</span>)}
      </div>
      {n2 ? <div style={{position: 'absolute', left: CX - 460, width: 920, top: y + 590, textAlign: 'center', fontFamily: POLICE, fontWeight: 900,
        fontSize: 70, color: '#fff', WebkitTextStroke: `10px ${ZP_NUIT}`, paintOrder: 'stroke fill', transform: `scale(${pop(f, a + 26)})`}}>ou {n2}</div> : null}
    </AbsoluteFill>
  );
};

// Logo discret en haut à gauche pendant la pub (après la révélation du nom).
export const LogoCoinZP: React.FC = () => (
  <div style={{position: 'absolute', left: 40, top: 205, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.95,
    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))'}}>
    <PastilleZP taille={92} />
  </div>
);

// Carton de fin Zéro Perte (fond vert nuit, pastille, nom, slogan, numéros, « Payez une seule fois »).
const CartonZeroPerte: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + Math.sin(t * 1.3) * 10}% ${32 + Math.cos(t * 1.1) * 6}%, #166534 0%, #0B2A1C 40%, ${ZP_NUIT} 80%)`,
      opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
      <div style={{position: 'absolute', left: CX - 150, top: 250, transform: `translateY(${Math.sin(t * 2.2) * 12}px) scale(${pop(f, 2, 200)})`,
        filter: 'drop-shadow(0 0 40px rgba(74,222,128,0.7))'}}><PastilleZP taille={300} /></div>
      <div style={{position: 'absolute', left: 0, width: 1000, top: 590, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, 8)})`}}>
        <MotZP taille={140} />
      </div>
      <Gros texte={'Votre boutique sous contrôle,\nmême quand vous n\'êtes pas là.'} y={770} max={50} couleur="#FFD43B" k={pop(f, 14)} />
      <div style={{position: 'absolute', left: CX - 400, width: 800, top: 935, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, 20)})`}}>
        <div style={{background: '#25D366', color: '#fff', borderRadius: 999, padding: '14px 40px', fontFamily: POLICE, fontWeight: 900, fontSize: 50,
          border: '6px solid #fff', boxShadow: `0 0 ${24 + 16 * Math.sin(t * 6)}px rgba(37,211,102,0.9)`}}>WhatsApp / Appel</div>
      </div>
      <Gros texte={'+228 72 24 02 31\n+228 79 16 23 90'} y={1060} max={80} k={pop(f, 26)} />
      <Gros texte={'Payez une seule fois • Sans abonnement'} y={1300} max={44} couleur="#86EFAC" k={pop(f, 34)} />
      <Gros texte={'Joseph Ahiankonou, créateur de Zéro Perte'} y={1380} max={36} k={pop(f, 40)} />
    </AbsoluteFill>
  );
};

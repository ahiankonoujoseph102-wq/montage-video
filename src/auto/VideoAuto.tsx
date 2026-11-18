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
  titre?: string; items?: {texte: string; a: string}[]; lignes?: string[]; geste?: string; doigts?: number;
  expression?: string; outil?: string; outils?: OutilScene[]; prompt?: string; reponse?: string; logo?: boolean; mise?: string; nom?: string; note?: string; fichier?: string; credit?: string; recherche?: string};
export type OutilScene = {id: string; nom: string; site: string; logo: boolean; capture: boolean};
export type MotAuto = {t: string; ph: number; a: number; b: number};
export type AutoProps = {duree: number; phrases: {a: number; b: number}[]; mots: MotAuto[]; motsFrames: Mot[];
  masques: [number, number][]; visemes: string; bouche: number[]; scenes: Scene[]; fonds: string[]; emojis: string[];
  decalageDouble: number; titre?: {lignes: string[]; cle?: string}; logos?: Record<string, {nom: string; couleur: string}>};

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

// Instant (image, relative à la scène) où un mot de la phrase est dit.
type Ctx = {debut: number; fin: number; motA: (m: string) => number; h?: number};

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
                <Marque ok k={pop(f, a, 260)} taille={n > 4 ? 62 : 74} />
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
      // Photo ou vidéo libre de droits (Pexels ou domaine public / CC0), lent zoom ; source dans sources.json.
      const z = interpolate(f, [0, Math.max(1, duree)], [1.02, 1.14], clamp);
      const h = c.h ?? HAUT;
      const style: React.CSSProperties = {width: 1080, height: h, objectFit: 'cover', transform: `scale(${z})`};
      const src = staticFile(s.fichier ?? '');
      return (
        <>
          <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
            {(s.fichier ?? '').endsWith('.mp4') ? <OffthreadVideo src={src} muted style={style} /> : <Img src={src} style={style} />}
          </AbsoluteFill>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
          {s.texte ? <Gros texte={s.texte} y={h > HAUT ? 1010 : 650} max={h > HAUT ? 130 : 110} k={pop(f, 6)} /> : null}
          {s.credit ? <div style={{position: 'absolute', right: 150, top: h - 40 - (h > HAUT ? 330 : 0), fontFamily: POLICE, fontWeight: 600, fontSize: 20,
            color: 'rgba(255,255,255,0.75)'}}>{s.credit}</div> : null}
        </>
      );
    }
    case 'final':
      return (
        <>
          <Gros texte={(s.lignes ?? [])[0] ?? ''} y={300} max={130} k={k} couleur={OR} />
          {(s.lignes ?? []).slice(1).map((l, i) => <Gros key={i} texte={l} y={500 + i * 90} max={62} k={pop(f, 8 + i * 6)} />)}
          <Emoji code="2728" x={850} y={760} taille={170} a={10} />
        </>
      );
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
  const ctxDe = (i: number, a: number, b: number, h?: number): Ctx => ({debut: a, fin: b, h, motA: (m) => {
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
                      <Fond nom={p.fonds[i] ?? 'bleu'} graine={i} />
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
              const photo = s.type === 'photo';
              return (
                <Sequence key={k} from={a} durationInFrames={b - a}>
                  <Entree sens={sens} hauteur={1920}>
                    <Fond nom={p.fonds[i] ?? 'bleu'} graine={i} h={1920} />
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
                    <Fond nom={p.fonds[i] ?? 'bleu'} graine={i} />
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

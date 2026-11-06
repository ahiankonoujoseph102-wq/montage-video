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
  expression?: string; outil?: string; fichier?: string; credit?: string; recherche?: string};
export type MotAuto = {t: string; ph: number; a: number; b: number};
export type AutoProps = {duree: number; phrases: {a: number; b: number}[]; mots: MotAuto[]; motsFrames: Mot[];
  masques: [number, number][]; visemes: string; bouche: number[]; scenes: Scene[]; fonds: string[]; emojis: string[];
  decalageDouble: number};

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
  const lignes = texte.split('\n');
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
type Ctx = {debut: number; fin: number; motA: (m: string) => number};

const SceneVue: React.FC<{s: Scene; c: Ctx}> = ({s, c}) => {
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
            const y = 360 + i * (440 / Math.max(3, (s.items ?? []).length));
            return (
              <div key={i} style={{position: 'absolute', left: 130, top: y, width: 740, height: 110, borderRadius: 30,
                background: '#fff', display: 'flex', alignItems: 'center', gap: 28, padding: '0 30px',
                transform: `translateX(${(1 - Math.min(1, ki)) * 600}px)`, opacity: ki > 0 ? 1 : 0,
                boxShadow: '0 14px 28px rgba(0,0,0,0.35)'}}>
                <Marque ok k={pop(f, a, 260)} taille={74} />
                <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 56, color: '#1B1B2F'}}>{it.texte}</div>
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
      // Vraie capture de la page publique de l'outil (projets/outils/), nom écrit en texte, sans affiliation.
      const noms: Record<string, [string, string]> = {chatgpt: ['ChatGPT', 'chatgpt.com'], claude: ['Claude', 'claude.ai'],
        gemini: ['Gemini', 'gemini.google.com'], perplexity: ['Perplexity', 'perplexity.ai']};
      const [nom, site] = noms[s.outil ?? ''] ?? [s.outil ?? '', ''];
      const kc = pop(f, 3, 200, 12);
      return (
        <>
          <Kicker texte={nom.toUpperCase()} y={215} k={k} />
          <div style={{position: 'absolute', left: 90, top: 320, width: 900, height: 540, borderRadius: 28, overflow: 'hidden',
            background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `scale(${0.6 + 0.4 * kc}) rotate(${(1 - kc) * -4}deg)`,
            opacity: kc > 0 ? 1 : 0}}>
            <div style={{height: 56, background: '#E9EBF2', display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px'}}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
              <div style={{marginLeft: 14, flex: 1, height: 36, borderRadius: 18, background: '#fff', fontFamily: POLICE,
                fontWeight: 700, fontSize: 24, color: '#444', display: 'flex', alignItems: 'center', padding: '0 18px'}}>{site}</div>
            </div>
            <Img src={staticFile(`test-auto/outils/${s.outil}.png`)} style={{width: 900, height: 484, objectFit: 'cover',
              objectPosition: 'top', transform: `scale(${interpolate(f, [0, Math.max(1, duree)], [1, 1.06], clamp)})`,
              transformOrigin: 'top center'}} />
          </div>
          <Emoji code={s.emoji} x={900} y={330} taille={150} a={10} />
        </>
      );
    }
    case 'photo': {
      // Photo ou vidéo libre de droits (Pexels ou domaine public / CC0), lent zoom ; source dans sources.json.
      const z = interpolate(f, [0, Math.max(1, duree)], [1.02, 1.14], clamp);
      const style: React.CSSProperties = {width: 1080, height: HAUT, objectFit: 'cover', transform: `scale(${z})`};
      const src = staticFile(s.fichier ?? '');
      return (
        <>
          <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], clamp)}}>
            {(s.fichier ?? '').endsWith('.mp4') ? <OffthreadVideo src={src} muted style={style} /> : <Img src={src} style={style} />}
          </AbsoluteFill>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
          {s.texte ? <Gros texte={s.texte} y={650} max={110} k={pop(f, 6)} /> : null}
          {s.credit ? <div style={{position: 'absolute', right: 150, top: 860, fontFamily: POLICE, fontWeight: 600, fontSize: 20,
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
const Fond: React.FC<{nom: string; graine: number}> = ({nom, graine}) => {
  const f = useCurrentFrame();
  const [a, b, c] = FONDS_ILLUSTRATION[nom] ?? FONDS_ILLUSTRATION.bleu;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${160 + 12 * Math.sin(f / 40)}deg, ${a} 0%, ${b} 55%, ${c} 100%)`}}>
      <svg width={1080} height={HAUT} style={{position: 'absolute'}}>
        <circle cx={250 + 90 * Math.sin(f / 33)} cy={330 + 60 * Math.cos(f / 41)} r={340} fill="#fff" opacity={0.08} />
        <circle cx={850 + 70 * Math.cos(f / 29)} cy={720 + 50 * Math.sin(f / 37)} r={280} fill="#fff" opacity={0.06} />
        {Array.from({length: 24}).map((_, i) => {
          const x = random(`x${graine}${i}`) * 1080;
          const y = ((random(`y${graine}${i}`) * HAUT - f * (1 + random(`v${graine}${i}`) * 2)) % HAUT + HAUT) % HAUT;
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
  return (
    <EmojiCtx.Provider value={donnees}>
      <AbsoluteFill style={{background: '#020629'}}>
        {/* Double animé, dans la moitié basse. */}
        <AbsoluteFill style={{top: HAUT + BANDEAU - 40, overflow: 'hidden'}}>
          <AbsoluteFill style={{transform: `translateY(${p.decalageDouble - HAUT - BANDEAU + 40}px)`}}>
            <Decor2D />
            <Double2D etat={etat} />
            <Bureau2D />
            <BrasDouble2D etat={etat} />
          </AbsoluteFill>
        </AbsoluteFill>
        {/* Panneau du haut : une scène par phrase. */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: HAUT, overflow: 'hidden'}}>
          {p.scenes.map((s, i) => {
            const [a, b] = bornes[i] ?? [0, 0];
            if (b <= a) return null;
            const ctx: Ctx = {debut: a, fin: b, motA: (m) => {
              const x = p.mots.find((w) => w.ph === i && w.t === m);
              return x ? S(x.a) - a : 6;
            }};
            const sens = i % 3;
            return (
              <Sequence key={i} from={a} durationInFrames={b - a}>
                <Entree sens={sens}>
                  <Fond nom={p.fonds[i] ?? 'bleu'} graine={i} />
                  <SceneVue s={s} c={ctx} />
                </Entree>
              </Sequence>
            );
          })}
        </div>
        {/* Bandeau des sous-titres et liserés. */}
        <div style={{position: 'absolute', left: 0, right: 0, top: HAUT, height: BANDEAU,
          background: 'linear-gradient(180deg, rgba(6,8,22,0.92), rgba(6,8,22,0.8))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: HAUT - 4, height: 8,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.2), #fff, rgba(255,255,255,0.2))', boxShadow: '0 0 24px rgba(255,255,255,0.8)'}} />
        <SousTitresMot mots={p.motsFrames} masques={p.masques} partages={[[0, S(p.duree) + 1]]} />
      </AbsoluteFill>
    </EmojiCtx.Provider>
  );
};

// Entrée de chaque scène : glissement, coup de zoom ou bascule (en rotation), 7 images.
const Entree: React.FC<React.PropsWithChildren<{sens: number}>> = ({sens, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const tr = sens === 0 ? `translateX(${(1 - p) * 1080}px)` : sens === 1 ? `scale(${1.25 - 0.25 * p})` : `translateY(${(1 - p) * -HAUT}px)`;
  return <AbsoluteFill style={{transform: tr, opacity: sens === 1 ? p : 1}}>{children}</AbsoluteFill>;
};

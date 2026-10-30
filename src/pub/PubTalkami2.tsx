import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, spring,
  staticFile, useCurrentFrame} from 'remotion';

// Publicité Talkami v2, dans le style de la vidéo « histoire de Talkami » : un seul univers violet à rayons qui
// tournent et étincelles, un élément central à la fois (cartes d'écrans et de professeurs qui flottent, pastilles
// jaunes à icône, gros chiffres), titres courts en jaune soulignés d'or, sous-titres en minuscules avec le mot dit en
// or et les mots clés dans une pastille violette, avatar de Joseph en bas à gauche.
// Temps en secondes dans la voix v2 (projets/talkami-pub/voix-v2/voix-v2.wav). Zone sûre : y 270–1270, x 50–950.
const FPS = 30;
const OR = '#FFC83D';
const ORANGE = '#FF7A1A';
const VIOLET = '#6D4BFF';
const NUIT = '#0B0828';
const VERT = '#22C55E';
const ROUGE = '#EF4444';
const POLICE = 'Montserrat';
const CX = 500;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const kit = (f: string) => staticFile(`talkami-pub/kit/${f}`);
const S = (s: number) => Math.round(s * FPS);

export type MotV2 = {t: string; ph: number; a2: number; b2: number};
export type PubV2Props = {duree: number; mots: MotV2[]};

const pop = (f: number, a = 0, raide = 190, amorti = 11) =>
  f < a ? 0 : spring({frame: f - a, fps: FPS, config: {damping: amorti, stiffness: raide, mass: 0.7}});
const prog = (f: number, a: number, d: number, e = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});

// --- Univers ---

const Fond: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 540px 720px, #3B2A93 0%, #21185E 38%, #120E3A 70%, ${NUIT} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(540 720) rotate(${f * 0.25})`}>
          {Array.from({length: 24}).map((_, i) => (
            <path key={i} d="M 0 0 L -55 -1500 L 55 -1500 Z" fill="#fff" opacity={i % 2 ? 0.035 : 0.06}
              transform={`rotate(${i * 15})`} />
          ))}
        </g>
        {Array.from({length: 26}).map((_, i) => {
          const x = (i * 263 + 90) % 1080;
          const y = (i * 419 + 140) % 1920;
          const s = (6 + (i % 4) * 4) * (0.5 + 0.5 * Math.abs(Math.sin((f + i * 17) / 18)));
          return <path key={i} d={`M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`}
            fill={i % 5 === 0 ? OR : '#fff'} opacity={0.5} />;
        })}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 540px 800px, transparent 55%, rgba(5,3,20,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// Avatar de Joseph en bas à gauche (signature de la vidéo histoire), présent toute la pub sauf la fin.
const Signatures: React.FC<{parle: boolean; fin: number}> = ({parle, fin}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [fin - 6, fin], [1, 0], clamp);
  return (
    <>
      <div style={{position: 'absolute', left: 58, top: 905, width: 168, height: 168, borderRadius: 84, overflow: 'hidden',
        border: `6px solid ${OR}`, boxShadow: '0 12px 28px rgba(0,0,0,0.45)', background: '#1B1650', opacity: o,
        transform: `scale(${pop(f, 4)})`}}>
        <OffthreadVideo src={kit('avatar-joseph.mp4')} muted
          style={{width: 186, height: 186, marginLeft: -9, marginTop: -9, filter: parle ? 'none' : 'brightness(0.95)'}} />
      </div>
    </>
  );
};

// Titre court en jaune (majuscules) souligné d'une barre dorée qui s'étire.
const Titre: React.FC<{texte: string; y?: number}> = ({texte, y = 420}) => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 220);
  const barre = prog(f, 3, 8);
  return (
    <div style={{position: 'absolute', top: y, left: CX - 420, width: 840, textAlign: 'center',
      transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
      <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 62, color: OR, letterSpacing: 2,
        textShadow: '0 6px 16px rgba(0,0,0,0.45)'}}>{texte}</div>
      <div style={{margin: '10px auto 0', height: 8, width: 420 * barre, borderRadius: 4,
        background: `linear-gradient(90deg, ${OR}, ${ORANGE})`, boxShadow: `0 0 18px ${OR}`}} />
    </div>
  );
};

// Carte flottante (écran du site ou professeur), entrée avec rebond et inclinaison, flottement continu.
const Carte: React.FC<React.PropsWithChildren<{x: number; y: number; l: number; h: number; angle?: number;
  entree?: number; sortie?: number; rayon?: number}>> = ({x, y, l, h, angle = 0, entree = 0, sortie, rayon = 44, children}) => {
  const f = useCurrentFrame();
  const k = pop(f, entree, 170, 12);
  const s = sortie !== undefined ? prog(f, sortie, 6, Easing.in(Easing.cubic)) : 0;
  const flotte = Math.sin((f + x) / 22) * 8;
  return (
    <div style={{position: 'absolute', left: x - l / 2, top: y - h / 2 + flotte, width: l, height: h, borderRadius: rayon,
      overflow: 'hidden', background: '#fff', border: '7px solid #fff', boxShadow: '0 34px 70px rgba(0,0,0,0.55)',
      transform: `scale(${(0.55 + 0.45 * k) * (1 - 0.6 * s)}) rotate(${angle + (1 - Math.min(1, k)) * angle * 3}deg)`,
      opacity: k > 0 ? 1 - s : 0}}>
      {children}
    </div>
  );
};

// Vidéo de professeur recadrée sur le visage dans une carte.
const VideoProf: React.FC<{src: string; l: number; h: number; depuis?: number; largeurVue?: number; cy?: number; visage?: number}> = (
  {src, l, h, depuis = 0, largeurVue = 760, cy = 0.42, visage = 890}) => {
  const k = l / largeurVue;
  return (
    <OffthreadVideo src={kit(src)} muted startFrom={S(depuis)} style={{position: 'absolute', width: 1080 * k,
      height: 1920 * k, left: l / 2 - 540 * k, top: h * cy - visage * k}} />
  );
};

// Pastille jaune ronde à icône + étiquette, qui claque par-dessus une carte.
const Pastille: React.FC<{x: number; y: number; a: number; icone: string; texte?: string; taille?: number}> = (
  {x, y, a, icone, texte, taille = 150}) => {
  const f = useCurrentFrame();
  const k = pop(f, a, 260, 9);
  return (
    <div style={{position: 'absolute', left: x - 300, top: y - taille / 2, width: 600, display: 'flex', flexDirection: 'column',
      alignItems: 'center', transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -20}deg)`, opacity: k > 0 ? 1 : 0}}>
      {taille > 0 ? <div style={{width: taille, height: taille, borderRadius: taille * 0.28, background: `linear-gradient(160deg, #FFD95E, ${OR} 60%, #F2A51A)`,
        border: '6px solid #fff', boxShadow: '0 16px 30px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
        justifyContent: 'center'}}>
        <Icone nom={icone} taille={taille * 0.58} />
      </div> : null}
      {texte ? (
        <div style={{marginTop: taille > 0 ? -14 : 0, background: NUIT, color: '#fff', border: `4px solid ${OR}`, borderRadius: 40,
          padding: '8px 28px', fontFamily: POLICE, fontWeight: 900, fontSize: 40, whiteSpace: 'nowrap',
          boxShadow: '0 10px 20px rgba(0,0,0,0.4)'}}>{texte}</div>
      ) : null}
    </div>
  );
};

const Icone: React.FC<{nom: string; taille: number}> = ({nom, taille}) => {
  const c = '#2A1C70';
  const t = {fill: 'none', stroke: c, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={taille} height={taille} viewBox="-50 -50 100 100">
      {nom === 'micro' ? <g><rect x={-14} y={-38} width={28} height={50} rx={14} fill={c} />
        <path d="M -28 0 A 28 28 0 0 0 28 0" {...t} /><line x1={0} y1={28} x2={0} y2={40} {...t} /></g> : null}
      {nom === 'oreille' ? <g><path d="M -18 10 C -30 -10 -24 -38 2 -38 C 26 -38 32 -14 22 2 C 14 14 6 14 6 28 C 6 40 -10 42 -14 32" {...t} />
        <path d="M -4 -6 C -4 -18 12 -18 12 -6" {...t} /></g> : null}
      {nom === 'coche' ? <polyline points="-28,2 -8,22 28,-20" {...t} strokeWidth={13} /> : null}
      {nom === 'telephone' ? <g><rect x={-22} y={-40} width={44} height={80} rx={10} {...t} /><line x1={-6} y1={28} x2={6} y2={28} {...t} /></g> : null}
      {nom === 'bulle' ? <g><path d="M -36 -26 Q -36 -36 -26 -36 L 26 -36 Q 36 -36 36 -26 L 36 8 Q 36 18 26 18 L -6 18 L -22 34 L -20 18 L -26 18 Q -36 18 -36 8 Z" fill={c} />
        <text x={0} y={2} textAnchor="middle" fontFamily={POLICE} fontWeight={900} fontSize={30} fill={OR}>FR</text></g> : null}
      {nom === 'cadeau' ? <g><rect x={-32} y={-8} width={64} height={44} rx={6} fill={c} /><rect x={-38} y={-24} width={76} height={18} rx={5} fill={c} />
        <rect x={-5} y={-24} width={10} height={60} fill={OR} /><path d="M 0 -24 C -20 -46 -34 -30 0 -24 C 34 -30 20 -46 0 -24" {...t} strokeWidth={7} /></g> : null}
    </svg>
  );
};

// Étapes 1-2-3 en haut (comme le parcours de la vidéo histoire).
const Etapes: React.FC<{actif: number; debuts: number[]}> = ({actif, debuts}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 300, left: CX - 300, width: 600, height: 90}}>
      <div style={{position: 'absolute', top: 41, left: 60, width: 480, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.25)'}} />
      <div style={{position: 'absolute', top: 41, left: 60, width: 240 * Math.max(0, actif), height: 8, borderRadius: 4, background: OR}} />
      {[0, 1, 2].map((i) => {
        const fait = i < actif;
        const courant = i === actif;
        const k = courant ? 1 + 0.12 * Math.max(0, 1 - (f - debuts[i]) / 8) : 1;
        return (
          <div key={i} style={{position: 'absolute', left: 60 + i * 240 - 45, top: 0, width: 90, height: 90, borderRadius: 45,
            background: fait ? VIOLET : courant ? OR : '#2B2366', border: '5px solid #fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transform: `scale(${k})`, fontFamily: POLICE, fontWeight: 900,
            fontSize: 44, color: courant ? NUIT : '#fff', boxShadow: courant ? `0 0 24px ${OR}` : 'none'}}>
            {fait ? '✓' : i + 1}
          </div>
        );
      })}
    </div>
  );
};

// --- Scènes ---

// 1. « L'anglais vous bloque ? » : L'ANGLAIS en or, cadenas qui se balance, tampon rouge BLOQUÉ sur « bloque ».
const Accroche: React.FC<{bloque: number}> = ({bloque}) => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 240, 10);
  const kc = pop(f, 3, 200, 8);
  const kt = pop(f, bloque, 320, 9);
  const balance = Math.sin(f / 5) * 10 * Math.max(0.3, 1 - f / 40);
  const tremble = f >= bloque && f < bloque + 10 ? Math.sin(f * 3) * 10 * (1 - (f - bloque) / 10) : 0;
  return (
    <AbsoluteFill style={{transform: `translateX(${tremble}px)`}}>
      <div style={{position: 'absolute', top: 590, left: CX - 440, width: 880, textAlign: 'center', transform: `scale(${k})`,
        fontFamily: POLICE, fontWeight: 900, fontSize: 168, color: OR, letterSpacing: -2,
        textShadow: '0 10px 0 #B87A10, 0 22px 40px rgba(0,0,0,0.5)'}}>L'ANGLAIS</div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${CX} 440) rotate(${balance}) scale(${kc})`}>
          <path d="M -58 -10 L -58 -70 A 58 58 0 0 1 58 -70 L 58 -10" fill="none" stroke="#E5E7EB" strokeWidth={26} strokeLinecap="round" />
          <rect x={-95} y={-22} width={190} height={160} rx={34} fill={ORANGE} stroke="#fff" strokeWidth={9} />
          <circle cx={0} cy={44} r={22} fill={NUIT} />
          <rect x={-8} y={50} width={16} height={46} rx={8} fill={NUIT} />
        </g>
      </svg>
      <div style={{position: 'absolute', top: 830, left: CX - 400, width: 800, display: 'flex', justifyContent: 'center',
        transform: `rotate(-6deg) scale(${kt === 0 ? 0 : 1.6 - 0.6 * Math.min(1, kt)})`, opacity: kt > 0 ? 1 : 0}}>
        <div style={{border: `10px solid ${ROUGE}`, borderRadius: 20, padding: '4px 34px', fontFamily: POLICE, fontWeight: 900,
          fontSize: 100, color: ROUGE, background: 'rgba(255,255,255,0.94)', letterSpacing: 4, whiteSpace: 'nowrap'}}>BLOQUÉ ?</div>
      </div>
    </AbsoluteFill>
  );
};

// Pilule « Je comprends ✓ » / « Je parle ✗ » avec une bulle « Hello… » qui tremble.
const Pilule: React.FC<{y: number; a: number; ok: boolean; texte: string}> = ({y, a, ok, texte}) => {
  const f = useCurrentFrame();
  const k = pop(f, a, 240, 10);
  const tremble = !ok && f >= a && f < a + 14 ? Math.sin(f * 2.8) * 12 * (1 - (f - a) / 14) : 0;
  return (
    <div style={{position: 'absolute', top: y, left: CX - 380, width: 760, display: 'flex', justifyContent: 'center',
      transform: `translateX(${tremble}px) scale(${k})`, opacity: k > 0 ? 1 : 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, background: '#fff', borderRadius: 70, padding: '18px 44px 18px 22px',
        boxShadow: '0 18px 36px rgba(0,0,0,0.45)'}}>
        <div style={{width: 96, height: 96, borderRadius: 48, background: ok ? VERT : ROUGE, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontFamily: POLICE, fontWeight: 900, fontSize: 62}}>{ok ? '✓' : '✗'}</div>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 70, color: ok ? '#15803D' : '#B91C1C'}}>{texte}</span>
      </div>
    </div>
  );
};

const Hesitation: React.FC<{a: number}> = ({a}) => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 200);
  const points = '.'.repeat(1 + (Math.floor(f / 6) % 3));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 470, left: CX - 280, width: 560, height: 230, transform: `scale(${k}) rotate(-3deg)`}}>
        <div style={{position: 'absolute', inset: 0, background: '#fff', borderRadius: 60, boxShadow: '0 22px 44px rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: POLICE, fontWeight: 900, fontSize: 100,
          color: '#2A1C70'}}>Hello{points}</div>
        <div style={{position: 'absolute', left: 90, bottom: -42, width: 0, height: 0, borderLeft: '30px solid transparent',
          borderRight: '30px solid transparent', borderTop: '56px solid #fff'}} />
      </div>
      <Pilule y={810} a={a} ok={false} texte="Je n'ose pas" />
    </AbsoluteFill>
  );
};

// Logo Talkami blanc qui éclate, halo et étincelles.
const LogoEclat: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 200, 9);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: CX - 360, top: 720 - 360, width: 720, height: 720, borderRadius: 360,
        background: `radial-gradient(circle, rgba(255,200,61,0.45), transparent 65%)`, transform: `scale(${k})`}} />
      <Img src={kit('logo-talkami-blanc-transparent.png')} style={{position: 'absolute', width: 820, left: CX - 410,
        top: 720 - 114, transform: `scale(${k})`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 14}).map((_, i) => {
          const ang = (i / 14) * Math.PI * 2;
          const d = 200 + 260 * prog(f, 0, 18);
          const o = 1 - prog(f, 10, 12);
          return <circle key={i} cx={CX + Math.cos(ang) * d} cy={720 + Math.sin(ang) * d * 0.8} r={10 - (i % 3) * 2}
            fill={i % 2 ? OR : '#fff'} opacity={o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Téléphone (écran du site) qui flotte, avec zoom lent.
const TelephoneEcran: React.FC<{src: string; depuis: number; y?: number; echelle?: number; zoom?: [number, number];
  duree: number; cible?: [number, number]}> = ({src, depuis, y = 665, echelle = 0.41, zoom = [1, 1.08], duree, cible}) => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 170, 12);
  const l = 1080 * echelle;
  const h = 1920 * echelle;
  const av = interpolate(f, [0, duree], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const z = zoom[0] + (zoom[1] - zoom[0]) * av;
  const ox = cible ? CX - l / 2 + cible[0] * echelle : CX;
  const oy = cible ? y - h / 2 + cible[1] * echelle : y;
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${ox}px ${oy}px`}}>
      <div style={{position: 'absolute', left: CX - l / 2 - 20, top: y - h / 2 - 20 + Math.sin(f / 20) * 6, width: l + 40,
        height: h + 40, borderRadius: 70, background: '#0B0B1A', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 4px #3B3470 inset',
        transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - Math.min(1, k)) * 8 - 2}deg)`, opacity: k > 0 ? 1 : 0}}>
        <div style={{position: 'absolute', left: 20, top: 20, width: l, height: h, borderRadius: 52, overflow: 'hidden', background: '#fff'}}>
          <OffthreadVideo src={kit(src)} muted startFrom={S(depuis)} style={{width: l, height: h}} />
        </div>
        <div style={{position: 'absolute', left: (l + 40) / 2 - 64, top: 30, width: 128, height: 28, borderRadius: 14, background: '#0B0B1A'}} />
      </div>
    </AbsoluteFill>
  );
};

// Dialogue de la séance, découpé dans la capture et agrandi.
const Dialogue: React.FC<{src: string; cadre: [number, number, number, number]; y?: number}> = ({src, cadre, y = 700}) => {
  const f = useCurrentFrame();
  const [x1, y1, x2, y2] = cadre;
  const k = 900 / (x2 - x1);
  const l = (x2 - x1) * k;
  const h = (y2 - y1) * k;
  const z = 1 + 0.05 * prog(f, 0, 50, Easing.inOut(Easing.quad));
  return (
    <Carte x={CX} y={y} l={l + 14} h={h + 14} angle={-1.5} rayon={36}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`}}>
        <Img src={kit(src)} style={{position: 'absolute', width: 1080 * k, left: -x1 * k, top: -y1 * k}} />
      </div>
    </Carte>
  );
};

const Correction: React.FC<{a: number}> = ({a}) => {
  const f = useCurrentFrame();
  const k = pop(f, a, 240, 10);
  const barre = prog(f, a + 4, 6);
  return (
    <div style={{position: 'absolute', top: 905, left: 560 - 430, width: 860, display: 'flex', justifyContent: 'center',
      transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 60, padding: '10px 34px',
        boxShadow: '0 18px 36px rgba(0,0,0,0.45)'}}>
        <span style={{position: 'relative', fontFamily: POLICE, fontWeight: 900, fontSize: 72, color: ROUGE}}>I go
          <span style={{position: 'absolute', left: -4, top: '52%', height: 10, width: `${barre * 108}%`, background: ROUGE, borderRadius: 5}} />
        </span>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 74, color: '#2A1C70'}}>→</span>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 72, color: '#15803D'}}>I went</span>
        <span style={{width: 74, height: 74, borderRadius: 37, background: VERT, color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: POLICE, fontWeight: 900, fontSize: 50}}>✓</span>
      </div>
    </div>
  );
};

// Gros disque jaune « 0 » (partir de zéro).
const Zero: React.FC<{a: number}> = ({a}) => {
  const f = useCurrentFrame();
  const k = pop(f, a, 230, 9);
  return (
    <div style={{position: 'absolute', left: 640, top: 560, width: 260, height: 260, borderRadius: 130,
      background: `linear-gradient(160deg, #FFD95E, ${OR} 60%, #F2A51A)`, border: '8px solid #fff', boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: POLICE, fontWeight: 900, fontSize: 190, color: '#2A1C70',
      transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * 30 + 6}deg)`, opacity: k > 0 ? 1 : 0}}>0</div>
  );
};

// Badge « ÉVALUATION ORALE GRATUITE ».
const BadgeGratuit: React.FC<{a: number}> = ({a}) => {
  const f = useCurrentFrame();
  const k = pop(f, a, 260, 9);
  const pulse = f > a + 12 ? 1 + 0.035 * Math.sin((f - a) / 4) : 1;
  return (
    <div style={{position: 'absolute', top: 330, left: CX - 420, width: 840, display: 'flex', justifyContent: 'center',
      transform: `scale(${k * pulse}) rotate(-3deg)`, opacity: k > 0 ? 1 : 0}}>
      <div style={{background: `linear-gradient(160deg, #FFD95E, ${OR})`, border: '7px solid #fff', borderRadius: 44, padding: '14px 40px',
        textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 52, color: '#2A1C70', lineHeight: 1.05}}>ÉVALUATION ORALE</div>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 104, color: '#fff', lineHeight: 1.0,
          WebkitTextStroke: '5px #2A1C70', paintOrder: 'stroke fill'}}>GRATUITE</div>
      </div>
    </div>
  );
};

// Confettis dorés (moment « oser »).
const Confettis: React.FC<{a: number}> = ({a}) => {
  const f = useCurrentFrame();
  if (f < a) return null;
  const u = f - a;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 44}).map((_, i) => {
        const ang = (i / 44) * Math.PI * 2;
        const v = 15 + (i * 7) % 12;
        const x = CX + Math.cos(ang) * v * u;
        const y = 640 + Math.sin(ang) * v * u * 0.8 + 0.6 * u * u;
        return <rect key={i} x={x - 12} y={y - 6} width={24} height={12} rx={3}
          fill={[OR, '#fff', ORANGE, VIOLET, '#7DD3FC'][i % 5]} opacity={Math.max(0, 1 - u / 36)}
          transform={`rotate(${u * 12 + i * 20} ${x} ${y})`} />;
      })}
    </svg>
  );
};

// Fin : image du kit (fond transparent) sur l'univers, ramenée à 86 % (zone sûre), pulsation sur « talkami point net ».
const Fin: React.FC<{pulse: number}> = ({pulse}) => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 150, 12);
  const t = f - pulse;
  const p = t >= 0 && t < 16 ? 1 + 0.07 * Math.sin((t / 16) * Math.PI) : 1;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: CX - 330, top: 900 - 330, width: 660, height: 660, borderRadius: 330,
        background: 'radial-gradient(circle, rgba(255,200,61,0.3), transparent 65%)'}} />
      <Img src={kit('fin-talkami-net-evaluation-gratuite-transparent.png')} style={{position: 'absolute', width: 1080, height: 1920,
        transform: `scale(${0.86 * (0.8 + 0.2 * k) * p})`, transformOrigin: '540px 900px', opacity: Math.min(1, k * 1.5)}} />
    </AbsoluteFill>
  );
};

// --- Sous-titres karaoké ---

const CLES = new Set(['bloque', 'comprenez', 'parler', 'talkami', 'teacher', 'joe', 'rose', 'téléphone', 'zéro', 'écoutent',
  'douceur', 'français', 'gratuite', 'oser']);
const nu = (m: string) => m.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿœ']/g, '').replace(/^l'/, '');

type Bloc = {mots: MotV2[]; a: number; b: number};
const blocs = (mots: MotV2[]): Bloc[] => {
  // Coupe aux ponctuations fortes et au plus 4 mots / 24 caractères.
  const res: Bloc[] = [];
  let cur: MotV2[] = [];
  const pousser = () => { if (cur.length) res.push({mots: cur, a: cur[0].a2, b: cur[cur.length - 1].b2}); cur = []; };
  for (const m of mots) {
    const long = cur.map((x) => x.t).join(' ').length + m.t.length;
    if (cur.length && (cur.length >= 4 || long > 24)) pousser();
    cur.push(m);
    if (/[.?!…:,]$/.test(m.t)) pousser();
  }
  pousser();
  return res;
};

const SousTitres: React.FC<{mots: MotV2[]; caches: [number, number][]}> = ({mots, caches}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (caches.some(([a, b]) => t >= a && t < b)) return null;
  const liste = blocs(mots);
  let i = -1;
  for (let k = 0; k < liste.length; k++) if (liste[k].a - 0.05 <= t) i = k;
  if (i < 0) return null;
  const bl = liste[i];
  const suivant = liste[i + 1];
  if (t > bl.b + 0.5 && (!suivant || t < suivant.a - 0.05)) return null;
  const e = interpolate(f - S(bl.a - 0.05), [0, 4], [0.85, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <div style={{position: 'absolute', top: 1105, left: CX - 420, width: 840, display: 'flex', flexWrap: 'wrap',
      justifyContent: 'center', alignItems: 'center', columnGap: 22, rowGap: 6, transform: `scale(${e})`}}>
      {bl.mots.map((m, k) => {
        const dit = t >= m.a2 - 0.03;
        const encours = dit && t < m.b2 + 0.05;
        const cle = CLES.has(nu(m.t)) || (m.t.startsWith('talkami') && m.ph === 5);
        const style: React.CSSProperties = {fontFamily: POLICE, fontWeight: 900, fontSize: 80, lineHeight: 1.15,
          color: encours && !cle ? OR : '#fff', opacity: dit ? 1 : 0.45,
          textShadow: '0 5px 14px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'};
        if (cle && dit) {
          const kp = pop(f, S(m.a2 - 0.03), 300, 10);
          return <span key={k} style={{...style, background: VIOLET, border: '4px solid #fff', borderRadius: 18,
            padding: '0 16px', color: '#fff', transform: `scale(${0.8 + 0.2 * kp})`, boxShadow: '0 8px 18px rgba(0,0,0,0.4)'}}>{m.t}</span>;
        }
        return <span key={k} style={style}>{m.t}</span>;
      })}
    </div>
  );
};

// --- Montage ---

const motA = (mots: MotV2[], t: string, ph?: number) => {
  const m = mots.find((x) => x.t === t && (ph === undefined || x.ph === ph));
  if (!m) throw new Error(`mot introuvable : ${t}`);
  return m.a2;
};

export const PubTalkami2: React.FC<PubV2Props> = ({mots, duree}) => {
  const [attente] = useState(() => delayRender('Montserrat'));
  const [pret, setPret] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load('900 100px Montserrat'), document.fonts.load('800 100px Montserrat')]).then(() => {
      setPret(true);
      continueRender(attente);
    });
  }, [attente]);
  const f = useCurrentFrame();
  if (!pret) return null;
  const A = (t: string, ph?: number) => motA(mots, t, ph);
  // Plans (début, fin en s) calés sur les mots de la voix v2.
  const p = {
    accroche: [0, A('Vous', 1) - 0.05],
    comprend: [A('Vous', 1) - 0.05, A('mais') - 0.05],
    ose: [A('mais') - 0.05, A('Avec') - 0.12],
    logo: [A('Avec') - 0.12, A('vous', 2) - 0.08],
    parlez: [A('vous', 2) - 0.08, A('avec', 2) - 0.05],
    joe: [A('avec', 2) - 0.05, A('ou') - 0.05],
    rose: [A('ou') - 0.05, A('directement') - 0.05],
    tel: [A('directement') - 0.05, A('Même') - 0.08],
    zero: [A('Même') - 0.08, A('Ils') - 0.08],
    ecoute: [A('Ils') - 0.08, A('corrigent') - 0.05],
    corrige: [A('corrigent') - 0.05, A('et', 3) - 0.05],
    francais: [A('et', 3) - 0.05, A('quand') - 0.05],
    bloquez: [A('quand') - 0.05, A('Commencez') - 0.1],
    eval: [A('Commencez') - 0.1, A('Talkami :') - 0.1],
    duo: [A('Talkami :') - 0.1, A('vous', 5) - 0.06],
    oser: [A('vous', 5) - 0.06, A('Rendez-vous') - 0.1],
    fin: [A('Rendez-vous') - 0.1, duree],
  } as Record<string, [number, number]>;
  const seq = (nom: string, contenu: React.ReactNode) => {
    const [a, b] = p[nom];
    return <Sequence key={nom} from={S(a)} durationInFrames={S(b) - S(a)}>{contenu}</Sequence>;
  };
  const rel = (nom: string, t: number) => S(t) - S(p[nom][0]);
  const dureeP = (nom: string) => S(p[nom][1]) - S(p[nom][0]);
  const parle = mots.some((m) => f / FPS >= m.a2 && f / FPS < m.b2 + 0.1);
  const etape = f < S(p.corrige[0]) ? 0 : f < S(p.francais[0]) ? 1 : 2;
  const dansEtapes = f >= S(p.ecoute[0]) && f < S(p.bloquez[1]);
  return (
    <AbsoluteFill>
      <Fond />
      {seq('accroche', <><Accroche bloque={rel('accroche', A('bloque ?'))} /></>)}
      {seq('comprend', <><Titre texte="VOUS LE COMPRENEZ" y={330} />
        <Pilule y={560} a={rel('comprend', A('comprenez…'))} ok texte="Je comprends" /></>)}
      {seq('ose', <><Titre texte="MAIS…" y={330} /><Hesitation a={rel('ose', A('parler ?', 1))} /></>)}
      {seq('logo', <><Titre texte="LA SOLUTION" y={330} /><LogoEclat /></>)}
      {seq('parlez', <><TelephoneEcran src="ecran-accueil-pastille-rose.mp4" depuis={0.4} duree={dureeP('parlez')} />
        <Pastille x={790} y={420} a={4} icone="micro" taille={130} /></>)}
      {seq('joe', <><Carte x={CX} y={700} l={560} h={720} angle={-3}><VideoProf src="joe-salut.mp4" l={560} h={720} depuis={0.2} /></Carte>
        <Pastille x={CX} y={1010} a={3} icone="micro" texte="Teacher Joe" taille={0} /></>)}
      {seq('rose', <><Carte x={300} y={700} l={420} h={600} angle={-5}><VideoProf src="joe-salut.mp4" l={420} h={600} depuis={1.0} /></Carte>
        <Carte x={700} y={720} l={420} h={600} angle={4} entree={1}><VideoProf src="rose-salut.mp4" l={420} h={600} depuis={0.2} /></Carte>
        <Pastille x={700} y={1010} a={3} icone="micro" texte="Teacher Rose" taille={0} /></>)}
      {seq('tel', <><TelephoneEcran src="ecran-choix-du-professeur.mp4" depuis={4.0 - (A('téléphone.') - p.tel[0])}
        duree={dureeP('tel')} zoom={[1, 1.1]} />
        <Pastille x={820} y={480} a={rel('tel', A('téléphone.'))} icone="telephone" taille={130} /></>)}
      {seq('zero', <><Carte x={400} y={720} l={520} h={700} angle={-3}><VideoProf src="joe-sourire.mp4" l={520} h={700} depuis={0.2} /></Carte>
        <Zero a={rel('zero', A('zéro.'))} /></>)}
      {seq('ecoute', <><Carte x={CX} y={760} l={560} h={640} angle={2}><VideoProf src="rose-ecoute.mp4" l={560} h={640} depuis={0.6} /></Carte>
        <Pastille x={800} y={540} a={rel('ecoute', A('écoutent,'))} icone="oreille" taille={130} /></>)}
      {seq('corrige', <><Dialogue src="seance-correction-douce.png" cadre={[100, 780, 960, 1250]} y={700} />
        <Correction a={rel('corrige', A('douceur,'))} /></>)}
      {seq('francais', <><Dialogue src="seance-explication-en-francais.png" cadre={[70, 780, 1010, 1210]} y={700} />
        <Pastille x={790} y={980} a={rel('francais', A('français'))} icone="bulle" taille={130} /></>)}
      {seq('bloquez', <><Carte x={CX} y={740} l={560} h={680} angle={-2}><VideoProf src="rose-hochement.mp4" l={560} h={680} depuis={0.3} /></Carte></>)}
      {seq('eval', <><TelephoneEcran src="ecran-bouton-evaluation-gratuite.mp4" depuis={2.5 - (A('évaluation') - p.eval[0])}
        duree={dureeP('eval')} zoom={[1, 1.18]} cible={[540, 1530]} y={700} />
        <BadgeGratuit a={rel('eval', A('gratuite.'))} /></>)}
      {seq('duo', <><Img src={kit('logo-talkami-blanc-transparent.png')} style={{position: 'absolute', width: 560, left: CX - 280,
        top: 330, transform: `scale(${pop(f - S(p.duo[0]), 0, 200)})`}} />
        <Carte x={CX} y={800} l={860} h={600} angle={-1.5}><VideoProf src="joe-et-rose-cote-a-cote.mp4" l={860} h={600} largeurVue={1080} cy={0.36} /></Carte></>)}
      {seq('oser', <><Titre texte="OSEZ LE PARLER" y={330} />
        <Carte x={300} y={760} l={420} h={600} angle={-5}><VideoProf src="rose-sourire.mp4" l={420} h={600} depuis={0.4} /></Carte>
        <Carte x={700} y={780} l={420} h={600} angle={4} entree={2}><VideoProf src="joe-sourire.mp4" l={420} h={600} depuis={1.2} /></Carte>
        <Confettis a={rel('oser', A('oser'))} /></>)}
      {seq('fin', <Fin pulse={rel('fin', A('talkami.net.'))} />)}
      {dansEtapes ? <Etapes actif={etape} debuts={[S(p.ecoute[0]), S(p.corrige[0]), S(p.francais[0])]} /> : null}
      <Signatures parle={parle} fin={S(p.fin[0])} />
      <SousTitres mots={mots} caches={[[p.fin[0], duree]]} />
      <Flash images={[0, S(p.logo[0]), S(p.fin[0])]} />
    </AbsoluteFill>
  );
};

const Flash: React.FC<{images: number[]}> = ({images}) => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...images.map((i) => (f >= i && f < i + 3 ? [0.5, 0.25, 0.08][f - i] : 0)));
  return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

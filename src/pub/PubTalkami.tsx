import React, {useEffect, useState} from 'react';
import {fitText} from '@remotion/layout-utils';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, spring,
  staticFile, useCurrentFrame} from 'remotion';

// Publicité Talkami (~29 s, 1080 × 1920) : voix off de Joseph, clips 3D de Teacher Joe et Teacher Rose, écrans du
// site, sous-titres au texte exact. Plan de montage : projets/talkami-pub/plan.json (copié dans les props par
// scripts/pub_talkami.py). Zone sûre commune Facebook / Instagram / TikTok : rien d'important au-dessus de 270 px,
// sous 1 270 px ni à droite de 950 px ; sous-titres centrés sur x 500, entre 1 080 et 1 250 px.
const FPS = 30;
const NAVY = '#0F2D62';
const NAVY_FONCE = '#0A1F4A';
const ORANGE = '#FF7A1A';
const VERT = '#22C55E';
const ROUGE = '#EF4444';
const POLICE = 'Montserrat';
const CX = 500; // centre horizontal de la zone sûre
const LARGEUR = 820;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const kit = (f: string) => staticFile(`talkami-pub/kit/${f}`);

export type SousTitre = {t: string; a: number; b: number; cle?: string[]; geant?: boolean; fin?: boolean};
export type Plan = {a: number; b: number; type: string; [k: string]: unknown};
export type PubProps = {duree: number; sousTitres: SousTitre[]; plans: Plan[]};

const pop = (f: number, a = 0, raide = 200) =>
  f < a ? 0 : spring({frame: f - a, fps: FPS, config: {damping: 11, stiffness: raide, mass: 0.7}});
const prog = (f: number, a: number, d: number, e = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});

// Fond bleu nuit de la marque, avec deux taches de lumière (orange et bleue) qui bougent et des points qui montent.
const Fond: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(170deg, #13387A 0%, ${NAVY} 50%, ${NAVY_FONCE} 100%)`}}>
    <svg width={1080} height={1920}>
      <defs>
        <radialGradient id="tacheO"><stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
          <stop offset="100%" stopColor={ORANGE} stopOpacity={0} /></radialGradient>
        <radialGradient id="tacheB"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></radialGradient>
      </defs>
      <circle cx={820 + 80 * Math.sin(f / 40)} cy={420 + 60 * Math.cos(f / 50)} r={520} fill="url(#tacheO)" />
      <circle cx={200 + 70 * Math.cos(f / 45)} cy={1400 + 80 * Math.sin(f / 38)} r={600} fill="url(#tacheB)" />
      {Array.from({length: 30}).map((_, i) => {
        const x = (i * 137) % 1080;
        const y = (((i * 311) % 1920) - f * (1 + (i % 4) * 0.5) + 1920 * 4) % 1920;
        return <circle key={i} cx={x + 8 * Math.sin((f + i * 9) / 14)} cy={y} r={2 + (i % 4)} fill="#fff"
          opacity={0.08 + (i % 5) * 0.03} />;
      })}
    </svg>
  </AbsoluteFill>
);

// Entrée d'un plan : léger coup de zoom (1,08 → 1 en 6 images) ou glissement depuis la droite / le bas.
const Entree: React.FC<React.PropsWithChildren<{f: number; mode?: string}>> = ({f, mode, children}) => {
  const p = prog(f, 0, 7, Easing.out(Easing.cubic));
  const tr = mode === 'droite' ? `translateX(${(1 - p) * 700}px)` : mode === 'bas' ? `translateY(${(1 - p) * 900}px)`
    : `scale(${1.08 - 0.08 * p})`;
  return <AbsoluteFill style={{transform: tr}}>{children}</AbsoluteFill>;
};

// --- Plans ---

// Accroche : bulle « Hello… I… » verrouillée par un cadenas ; puis « COMPRENDRE ✓ » et « PARLER ✗ ».
const Blocage: React.FC<{f: number; etat: number}> = ({f, etat}) => {
  const t = f; // images depuis le début du plan
  const cadenas = etat === 0 ? pop(t, 7, 260) : 1;
  const secoue = (etat === 0 && t >= 7 && t < 19) || (etat === 2 && t >= 4 && t < 16)
    ? Math.sin(t * 2.6) * 14 * (1 - ((t - (etat === 0 ? 7 : 4)) / 12)) : 0;
  const petite = etat > 0;
  const bulle = {x: 500, y: petite ? 470 : 560, k: petite ? 0.72 : 1};
  const lettres = 'Hello… I…'.slice(0, Math.floor(interpolate(t, [0, 10], [5, 9], clamp)));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <filter id="ombreB" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Petits « ? » qui flottent autour. */}
        {[[170, 360, 90, -14], [850, 330, 70, 16], [140, 760, 70, 10], [880, 720, 100, -8]].map(([x, y, s, r], i) => (
          <text key={i} x={x} y={y + 14 * Math.sin((t + i * 13) / 9)} fontFamily={POLICE} fontWeight={900} fontSize={s}
            fill="#fff" opacity={0.18} transform={`rotate(${r} ${x} ${y})`} textAnchor="middle">?</text>
        ))}
        <g transform={`translate(${bulle.x + secoue} ${bulle.y}) scale(${bulle.k * (etat === 0 ? 0.55 + 0.45 * pop(t, 0, 260) : 1)})`}
          filter="url(#ombreB)">
          <rect x={-330} y={-170} width={660} height={300} rx={70} fill="#fff" />
          <path d="M -150 120 L -230 230 L -40 128 Z" fill="#fff" />
          <text x={0} y={30} textAnchor="middle" fontFamily={POLICE} fontWeight={900} fontSize={96} fill={NAVY}>
            {etat === 0 ? lettres : 'Hello… I…'}
          </text>
          {/* Cadenas qui se ferme sur la bulle. */}
          <g transform={`translate(270 -150) scale(${cadenas}) rotate(${(1 - Math.min(1, cadenas)) * 40})`}>
            <path d="M -42 -10 L -42 -52 A 42 42 0 0 1 42 -52 L 42 -10" fill="none" stroke="#CBD5E1" strokeWidth={20}
              strokeLinecap="round" />
            <rect x={-70} y={-16} width={140} height={120} rx={26} fill={ORANGE} stroke="#fff" strokeWidth={8} />
            <circle cx={0} cy={34} r={16} fill={NAVY} />
            <rect x={-6} y={38} width={12} height={34} rx={6} fill={NAVY} />
          </g>
        </g>
        {etat >= 1 ? <Puce y={790} k={etat === 1 ? pop(t, 0, 240) : 1} ok texte="COMPRENDRE" /> : null}
        {etat >= 2 ? <Puce y={930} k={pop(t, 0, 240)} ok={false} texte="PARLER" dx={secoue} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

const Puce: React.FC<{y: number; k: number; ok: boolean; texte: string; dx?: number}> = ({y, k, ok, texte, dx = 0}) => (
  <g transform={`translate(${CX + dx} ${y}) scale(${k})`} opacity={k > 0 ? 1 : 0}>
    <rect x={-380} y={-62} width={760} height={124} rx={62} fill="#fff" />
    <circle cx={-312} cy={0} r={46} fill={ok ? VERT : ROUGE} />
    {ok ? <polyline points="-334,0 -318,18 -288,-16" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round"
      strokeLinejoin="round" />
      : <g stroke="#fff" strokeWidth={12} strokeLinecap="round"><line x1={-330} y1={-18} x2={-294} y2={18} />
        <line x1={-294} y1={-18} x2={-330} y2={18} /></g>}
    <text x={36} y={24} textAnchor="middle" fontFamily={POLICE} fontWeight={900} fontSize={68}
      fill={ok ? '#15803D' : '#B91C1C'}>{texte}</text>
  </g>
);

// Logo Talkami blanc qui éclate devant des rayons orange, rebond sur le mot « Talkami ».
const Logo: React.FC<{f: number; rebond: number}> = ({f, rebond}) => {
  const k = pop(f, 3, 180);
  const r = f >= rebond ? 1 + 0.1 * Math.max(0, Math.sin(((f - rebond) / 10) * Math.PI)) * (f - rebond < 10 ? 1 : 0) : 1;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${CX} 760) rotate(${f * 0.8})`} opacity={0.5 * k}>
          {Array.from({length: 14}).map((_, i) => (
            <path key={i} d="M 0 0 L -70 -1100 L 70 -1100 Z" fill={ORANGE} opacity={0.35}
              transform={`rotate(${(i * 360) / 14})`} />
          ))}
        </g>
        <circle cx={CX} cy={760} r={330 * k} fill="#fff" opacity={0.07} />
      </svg>
      <Img src={kit('logo-talkami-blanc-transparent.png')} style={{position: 'absolute', width: 780, left: CX - 390,
        top: 760 - 108, transform: `scale(${k * r})`}} />
    </AbsoluteFill>
  );
};

// Écran du site dans un téléphone, avec zoom progressif vers une cible (coordonnées de l'écran 1080 × 1920).
const ECH = 0.56;
const TEL = {l: 1080 * ECH, h: 1920 * ECH, x: CX - (1080 * ECH) / 2, y: 270};
const Telephone: React.FC<{f: number; p: Plan}> = ({f, p}) => {
  const duree = (p.b - p.a) * FPS;
  const [z0, z1] = (p.zoom as number[]) ?? [1, 1.1];
  const avance = interpolate(f, [0, duree], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const z = z0 + (z1 - z0) * avance;
  const cible = (p.cible as number[]) ?? [540, 760];
  const ox = TEL.x + cible[0] * ECH;
  const oy = TEL.y + cible[1] * ECH;
  // La cible remonte vers le centre de l'image à mesure qu'on zoome.
  const dy = (760 - oy) * avance * (p.cible ? 1 : 0);
  const badge = p.badge as {a: number; lignes: string[]} | undefined;
  const kb = badge ? pop(f, (badge.a - p.a) * FPS, 220) : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${dy}px) scale(${z})`,
        transformOrigin: `${ox}px ${oy}px`}}>
        <div style={{position: 'absolute', left: TEL.x - 22, top: TEL.y - 22, width: TEL.l + 44, height: TEL.h + 44,
          borderRadius: 74, background: '#0B1222', boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 0 4px #2B3550 inset'}} />
        <div style={{position: 'absolute', left: TEL.x, top: TEL.y, width: TEL.l, height: TEL.h, borderRadius: 54,
          overflow: 'hidden', background: '#fff'}}>
          <OffthreadVideo src={kit(p.src as string)} muted startFrom={Math.round(((p.depuis as number) ?? 0) * FPS)}
            style={{width: TEL.l, height: TEL.h}} />
        </div>
        <div style={{position: 'absolute', left: CX - 70, top: TEL.y + 10, width: 140, height: 30, borderRadius: 15,
          background: '#0B1222'}} />
      </div>
      {badge ? (
        <div style={{position: 'absolute', left: CX - 400, width: 800, top: 300, display: 'flex', justifyContent: 'center',
          transform: `scale(${kb}) rotate(${-3 * Math.min(1, kb)}deg)`, opacity: kb > 0 ? 1 : 0}}>
          <div style={{background: ORANGE, borderRadius: 40, padding: '18px 40px', border: '6px solid #fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center'}}>
            {badge.lignes.map((l, i) => (
              <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: i === badge.lignes.length - 1 ? 92 : 58,
                lineHeight: 1.05, color: i === badge.lignes.length - 1 ? '#fff' : NAVY}}>{l}</div>
            ))}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Étiquette « TEACHER JOE » qui glisse depuis la gauche.
const Etiquette: React.FC<{f: number; texte: string}> = ({f, texte}) => {
  const k = prog(f, 2, 8, Easing.out(Easing.back(1.6)));
  return (
    <div style={{position: 'absolute', top: 300, left: CX - 360, width: 720, display: 'flex', justifyContent: 'center',
      transform: `translateX(${(1 - k) * -900}px)`}}>
      <div style={{background: NAVY, border: `6px solid #fff`, borderRadius: 50, padding: '14px 44px',
        boxShadow: '0 16px 36px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 26, height: 26, borderRadius: 13, background: ORANGE}} />
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 78, color: '#fff', letterSpacing: 1}}>{texte}</span>
      </div>
    </div>
  );
};

// Clip 3D d'un professeur, plein cadre, zoom lent centré sur le visage.
const Prof: React.FC<{f: number; p: Plan}> = ({f, p}) => {
  const duree = (p.b - p.a) * FPS;
  const [z0, z1] = (p.zoom as number[]) ?? [1.05, 1.15];
  const z = interpolate(f, [0, duree], [z0, z1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 640px'}}>
        <OffthreadVideo src={kit(p.src as string)} muted startFrom={Math.round(((p.depuis as number) ?? 0) * FPS)}
          style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      {p.etiquette ? <Etiquette f={f} texte={p.etiquette as string} /> : null}
    </AbsoluteFill>
  );
};

// Deux professeurs côte à côte (moitiés gauche et droite), chacun recentré sur son visage.
const Duo: React.FC<{f: number; p: Plan}> = ({f, p}) => {
  const z = interpolate(f, [0, (p.b - p.a) * FPS], [1.18, 1.26], clamp);
  const moitie = (src: string, x: number, glisse: number) => (
    <div style={{position: 'absolute', left: x, top: 0, width: 540, height: 1920, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -270, top: 0, width: 1080, height: 1920,
        transform: `translateY(${glisse}px) scale(${z})`, transformOrigin: '540px 700px'}}>
        <OffthreadVideo src={kit(src)} muted startFrom={Math.round(((p.depuis as number) ?? 0) * FPS)}
          style={{width: 1080, height: 1920}} />
      </div>
    </div>
  );
  const k = prog(f, 0, 7);
  return (
    <AbsoluteFill>
      {moitie(p.haut as string, 0, (1 - k) * -600)}
      {moitie(p.bas as string, 540, (1 - k) * 600)}
      <div style={{position: 'absolute', left: 536, top: 0, width: 8, height: 1920, background: '#fff',
        boxShadow: '0 0 20px rgba(0,0,0,0.4)'}} />
    </AbsoluteFill>
  );
};

// Passage de la séance agrandi : la séance floutée en fond, le dialogue découpé dans la capture en grand, puis la
// correction résumée en très gros (« I go » barré → « I went »).
const Dialogue: React.FC<{f: number; p: Plan}> = ({f, p}) => {
  const [x1, y1, x2, y2] = p.cadre as number[];
  const k = 960 / (x2 - x1);
  const l = (x2 - x1) * k;
  const h = (y2 - y1) * k;
  const z = interpolate(f, [0, (p.b - p.a) * FPS], [1, 1.07], clamp);
  const ent = pop(f, 0, 200);
  const puce = p.puce as {a: number; faux?: string; juste?: string; texte?: string};
  const kp = pop(f, (puce.a - p.a) * FPS, 230);
  const barre = prog(f, (puce.a - p.a) * FPS + 4, 6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(14px) brightness(0.45)', transform: 'scale(1.1)'}}>
        <OffthreadVideo src={kit(p.fond as string)} muted startFrom={330} style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: CX - l / 2, top: 640 - h / 2, width: l, height: h, borderRadius: 36,
        overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.55)', border: '6px solid #fff',
        transform: `scale(${(0.6 + 0.4 * ent) * z})`, opacity: ent > 0 ? 1 : 0}}>
        <Img src={kit(p.src as string)} style={{position: 'absolute', width: 1080 * k, left: -x1 * k, top: -y1 * k}} />
      </div>
      {puce.faux ? (
        <div style={{position: 'absolute', top: 905, left: CX - 420, width: 840, display: 'flex', justifyContent: 'center',
          transform: `scale(${kp})`, opacity: kp > 0 ? 1 : 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, background: '#fff', borderRadius: 60,
            padding: '12px 40px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
            <span style={{position: 'relative', fontFamily: POLICE, fontWeight: 900, fontSize: 96, color: ROUGE}}>
              {puce.faux}
              <span style={{position: 'absolute', left: -6, top: '50%', height: 10, width: `${barre * 110}%`,
                background: ROUGE, borderRadius: 5}} />
            </span>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 76, color: NAVY}}>→</span>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 96, color: '#15803D'}}>{puce.juste}</span>
            <span style={{width: 70, height: 70, borderRadius: 35, background: VERT, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontFamily: POLICE, fontWeight: 900, fontSize: 48}}>✓</span>
          </div>
        </div>
      ) : (
        <div style={{position: 'absolute', top: 920, left: CX - 400, width: 800, display: 'flex', justifyContent: 'center',
          transform: `scale(${kp})`, opacity: kp > 0 ? 1 : 0}}>
          <div style={{background: ORANGE, color: '#fff', borderRadius: 50, padding: '14px 44px', border: '6px solid #fff',
            fontFamily: POLICE, fontWeight: 900, fontSize: 72, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>{puce.texte}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Les deux professeurs ensemble, logo Talkami blanc dans le bleu du haut.
const DuoLogo: React.FC<{f: number; p: Plan}> = ({f, p}) => {
  const z = interpolate(f, [0, (p.b - p.a) * FPS], [1.0, 1.08], clamp);
  const k = pop(f, 2, 200);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 960px'}}>
        <OffthreadVideo src={kit(p.src as string)} muted style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      <Img src={kit('logo-talkami-blanc-transparent.png')} style={{position: 'absolute', width: 600, left: CX - 300,
        top: 280, transform: `scale(${k})`}} />
    </AbsoluteFill>
  );
};

// Image de fin du kit, ramenée à 86 % pour que « talkami.net » reste dans la zone sûre ; « RENDEZ-VOUS SUR » au-dessus,
// pulsation sur « talkami point net ».
const Fin: React.FC<{f: number; p: Plan}> = ({f, p}) => {
  const k = pop(f, 0, 160);
  const t = f - ((p.pulse as number) - p.a) * FPS;
  const pulse = t >= 0 && t < 14 ? 1 + 0.06 * Math.sin((t / 14) * Math.PI) : 1;
  const kr = pop(f, 1, 220);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #102C63 0%, #11336F 40%, ${NAVY_FONCE} 100%)`}}>
      <Img src={kit('fin-talkami-net-evaluation-gratuite.png')} style={{position: 'absolute', width: 1080, height: 1920,
        transform: `scale(${0.86 * (0.85 + 0.15 * k) * pulse})`, transformOrigin: '540px 900px'}} />
      <div style={{position: 'absolute', top: 700, left: CX - 400, width: 800, textAlign: 'center',
        transform: `scale(${kr})`, opacity: kr > 0 ? 1 : 0, fontFamily: POLICE, fontWeight: 900, fontSize: 60,
        color: '#fff', letterSpacing: 2}}>RENDEZ-VOUS SUR</div>
    </AbsoluteFill>
  );
};

const PlanVue: React.FC<{p: Plan; debut: number}> = ({p, debut}) => {
  const f = useCurrentFrame();
  void debut;
  let contenu: React.ReactNode = null;
  switch (p.type) {
    case 'blocage': contenu = <Blocage f={f} etat={p.etat as number} />; break;
    case 'logo': contenu = <Logo f={f} rebond={((p.rebond as number) - p.a) * FPS} />; break;
    case 'telephone': contenu = <Telephone f={f} p={p} />; break;
    case 'prof': contenu = <Prof f={f} p={p} />; break;
    case 'duo': contenu = <Duo f={f} p={p} />; break;
    case 'dialogue': contenu = <Dialogue f={f} p={p} />; break;
    case 'duoLogo': contenu = <DuoLogo f={f} p={p} />; break;
    case 'fin': contenu = <Fin f={f} p={p} />; break;
  }
  const fond = ['blocage', 'logo', 'telephone'].includes(p.type);
  return (
    <AbsoluteFill>
      {fond ? <Fond f={f + Math.round(p.a * FPS)} /> : null}
      <Entree f={f} mode={p.entree as string | undefined}>{contenu}</Entree>
    </AbsoluteFill>
  );
};

// --- Sous-titres : texte exact, gros, blanc à contour bleu nuit épais, mots clés en orange ---

const motsDe = (s: SousTitre) => s.t.split(' ');
const SousTitres: React.FC<{liste: SousTitre[]}> = ({liste}) => {
  const f = useCurrentFrame();
  const s = liste.find((x) => !x.fin && f >= Math.round(x.a * FPS) && f < Math.round(x.b * FPS));
  if (!s) return null;
  const t = f - Math.round(s.a * FPS);
  const k = interpolate(t, [0, 3], [1.12, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const style = (taille: number): React.CSSProperties => ({fontFamily: POLICE, fontWeight: 900, fontSize: taille,
    lineHeight: 1.04, WebkitTextStroke: `${Math.round(taille * 0.17)}px ${NAVY_FONCE}`, paintOrder: 'stroke fill',
    filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))', whiteSpace: 'nowrap', textAlign: 'center'});
  if (s.geant) {
    // Accroche : une ligne par mot ou groupe, chacune ajustée à la largeur (150 px au plus).
    const lignes = ["L'ANGLAIS", 'VOUS', 'BLOQUE ?'];
    return (
      <div style={{position: 'absolute', left: CX - LARGEUR / 2, width: LARGEUR, top: 820, display: 'flex',
        flexDirection: 'column', alignItems: 'center'}}>
        {lignes.map((l, i) => {
          const taille = Math.min(160, fitText({text: l, withinWidth: LARGEUR, fontFamily: POLICE, fontWeight: '900'}).fontSize);
          const kl = pop(t, i * 4, 260);
          return <div key={i} style={{...style(taille), color: i === 2 ? ORANGE : '#fff', transform: `scale(${kl})`,
            opacity: kl > 0 ? 1 : 0}}>{l}</div>;
        })}
      </div>
    );
  }
  const texte = s.t.toUpperCase();
  const taille = Math.min(100, fitText({text: texte, withinWidth: LARGEUR, fontFamily: POLICE, fontWeight: '900'}).fontSize);
  const cles = new Set((s.cle ?? []).map((c) => c.toUpperCase()));
  return (
    <div style={{position: 'absolute', left: CX - LARGEUR / 2, width: LARGEUR, top: 1165 - (taille * 1.04) / 2,
      display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={style(taille)}>
        {motsDe(s).map((m, i) => (
          <span key={i} style={{color: cles.has(m.toUpperCase()) ? ORANGE : '#fff'}}>{i > 0 ? ' ' : ''}{m.toUpperCase()}</span>
        ))}
      </div>
    </div>
  );
};

// Flash blanc léger sur les moments forts (première image, logo, fin).
const Flash: React.FC<{images: number[]}> = ({images}) => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...images.map((i) => (f >= i && f < i + 3 ? [0.55, 0.3, 0.1][f - i] : 0)));
  return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

export const PubTalkami: React.FC<PubProps> = ({plans, sousTitres}) => {
  const [attente] = useState(() => delayRender('Chargement de Montserrat'));
  const [pret, setPret] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load('900 100px Montserrat'), document.fonts.load('800 100px Montserrat')]).then(() => {
      setPret(true);
      continueRender(attente);
    });
  }, [attente]);
  if (!pret) return null;
  const forts = plans.filter((p) => ['logo', 'fin'].includes(p.type)).map((p) => Math.round(p.a * FPS) + 1);
  return (
    <AbsoluteFill style={{background: NAVY}}>
      {plans.map((p, i) => {
        const a = Math.round(p.a * FPS);
        const b = Math.round(p.b * FPS);
        return <Sequence key={i} from={a} durationInFrames={b - a}><PlanVue p={p} debut={a} /></Sequence>;
      })}
      <SousTitres liste={sousTitres} />
      <Flash images={[0, ...forts]} />
    </AbsoluteFill>
  );
};

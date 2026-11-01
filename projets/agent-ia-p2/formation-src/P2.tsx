import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble, EtapeExpression, EtapeGeste} from '../../commun/animationDouble';
import {Effets, EvenementSonore} from '../../commun/sons';
import {COULEURS, POLICE} from '../../theme';
import {EtatDouble} from '../../v2d/Double2D';
import {Scene2D} from '../../v2d/Scene2D';

// Deuxième partie de la formation (2A à 2D), 1920 × 1080 : démos plein écran (téléphone + zone agrandie, cadre doré),
// vidéos libres de droits (Mixkit), animations explicatives, Coach Joseph seulement sur les cartes.
// Données : public/formation/<dossier>/montage.json (projets/agent-ia-p2/montage/p2*.py).

export const FPS = 30;
type Zoom = {t: number; x: number; y: number; f: number};
type Surligne = {t: number; x0: number; y0: number; x1: number; y1: number};
export type Plan = {type: string; debut: number; fin: number; fichier?: string; bandeau?: string; zooms?: Zoom[]; surlignes?: Surligne[];
  legendes?: {t: number; texte: string}[]; nom?: string; reperes?: Record<string, number>; titre?: string; emoji?: string;
  points?: {texte: string; mot: string}[]; instants?: number[]; icones?: string[] | null; legende?: string; tLegende?: number | null;
  vertical?: boolean; [k: string]: unknown};
export type Mot = {texte: string; debut: number; fin: number; phrase: string};
export type Donnees = {duree: number; plans: Plan[]; mots: Mot[]};

const OR = COULEURS.or;
const VIOLET = COULEURS.violet;
const BLANC = COULEURS.blanc;
const NUIT = COULEURS.nuit;
const VERT = '#2fd27a';
const ROUGE = '#ff5a5f';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, d: number, duree = 0.4) => interpolate(t, [d, d + duree * 0.6, d + duree], [0, 1.1, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
const fondu = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CLAMP);
const doux = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
const R = (p: Plan, k: string) => p.reperes?.[k] ?? p.debut;

// ---------------------------------------------------------------- éléments communs
const Fond: React.FC<{t: number; teinte?: string}> = ({t, teinte = '#17206a'}) => {
  const parts = useMemo(() => Array.from({length: 26}, (_, i) => ({x: (i * 397) % 1920, y: (i * 619) % 1080, r: 2 + (i % 4), v: 8 + (i % 5) * 4, c: i % 3 === 0 ? OR : VIOLET})), []);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${40 + 10 * Math.sin(t / 5)}% ${35 + 8 * Math.cos(t / 6)}%, ${teinte}, ${NUIT} 70%)`}}>
      {parts.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: p.x, top: (p.y - t * p.v + 1080 * 4) % 1080, width: p.r * 2, height: p.r * 2, borderRadius: '50%',
          background: p.c, opacity: 0.25 + 0.2 * Math.sin(t * 1.3 + i), boxShadow: `0 0 ${p.r * 4}px ${p.c}`}} />
      ))}
    </AbsoluteFill>
  );
};

const Titre: React.FC<{t: number; t0: number; texte: string; emoji?: string; y?: number}> = ({t, t0, texte, emoji, y = 70}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, fontFamily: POLICE,
    transform: `translateY(${(1 - doux(t, t0, t0 + 0.4)) * -40}px)`, opacity: fondu(t, t0, t0 + 0.3)}}>
    {emoji ? <span style={{fontSize: 70, transform: `scale(${pop(t, t0 + 0.1)})`}}>{emoji}</span> : null}
    <span style={{fontSize: 66, fontWeight: 800, color: BLANC}}>{texte}</span>
  </div>
);

const Legende: React.FC<{t: number; t0: number; texte: string; couleur?: string; y?: number; x?: number; l?: number; taille?: number}> = (
  {t, t0, texte, couleur = OR, y = 860, x = 0, l = 1920, taille = 44}) => (
  <div style={{position: 'absolute', left: x, width: l, top: y, display: 'flex', justifyContent: 'center', fontFamily: POLICE}}>
    <div style={{background: couleur, color: NUIT, fontSize: taille, fontWeight: 800, borderRadius: 22, padding: '14px 34px', boxShadow: `0 0 40px ${couleur}66, 0 12px 30px #0008`,
      transform: `scale(${pop(t, t0, 0.45)})`, textAlign: 'center', maxWidth: l - 80}}>{texte}</div>
  </div>
);

const Bulle: React.FC<{t: number; t0: number; emoji: string; taille?: number; couleur?: string}> = ({t, t0, emoji, taille = 150, couleur = '#1b2470'}) => (
  <div style={{width: taille, height: taille, borderRadius: '50%', background: couleur, boxShadow: `0 0 0 5px ${OR}, 0 20px 40px #0009`, display: 'grid', placeItems: 'center',
    fontSize: taille * 0.52, transform: `scale(${pop(t, t0, 0.45)})`}}>{emoji}</div>
);

const Fleche: React.FC<{d: string; t: number; t0: number; couleur?: string; id: string; largeur?: number; duree?: number}> = ({d, t, t0, couleur = OR, id, largeur = 8, duree = 0.6}) => (
  <>
    <defs><marker id={id} markerWidth={10} markerHeight={10} refX={5} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={couleur} /></marker></defs>
    <path d={d} fill="none" stroke={couleur} strokeWidth={largeur} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - doux(t, t0, t0 + duree)}
      markerEnd={t > t0 + duree - 0.05 ? `url(#${id})` : undefined} opacity={fondu(t, t0 - 0.05, t0)} />
  </>
);

const Telephone: React.FC<{src: string; x: number; y?: number; rot: number; t: number; t0: number; legende?: string; l?: number}> = ({src, x, y = 175, rot, t, t0, legende, l = 330}) => {
  const k = doux(t, t0, t0 + 0.6);
  const h = l * 2.02;
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - k) * 700 + 8 * Math.sin(t * 1.4), transform: `rotate(${rot * k}deg)`, opacity: fondu(t, t0, t0 + 0.2)}}>
      <div style={{width: l, height: h, borderRadius: l * 0.14, background: '#05081c', padding: 12, boxShadow: '0 0 0 4px #39407a, 0 40px 80px #000c'}}>
        <Img src={staticFile(src)} style={{width: l - 24, height: h - 24, borderRadius: l * 0.11, objectFit: 'cover', objectPosition: 'top'}} />
      </div>
      {legende ? <div style={{marginTop: 18, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: OR, opacity: fondu(t, t0 + 0.4, t0 + 0.7)}}>{legende}</div> : null}
    </div>
  );
};

const Carton: React.FC<{x: number; y: number; l: number; h: number; couleur: string; t: number; t0: number; children: React.ReactNode; actif?: number}> = (
  {x, y, l, h, couleur, t, t0, children, actif = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: l, height: h, borderRadius: 30, background: '#0d1440', boxShadow: `0 0 0 ${3 + 3 * actif}px ${couleur}, 0 30px 70px #000a`,
    padding: '30px 36px', boxSizing: 'border-box', fontFamily: POLICE, color: BLANC, transform: `translateY(${(1 - doux(t, t0, t0 + 0.5)) * 140}px) scale(${0.96 + 0.04 * actif})`,
    opacity: fondu(t, t0, t0 + 0.3) * (0.55 + 0.45 * actif)}}>
    {children}
  </div>
);

// ---------------------------------------------------------------- animations
const AnimTitre: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tourne = (t - R(p, 'boucle')) * 120;
  return (
    <>
      <Img src={staticFile('marque/logo.jpg')} style={{position: 'absolute', left: 860, top: 70, width: 200, height: 200, borderRadius: 40, transform: `scale(${pop(t, p.debut, 0.6)})`,
        boxShadow: `0 0 60px ${OR}88`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 40, color: OR, letterSpacing: 4,
        opacity: fondu(t, p.debut + 0.3, p.debut + 0.6)}}>FORMATION</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 370, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 76, color: BLANC,
        transform: `scale(${pop(t, p.debut + 0.5, 0.5)})`}}>{String(p.sur)}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 510, display: 'flex', justifyContent: 'center', gap: 30, fontFamily: POLICE}}>
        <div style={{background: VIOLET, color: BLANC, fontSize: 52, fontWeight: 800, borderRadius: 24, padding: '12px 34px', transform: `scale(${pop(t, R(p, 'partie'))})`}}>{String(p.partie)}</div>
        <div style={{background: OR, color: NUIT, fontSize: 52, fontWeight: 800, borderRadius: 24, padding: '12px 34px', transform: `scale(${pop(t, R(p, 'p2a'))})`}}>{String(p.code)}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: POLICE,
        opacity: fondu(t, R(p, 'boucle') - 0.1, R(p, 'boucle') + 0.2), transform: `translateY(${(1 - doux(t, R(p, 'boucle') - 0.1, R(p, 'boucle') + 0.4)) * 60}px)`}}>
        <span style={{fontSize: 96, display: 'inline-block', transform: `rotate(${p.icone ? Math.sin(tourne / 40) * 15 : tourne}deg)`}}>{String(p.icone ?? '🔁')}</span>
        <span style={{fontSize: 92, fontWeight: 800, color: OR}}>{String(p.titre)}</span>
      </div>
    </>
  );
};

const AnimRappel: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const imgs = p.images as string[];
  const et = p.etiquettes as string[];
  const ts = [Math.min(R(p, 'bloc'), p.debut + 0.3), R(p, 'claude'), R(p, 'cahier')];
  return (
    <>
      <Titre t={t} t0={p.debut} texte={String(p.titreAnim ?? 'Dans la première partie')} emoji={p.titreAnim ? '🧭' : '⏪'} />
      {imgs.map((src, i) => (
        <React.Fragment key={i}>
          <Telephone src={src} x={190 + i * 560} y={190} l={300} rot={[-3, 0, 3][i]} t={t} t0={ts[i]} />
          <div style={{position: 'absolute', left: 90 + i * 560, width: 500, top: 830, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 38, color: OR,
            opacity: fondu(t, ts[i] + 0.3, ts[i] + 0.6)}}>{et[i]}</div>
        </React.Fragment>
      ))}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <Fleche id="ra1" d="M 520 500 C 580 440, 650 440, 720 500" t={t} t0={ts[1] - 0.3} />
        <Fleche id="ra2" d="M 1080 500 C 1140 440, 1210 440, 1280 500" t={t} t0={ts[2] - 0.3} />
      </svg>
      {p.legendeFin && t >= R(p, 'patron') - 0.2 ? <Legende t={t} t0={R(p, 'patron') - 0.2} texte={String(p.legendeFin)} y={160} taille={42} /> : null}
    </>
  );
};

const AnimConseil: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const k = pop(t, p.debut, 0.5);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontSize: 260, transform: `scale(${k * (1 + 0.06 * Math.sin(t * 8))}) rotate(${Math.sin(t * 6) * 6}deg)`}}>⚠️</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 90, color: OR,
        transform: `scale(${pop(t, R(p, 'conseil'), 0.5)})`}}>{String(p.texte)}</div>
    </>
  );
};

const AnimFlou: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tf = Math.min(R(p, 'floue'), p.debut + 0.3);
  const tm = R(p, 'mediocre');
  const tampon = interpolate(t, [tm - 0.05, tm + 0.15, tm + 0.3], [3, 0.9, 1], CLAMP);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Une idée floue…" emoji="🌫️" />
      <div style={{position: 'absolute', left: 220, top: 280, width: 560, height: 460, borderRadius: 40, background: '#1b2470', boxShadow: `0 0 0 4px ${VIOLET}`,
        transform: `scale(${pop(t, tf)})`, display: 'grid', placeItems: 'center', fontFamily: POLICE}}>
        <div style={{filter: `blur(${6 + 3 * Math.sin(t * 3)}px)`, textAlign: 'center'}}>
          <div style={{fontSize: 150}}>💭</div>
          <div style={{fontSize: 46, fontWeight: 800, color: BLANC}}>« Un agent… euh… qui fait des trucs ? »</div>
        </div>
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <Fleche id="fl1" d="M 820 510 L 1060 510" t={t} t0={tf + 1.2} largeur={12} />
      </svg>
      <div style={{position: 'absolute', left: 1110, top: 280, width: 600, height: 460, borderRadius: 40, background: '#262a3a', boxShadow: '0 0 0 4px #6b7088',
        opacity: fondu(t, tf + 1.6, tf + 2), display: 'grid', placeItems: 'center', fontFamily: POLICE, filter: `grayscale(${fondu(t, tm, tm + 0.3)})`}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 150, transform: `rotate(${Math.sin(t * 2) * 4}deg)`}}>🤖</div>
          <div style={{fontSize: 44, fontWeight: 800, color: '#c9cee3'}}>un résultat moyen</div>
        </div>
      </div>
      {t >= tm - 0.05 ? (
        <div style={{position: 'absolute', left: 1180, top: 420, fontFamily: POLICE, fontWeight: 800, fontSize: 96, color: ROUGE, border: `10px solid ${ROUGE}`, borderRadius: 20,
          padding: '6px 30px', transform: `rotate(-14deg) scale(${tampon})`, background: '#0008'}}>MÉDIOCRE 👎</div>
      ) : null}
    </>
  );
};

const AnimAide: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const ta = R(p, 'ameliorer');
  const tl = R(p, 'laisser');
  const lignes = Math.floor(interpolate(t, [ta, ta + 2.5], [2, 6], CLAMP));
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Claude vous aide…" emoji="🤝" />
      <div style={{position: 'absolute', left: 560, top: 240, width: 420, height: 540, background: '#e9ecf8', borderRadius: 24, padding: 30, boxSizing: 'border-box',
        fontFamily: POLICE, transform: `scale(${pop(t, p.debut + 0.2)}) rotate(-2deg)`, boxShadow: '0 30px 60px #000a'}}>
        <div style={{fontSize: 36, fontWeight: 800, color: NUIT}}>📐 Cahier des charges</div>
        {Array.from({length: 7}, (_, i) => (
          <div key={i} style={{height: 16, borderRadius: 8, marginTop: 24, width: `${55 + ((i * 41) % 45)}%`, background: i < 2 ? NUIT : i < lignes ? VIOLET : '#c9cee3'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 1020, top: 330, transform: `translate(${Math.sin(t * 4) * 10}px, ${Math.cos(t * 3) * 8}px) scale(${pop(t, ta)})`}}>
        <Bulle t={t} t0={ta} emoji="✨" couleur="#3b2a7a" taille={170} />
        <div style={{marginTop: 14, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: VIOLET}}>Claude améliore</div>
      </div>
      {t >= tl - 0.1 ? (
        <>
          <AbsoluteFill style={{background: '#020629aa', opacity: fondu(t, tl - 0.1, tl + 0.2)}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontSize: 220, transform: `scale(${pop(t, tl, 0.4)})`}}>✋</div>
          <Legende t={t} t0={tl + 0.2} texte="… mais ne lui laissez pas tout !" couleur={ROUGE} y={640} taille={60} />
        </>
      ) : null}
    </>
  );
};

const AnimAjuste: React.FC<{p: Plan; t: number}> = ({p, t}) => (
  <>
    <Titre t={t} t0={p.debut} texte="Qui fait quoi ?" emoji="🧩" />
    <Carton x={180} y={230} l={720} h={560} couleur={OR} t={t} t0={p.debut + 0.1}>
      <div style={{fontSize: 140, textAlign: 'center'}}>🎯</div>
      <div style={{fontSize: 58, fontWeight: 800, color: OR, textAlign: 'center'}}>Vous</div>
      <div style={{fontSize: 42, fontWeight: 700, textAlign: 'center', marginTop: 16, lineHeight: 1.25}}>La vision, l'objectif,<br />les décisions</div>
    </Carton>
    <Carton x={1020} y={230} l={720} h={560} couleur={VIOLET} t={t} t0={R(p, 'vous')}>
      <div style={{fontSize: 140, textAlign: 'center', transform: `rotate(${Math.sin(t * 5) * 20}deg)`}}>🔧</div>
      <div style={{fontSize: 58, fontWeight: 800, color: VIOLET, textAlign: 'center'}}>Claude</div>
      <div style={{fontSize: 42, fontWeight: 700, textAlign: 'center', marginTop: 16, lineHeight: 1.25, opacity: fondu(t, R(p, 'technique') - 0.3, R(p, 'technique'))}}>
        Ajuste seulement<br />ce qui manque en technique</div>
    </Carton>
  </>
);

const AnimQuestions: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tq = R(p, 'questions');
  const tr = R(p, 'repondez');
  const msgs: {qui: 'claude' | 'vous'; texte: string; t0: number}[] = [
    {qui: 'claude', texte: 'Votre agent, c\'est pour qui ?', t0: Math.min(tq - 0.3, p.debut + 0.3)},
    {qui: 'vous', texte: 'Pour les restaurants de Lomé.', t0: tr - 0.2},
    {qui: 'claude', texte: 'Il doit prendre les commandes ?', t0: tr + 1.0},
    {qui: 'vous', texte: 'Oui, sur WhatsApp !', t0: tr + 2.0},
  ];
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Claude pose des questions, vous répondez" emoji="❓" />
      <div style={{position: 'absolute', left: 360, top: 210, width: 1200, display: 'flex', flexDirection: 'column', gap: 26, fontFamily: POLICE}}>
        {msgs.map((m, i) => (t >= m.t0 ? (
          <div key={i} style={{alignSelf: m.qui === 'claude' ? 'flex-start' : 'flex-end', display: 'flex', alignItems: 'center', gap: 18,
            flexDirection: m.qui === 'claude' ? 'row' : 'row-reverse', transform: `scale(${pop(t, m.t0, 0.35)})`, transformOrigin: m.qui === 'claude' ? 'left' : 'right'}}>
            <div style={{fontSize: 64}}>{m.qui === 'claude' ? '🧭' : '🙋🏾'}</div>
            <div style={{background: m.qui === 'claude' ? '#2a2f6e' : OR, color: m.qui === 'claude' ? BLANC : NUIT, fontSize: 44, fontWeight: 700, borderRadius: 30,
              padding: '18px 30px'}}>{m.texte}</div>
          </div>
        ) : null))}
      </div>
      <div style={{position: 'absolute', right: 70, top: 830, fontFamily: POLICE, fontSize: 26, color: '#ffffff99'}}>Exemple</div>
    </>
  );
};

const AnimNoms: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tp = R(p, 'propose');
  const noms = ['Kekeli', 'Codia', 'Lumio'];
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Pas de nom ? Claude en propose" emoji="💡" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: POLICE}}>
        {noms.map((n, i) => {
          const choisi = i === 0 && t > tp + 1.6;
          return (
            <div key={n} style={{background: choisi ? OR : '#1b2470', color: choisi ? NUIT : BLANC, fontSize: 64, fontWeight: 800, borderRadius: 30, padding: '30px 50px',
              boxShadow: `0 0 0 4px ${choisi ? OR : VIOLET}, 0 20px 40px #0009`, transform: `scale(${pop(t, Math.min(tp - 0.4, p.debut + 0.3) + i * 0.35) * (choisi ? 1.12 : 1)}) translateY(${Math.sin(t * 2 + i) * 8}px)`}}>
              {n}{choisi ? ' ✅' : ''}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 70, top: 830, fontFamily: POLICE, fontSize: 26, color: '#ffffff99'}}>Exemples</div>
    </>
  );
};

const Noeud: React.FC<{x: number; y: number; emoji: string; nom: string; t: number; t0: number; couleur?: string; secoue?: number}> = ({x, y, emoji, nom, t, t0, couleur = '#1b2470', secoue = 0}) => (
  <div style={{position: 'absolute', left: x - 110, top: y - 110, width: 220, textAlign: 'center', fontFamily: POLICE, transform: `translateX(${secoue * Math.sin(t * 40) * 8}px)`}}>
    <Bulle t={t} t0={t0} emoji={emoji} taille={220} couleur={couleur} />
    <div style={{marginTop: 14, fontSize: 38, fontWeight: 800, color: BLANC, opacity: fondu(t, t0 + 0.2, t0 + 0.5), whiteSpace: 'nowrap', marginLeft: -100, marginRight: -100}}>{nom}</div>
  </div>
);

const AnimRegleDor: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tj = R(p, 'jamais');
  const ti = R(p, 'infos');
  const tp = R(p, 'probleme');
  const td = R(p, 'debloque');
  const prob = fondu(t, tp, tp + 0.2) * (1 - fondu(t, td + 0.2, td + 0.5));
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La règle d'or" emoji="🥇" />
      <Noeud x={300} y={460} emoji="🙋🏾" nom="Vous" t={t} t0={p.debut + 0.2} />
      <Noeud x={960} y={460} emoji="🧭" nom="Le chef de projet" t={t} t0={p.debut + 0.5} couleur="#3b2a7a" />
      <Noeud x={1620} y={460} emoji="🤖" nom="Claude Code" t={t} t0={p.debut + 0.8} couleur={prob > 0.5 ? '#6a1f2a' : '#1b2470'} secoue={prob} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <Fleche id="rg1" d="M 430 460 L 820 460" t={t} t0={p.debut + 0.9} />
        <Fleche id="rg2" d="M 1090 460 L 1480 460" t={t} t0={p.debut + 1.2} />
        <Fleche id="rg3" d="M 300 660 C 700 960, 1250 960, 1620 660" t={t} t0={tj} couleur={ROUGE} largeur={7} duree={0.5} />
      </svg>
      {t >= tj + 0.4 ? (
        <div style={{position: 'absolute', left: 925, top: 760, fontSize: 110, color: ROUGE, fontWeight: 800, transform: `scale(${pop(t, tj + 0.4)})`, fontFamily: POLICE}}>✗</div>
      ) : null}
      {t >= tj + 0.6 ? <Legende t={t} t0={tj + 0.6} texte="Jamais rien dans Claude Code sans le chef de projet" couleur={ROUGE} y={880} taille={38} /> : null}
      {/* il a toutes les informations */}
      {['📄', '📋', '🖼️'].map((e, i) => {
        const k = doux(t, ti + i * 0.25, ti + i * 0.25 + 0.7);
        return t >= ti + i * 0.25 && t < tp ? (
          <div key={i} style={{position: 'absolute', left: interpolate(k, [0, 1], [300 + i * 60, 930]), top: interpolate(k, [0, 1], [250, 400]) - Math.sin(k * Math.PI) * 120,
            fontSize: 70, opacity: 1 - fondu(k, 0.85, 1)}}>{e}</div>
        ) : null;
      })}
      {t >= ti && t < tp ? <Legende t={t} t0={ti + 0.2} texte="Il a toutes les informations" couleur={VIOLET} y={190} taille={38} /> : null}
      {t >= tp && t < td + 0.3 ? <Legende t={t} t0={tp} texte="⚠️ Un problème ?" couleur={ROUGE} y={190} taille={40} /> : null}
      {t >= td - 0.1 ? (
        <>
          <div style={{position: 'absolute', left: interpolate(doux(t, td - 0.1, td + 0.6), [0, 1], [960, 1560]), top: 270, fontSize: 90, transform: `scale(${pop(t, td - 0.1)})`}}>🔓</div>
          <Legende t={t} t0={td + 0.3} texte="Il comprend tout de suite et vous débloque ✅" couleur={VERT} y={190} taille={38} />
        </>
      ) : null}
    </>
  );
};

const AnimCorrections: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const ts = [Math.min(R(p, 'c1'), p.debut + 0.5), R(p, 'c2'), R(p, 'c3')];
  const vids = p.videos as (string | null)[];
  const textes = ['Mobile Money vérifié à la main, sur capture d\'écran', 'Pas de 2e nom de domaine pour les sites des clients', 'Prix des modèles d\'IA : des estimations'];
  const icones = ['💳', '🌐', '💰'];
  const actif = ts.reduce((k, x, i) => (t >= x - 0.1 ? i : k), -1);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Les 3 corrections" emoji="🛠️" />
      {ts.map((t0, i) => (
        <Carton key={i} x={90 + i * 600} y={210} l={540} h={640} couleur={[VERT, VIOLET, OR][i]} t={t} t0={t0 - 0.2} actif={actif === i ? 1 : 0}>
          <div style={{height: 290, borderRadius: 18, overflow: 'hidden', background: '#05081c', position: 'relative'}}>
            {vids[i] ? (
              <Sequence from={Math.round((t0 - 0.2) * FPS)} layout="none">
                <OffthreadVideo src={staticFile(vids[i] as string)} muted style={{width: 468, height: 290, objectFit: 'cover'}} />
              </Sequence>
            ) : (
              <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
                <div style={{width: 420, background: '#e9ecf8', borderRadius: 40, padding: '18px 26px', fontSize: 30, color: NUIT, fontWeight: 700, position: 'relative'}}>
                  🔒 www.site-du-client.com
                  <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 8, background: ROUGE, borderRadius: 4,
                    transform: `scaleX(${doux(t, t0 + 0.8, t0 + 1.3)}) rotate(-6deg)`, transformOrigin: 'left'}} />
                </div>
              </div>
            )}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 26}}>
            <span style={{fontSize: 64}}>{icones[i]}</span><span style={{fontSize: 60, fontWeight: 800, color: [VERT, VIOLET, OR][i]}}>{i + 1}</span>
          </div>
          <div style={{fontSize: 38, fontWeight: 800, lineHeight: 1.25, marginTop: 10}}>{textes[i]}</div>
        </Carton>
      ))}
    </>
  );
};

const Coffre: React.FC<{ferme: number; lueur: number}> = ({ferme, lueur}) => (
  <svg width={380} height={380} viewBox="0 0 330 330" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${30 * lueur}px ${OR})`}}>
    <rect x={20} y={30} width={290} height={270} rx={26} fill="#2c3462" stroke={OR} strokeWidth={6} />
    <rect x={45} y={55} width={240} height={220} rx={16} fill="#11163a" />
    <g transform={`translate(45 55) scale(${interpolate(ferme, [0, 1], [0.08, 1])} 1)`}>
      <rect width={240} height={220} rx={16} fill="#3a4580" stroke="#5b67a8" strokeWidth={4} />
      <circle cx={120} cy={110} r={58} fill="none" stroke={OR} strokeWidth={8} opacity={ferme} />
      {[0, 60, 120].map((a) => <rect key={a} x={116} y={58} width={8} height={104} rx={4} fill={OR} opacity={ferme} transform={`rotate(${a + ferme * 180} 120 110)`} />)}
    </g>
  </svg>
);

const Doc: React.FC<{lignes: number}> = ({lignes}) => (
  <div style={{width: 230, height: 280, background: '#e9ecf8', borderRadius: 18, padding: 22, boxShadow: '0 18px 40px #0009', fontFamily: POLICE}}>
    <div style={{fontSize: 30, fontWeight: 800, color: NUIT}}>{'</>'} Kekeli</div>
    {Array.from({length: 6}, (_, i) => (
      <div key={i} style={{height: 14, borderRadius: 7, marginTop: 16, width: `${60 + ((i * 37) % 40)}%`, background: i < lignes ? (i >= 3 ? VIOLET : NUIT) : '#c9cee3', opacity: i < lignes ? 1 : 0.5}} />
    ))}
  </div>
);

const AnimPullRequest: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const r = {copie: R(p, 'copie'), verifie: R(p, 'verifie'), fusionne: R(p, 'fusionne'), depot: R(p, 'depot'), coffre: R(p, 'coffre'), ranger: R(p, 'ranger')};
  const sortie = doux(t, r.copie - 0.3, r.copie + 0.6);
  const travail = interpolate(t, [r.copie + 0.6, r.verifie - 0.2], [3, 6], CLAMP);
  const retour = doux(t, r.fusionne, r.depot + 0.4);
  const xCopie = interpolate(sortie, [0, 1], [-820, 0]) + interpolate(retour, [0, 1], [0, -780]);
  const yCopie = interpolate(retour, [0, 1], [0, 40]);
  const echCopie = interpolate(retour, [0.7, 1], [1.3, 0.35], CLAMP);
  const ferme = doux(t, r.coffre - 0.2, r.coffre + 0.6);
  const verifie = pop(t, r.verifie, 0.45);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La pull request" emoji="🔀" />
      <div style={{position: 'absolute', left: 330, top: 260, transform: `scale(${1.2 * pop(t, p.debut + 0.2, 0.5)})`, transformOrigin: '50% 40%'}}>
        <Coffre ferme={ferme} lueur={fondu(t, r.coffre, r.coffre + 0.3) * (1 - fondu(t, r.coffre + 1.2, r.coffre + 2))} />
        <div style={{textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 36, color: OR, marginTop: 10}}>Le dépôt</div>
        <div style={{textAlign: 'center', fontFamily: POLICE, fontWeight: 600, fontSize: 28, color: BLANC, opacity: 0.85}}>votre coffre-fort</div>
      </div>
      <div style={{position: 'absolute', left: 1220, top: 300, transform: `translate(${xCopie}px, ${yCopie}px) scale(${echCopie})`, transformOrigin: '50% 50%', opacity: fondu(t, r.copie - 0.3, r.copie)}}>
        <Doc lignes={Math.floor(travail)} />
        <div style={{position: 'absolute', left: -20, top: -60, background: VIOLET, color: BLANC, fontFamily: POLICE, fontWeight: 800, fontSize: 28,
          borderRadius: 14, padding: '6px 16px', opacity: 1 - retour}}>🤖 La copie de Claude Code</div>
        <div style={{position: 'absolute', right: -40, top: 110, width: 110, height: 110, borderRadius: '50%', background: VERT, display: 'grid', placeItems: 'center',
          fontSize: 70, color: BLANC, transform: `scale(${verifie}) rotate(${(1 - verifie) * -40}deg)`, boxShadow: `0 0 30px ${VERT}`, opacity: 1 - retour}}>✓</div>
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <Fleche id="pr1" d="M 760 380 C 900 250, 1050 250, 1170 330" t={t} t0={r.copie - 0.4} couleur={VIOLET} duree={0.8} />
        <Fleche id="pr2" d="M 1290 720 C 1120 860, 900 860, 760 690" t={t} t0={r.fusionne - 0.2} largeur={10} duree={0.7} />
      </svg>
      <div style={{position: 'absolute', left: 690, top: 470, fontFamily: POLICE, fontWeight: 800, fontSize: 31, color: VIOLET, opacity: fondu(t, r.copie, r.copie + 0.3) * (1 - fondu(t, r.fusionne, r.fusionne + 0.3))}}>1. Il travaille sur une copie</div>
      <div style={{position: 'absolute', left: 1340, top: 760, fontFamily: POLICE, fontWeight: 800, fontSize: 38, color: VERT, opacity: fondu(t, r.verifie, r.verifie + 0.3) * (1 - fondu(t, r.fusionne, r.fusionne + 0.3))}}>2. Le travail est vérifié</div>
      <div style={{position: 'absolute', left: 780, top: 870, fontFamily: POLICE, fontWeight: 800, fontSize: 42, color: OR, opacity: fondu(t, r.fusionne, r.fusionne + 0.3) * (1 - fondu(t, r.ranger - 0.3, r.ranger))}}>3. On fusionne dans le dépôt</div>
      {t >= r.ranger - 0.1 ? <Legende t={t} t0={r.ranger - 0.1} texte="Fusionner = ranger le travail terminé à sa place" /> : null}
    </>
  );
};

const Pastille: React.FC<{couleur: string; signe: string; t: number; t0: number}> = ({couleur, signe, t, t0}) => (
  <div style={{width: 64, height: 64, borderRadius: '50%', background: couleur, display: 'grid', placeItems: 'center', fontSize: 40, color: BLANC, fontWeight: 800,
    transform: `scale(${pop(t, t0, 0.35)})`, boxShadow: `0 0 20px ${couleur}`}}>{signe}</div>
);

const AnimRegle: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const r = {vertes: R(p, 'vertes'), fusionne: R(p, 'fusionne'), rouges: R(p, 'rouges'), vert: R(p, 'vert')};
  const tourne = interpolate(t, [r.rouges + 0.6, r.vert], [0, 360], CLAMP);
  const repare = fondu(t, r.vert - 0.4, r.vert);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La règle de fusion" emoji="📜" />
      <Carton x={150} y={250} l={760} h={560} couleur={VERT} t={t} t0={p.debut + 0.1}>
        <div style={{fontSize: 50, fontWeight: 800, color: VERT}}>Vérifications vertes</div>
        <div style={{display: 'flex', gap: 22, marginTop: 30}}>{[0, 1, 2].map((i) => <Pastille key={i} couleur={VERT} signe="✓" t={t} t0={r.vertes + i * 0.25} />)}</div>
        <div style={{marginTop: 50, fontSize: 46, fontWeight: 800, lineHeight: 1.2, opacity: fondu(t, r.fusionne - 0.2, r.fusionne + 0.2)}}>→ Claude Code fusionne tout seul 🔀</div>
      </Carton>
      <Carton x={1010} y={250} l={760} h={560} couleur={ROUGE} t={t} t0={p.debut + 0.3}>
        <div style={{fontSize: 50, fontWeight: 800, color: ROUGE}}>Vérifications rouges</div>
        <div style={{display: 'flex', gap: 22, marginTop: 30, alignItems: 'center'}}>
          <Pastille couleur={VERT} signe="✓" t={t} t0={r.rouges} />
          <div style={{transform: `rotate(${tourne}deg)`}}><Pastille couleur={repare > 0.5 ? VERT : ROUGE} signe={repare > 0.5 ? '✓' : '✗'} t={t} t0={r.rouges + 0.25} /></div>
          <Pastille couleur={VERT} signe="✓" t={t} t0={r.rouges + 0.5} />
        </div>
        <div style={{marginTop: 50, fontSize: 44, fontWeight: 800, lineHeight: 1.25, opacity: fondu(t, r.rouges + 0.4, r.rouges + 0.8)}}>→ il corrige, renvoie,<br />et attend le vert 🔁</div>
      </Carton>
    </>
  );
};

const AnimAppli: React.FC<{p: Plan; t: number}> = ({p, t}) => (
  <>
    <Titre t={t} t0={p.debut} texte="Le résultat de l'étape 1" emoji="🎉" />
    <Telephone src="formation/p2/illus/appli_384.png" x={560} rot={-4} t={t} t0={p.debut + 0.15} legende="La page « Mes projets »" />
    <Telephone src="formation/p2/illus/appli_402.png" x={1030} rot={4} t={t} t0={R(p, 'resultat') + 0.9} legende="Créer un nouveau projet" />
  </>
);

const ETAPES_BOUCLE = [
  {e: '🧭', t: 'Le chef de projet donne la consigne'},
  {e: '🤖', t: 'Claude Code construit'},
  {e: '📋', t: 'Vous copiez son compte rendu au chef'},
  {e: '🔍', t: 'Le chef vérifie et vous dit quoi faire'},
  {e: '✅', t: 'On valide, étape suivante'},
];
const AnimBoucle: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const ts = ['b1', 'b2', 'b3', 'b4', 'b5'].map((k) => R(p, k));
  const tf = R(p, 'fin');
  const actif = ts.reduce((k, x, i) => (t >= x - 0.2 ? i : k), -1);
  const cx = 960;
  const cy = 540;
  const rayon = 330;
  const rot = t >= tf ? (t - tf) * 90 : 0;
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Retenez la boucle" emoji="🔁" y={40} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <circle cx={cx} cy={cy} r={rayon} fill="none" stroke="#39407a" strokeWidth={10} strokeDasharray="30 18" transform={`rotate(${rot + t * 6} ${cx} ${cy})`} />
        {actif >= 0 ? <circle cx={cx} cy={cy} r={rayon} fill="none" stroke={OR} strokeWidth={10} pathLength={1} strokeDasharray={`${(actif + 1) / 5} 1`}
          transform={`rotate(-90 ${cx} ${cy})`} opacity={0.9} /> : null}
      </svg>
      <div style={{position: 'absolute', left: cx - 200, top: cy - 80, width: 400, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 52, color: OR,
        transform: `rotate(${t >= tf ? Math.sin((t - tf) * 3) * 4 : 0}deg)`}}>Étape<br />par étape</div>
      {ETAPES_BOUCLE.map((s, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const x = cx + rayon * Math.cos(a);
        const y = cy + rayon * Math.sin(a);
        const on = actif === i;
        const vu = t >= ts[i] - 0.2;
        const gauche = Math.cos(a) < -0.2;
        const droite = Math.cos(a) > 0.2;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: '50%', background: on ? OR : '#1b2470',
              boxShadow: `0 0 0 5px ${vu ? OR : '#39407a'}, 0 0 ${on ? 50 : 0}px ${OR}`, display: 'grid', placeItems: 'center', fontSize: 70,
              transform: `scale(${vu ? pop(t, ts[i] - 0.2) * (on ? 1.12 : 1) : 0.8})`, opacity: vu ? 1 : 0.4}}>{s.e}</div>
            <div style={{position: 'absolute', top: y - 30, left: gauche ? x - 560 : x + 90, width: 470,
              textAlign: gauche ? 'right' : 'left', fontFamily: POLICE, fontWeight: 800, fontSize: on ? 38 : 32, color: on ? BLANC : '#c9cee3',
              opacity: vu ? 1 : 0}}><span style={{color: OR}}>{i + 1}. </span>{s.t}</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

const AnimFin: React.FC<{p: Plan; t: number}> = ({p, t}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 60, color: OR, letterSpacing: 6,
      transform: `scale(${pop(t, p.debut)})`}}>{String(p.entete ?? 'DANS LA PROCHAINE VIDÉO')}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 320, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: OR, color: NUIT, fontFamily: POLICE, fontWeight: 800, fontSize: 56, borderRadius: 24, padding: '10px 36px', transform: `scale(${pop(t, p.debut + 0.3)})`}}>{String(p.code)}</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: POLICE}}>
      <span style={{fontSize: 96, transform: `scale(${pop(t, R(p, 'moteur') - 0.2)}) rotate(${Math.sin(t * 3) * 8}deg)`}}>{(p.icones as string[] | undefined)?.[0] ?? '⚙️'}</span>
      <span style={{fontSize: 64, fontWeight: 800, color: BLANC, opacity: fondu(t, R(p, 'moteur') - 0.2, R(p, 'moteur') + 0.1)}}>{String(p.titre)}</span>
      <span style={{fontSize: 96, transform: `scale(${pop(t, R(p, 'moteur') + 0.6)})`}}>{(p.icones as string[] | undefined)?.[1] ?? '🧠'}</span>
    </div>
    {t >= R(p, 'moins') - 0.3 ? <Legende t={t} t0={R(p, 'moins') - 0.3} texte={String(p.sous)} y={660} taille={52} /> : null}
  </>
);


const AnimComptes: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const ta = Math.min(R(p, 'anthropic'), p.debut + 0.3);
  const te = R(p, 'e2b');
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Il me demande deux comptes" emoji="🗂️" />
      <Carton x={170} y={220} l={740} h={600} couleur={VIOLET} t={t} t0={ta} actif={t < te - 0.2 ? 1 : 0.6}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{fontSize: 120, transform: `scale(${1 + 0.05 * Math.sin(t * 4)})`}}>🧠</div>
          <div><div style={{fontSize: 60, fontWeight: 800, color: VIOLET}}>Anthropic</div><div style={{fontSize: 36, fontWeight: 700}}>Le cerveau de l'agent</div></div>
        </div>
        <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 20, fontSize: 46, fontWeight: 800, color: ROUGE, opacity: fondu(t, ta + 1.2, ta + 1.6)}}>
          <span style={{fontSize: 80, transform: `rotate(${Math.sin(t * 6) * 10}deg)`}}>💸</span> Payant à l'utilisation
        </div>
      </Carton>
      <Carton x={1010} y={220} l={740} h={600} couleur={OR} t={t} t0={te - 0.2} actif={t >= te - 0.2 ? 1 : 0.6}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{fontSize: 120}}>🖥️</div>
          <div><div style={{fontSize: 60, fontWeight: 800, color: OR}}>E2B</div><div style={{fontSize: 36, fontWeight: 700}}>Ses ordinateurs virtuels</div></div>
        </div>
        <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 20, fontSize: 46, fontWeight: 800, color: VERT, opacity: fondu(t, te + 1.6, te + 2)}}>
          <span style={{fontSize: 80, transform: `scale(${pop(t, te + 1.6)})`}}>🎁</span> Crédit gratuit au départ
        </div>
      </Carton>
    </>
  );
};

const AnimJauge: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tv = R(p, 'vide');
  const ts = R(p, 'suffit');
  const niveau = 1 - doux(t, tv, ts + 0.6);
  const clients = 12;
  return (
    <>
      <Titre t={t} t0={p.debut} texte="2e limite : de vrais clients" emoji="👥" />
      <div style={{position: 'absolute', left: 250, top: 230, width: 260, height: 560, borderRadius: 40, background: '#0d1440', boxShadow: `0 0 0 6px ${OR}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${niveau * 100}%`, background: niveau > 0.3 ? `linear-gradient(0deg, ${VERT}, #7af0b0)` : ROUGE}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 64, color: BLANC}}>{Math.round(niveau * 100)} %</div>
      </div>
      <div style={{position: 'absolute', left: 190, width: 380, top: 820, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 38, color: OR}}>Offre gratuite</div>
      <div style={{position: 'absolute', left: 700, top: 260, width: 1050, display: 'flex', flexWrap: 'wrap', gap: 30}}>
        {Array.from({length: clients}, (_, i) => (
          <div key={i} style={{fontSize: 92, transform: `scale(${pop(t, tv + 0.3 + i * 0.25)})`}}>{['🧑🏾', '👩🏾', '👨🏿', '👩🏿'][i % 4]}</div>
        ))}
      </div>
      {t >= ts - 0.1 ? <Legende t={t} t0={ts - 0.1} texte="Avec de vrais clients, l'offre gratuite ne suffira pas" couleur={ROUGE} y={800} x={600} l={1250} taille={40} /> : null}
    </>
  );
};

const AnimDeuxParties: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tm = R(p, 'moteur');
  const tc = R(p, 'cerveau');
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Un agent a deux parties" emoji="🤖" />
      <Carton x={170} y={220} l={740} h={600} couleur={OR} t={t} t0={Math.min(tm, p.debut + 0.4) - 0.2} actif={t < tc - 0.2 ? 1 : 0.6}>
        <div style={{fontSize: 130, textAlign: 'center', transform: `rotate(${t * 60}deg)`}}>⚙️</div>
        <div style={{fontSize: 62, fontWeight: 800, color: OR, textAlign: 'center'}}>Le moteur</div>
        <div style={{fontSize: 40, fontWeight: 700, textAlign: 'center', marginTop: 16, lineHeight: 1.25}}>Le programme qui fait <b>agir</b> l'agent :<br />lire, écrire, travailler<br />sur les fichiers</div>
      </Carton>
      <Carton x={1010} y={220} l={740} h={600} couleur={VIOLET} t={t} t0={tc - 0.2} actif={t >= tc - 0.2 ? 1 : 0.6}>
        <div style={{fontSize: 130, textAlign: 'center', transform: `scale(${1 + 0.07 * Math.sin(t * 5)})`}}>🧠</div>
        <div style={{fontSize: 62, fontWeight: 800, color: VIOLET, textAlign: 'center'}}>Le cerveau</div>
        <div style={{fontSize: 40, fontWeight: 700, textAlign: 'center', marginTop: 16, lineHeight: 1.25}}>Le modèle d'IA<br />qui le fait <b>réfléchir</b></div>
      </Carton>
    </>
  );
};

const Pompe: React.FC<{x: number; nom: string; couleur: string; t: number; t0: number; prix?: string; actif?: boolean}> = ({x, nom, couleur, t, t0, prix, actif}) => (
  <div style={{position: 'absolute', left: x, top: 260, width: 220, textAlign: 'center', fontFamily: POLICE, transform: `scale(${pop(t, t0)}) translateY(${actif ? -10 * Math.abs(Math.sin(t * 4)) : 0}px)`}}>
    <div style={{height: 300, borderRadius: 26, background: couleur, boxShadow: actif ? `0 0 40px ${couleur}` : '0 20px 40px #0008', display: 'grid', placeItems: 'center', fontSize: 110}}>⛽</div>
    <div style={{marginTop: 14, fontSize: 40, fontWeight: 800, color: BLANC}}>{nom}</div>
    {prix ? <div style={{fontSize: 34, fontWeight: 800, color: OR}}>{prix}</div> : null}
  </div>
);

const AnimVoiture: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const un = p.mode === 'un';
  const tv = Math.min(R(p, 'voiture'), p.debut + 0.3);
  const tc = R(p, 'chere');
  const choix = un ? 0 : Math.floor(((t - p.debut) / 1.1) % 3);
  const roule = (t * 220) % 1920;
  return (
    <>
      <Titre t={t} t0={p.debut} texte={un ? 'Le moteur prévu : un seul carburant' : 'On change de carburant à tout moment'} emoji={un ? '🚗' : '🔄'} />
      {un ? (
        <Pompe x={1250} nom="Claude" couleur={ROUGE} t={t} t0={tv + 0.5} prix={t >= tc - 0.2 ? '💰💰💰 la plus chère' : undefined} actif />
      ) : (
        ['Gemini', 'Claude', 'Autre'].map((n, i) => (
          <Pompe key={n} x={1000 + i * 270} nom={n} couleur={[VERT, VIOLET, '#3d6bd8'][i]} t={t} t0={p.debut + 0.1 + i * 0.15} prix={i === 0 ? 'gratuit' : undefined} actif={choix === i} />
        ))
      )}
      <div style={{position: 'absolute', left: un ? 300 : 220, top: 420, fontSize: 300, transform: `scaleX(-1) translateY(${Math.sin(t * 12) * 4}px) scale(${pop(t, tv, 0.5)})`}}>🚗</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, height: 10, background: `repeating-linear-gradient(90deg, ${OR} 0 80px, transparent 80px 160px)`,
        backgroundPosition: `${-roule}px 0`, opacity: 0.6}} />
      {un && t >= tc - 0.2 ? <Legende t={t} t0={tc - 0.2} texte="Une seule marque de carburant… la plus chère" couleur={ROUGE} y={840} taille={40} /> : null}
      {!un && t >= tc - 0.4 ? <Legende t={t} t0={tc - 0.4} texte="… sans reconstruire la voiture ✅" couleur={VERT} y={840} taille={40} /> : null}
    </>
  );
};


const AnimCleApi: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tv = Math.min(R(p, 'vous'), p.debut + 0.3);
  const tp = R(p, 'payez');
  const tj = R(p, 'jamais');
  const k = doux(t, tv, tv + 1);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Une clé API, c'est…" emoji="🔑" />
      <div style={{position: 'absolute', left: 160, top: 300, fontSize: 150, transform: `scale(${pop(t, p.debut + 0.1)})`}}>🙋🏾</div>
      <div style={{position: 'absolute', left: interpolate(k, [0, 1], [330, 830]), top: 330, fontSize: 120, transform: `rotate(${k * 360}deg)`}}>🔑</div>
      <div style={{position: 'absolute', left: 1180, top: 250, width: 520, height: 380, borderRadius: 34, background: '#0d1440', boxShadow: `0 0 0 5px ${t >= tv + 1 ? VERT : VIOLET}`,
        display: 'grid', placeItems: 'center', fontFamily: POLICE, transform: `scale(${pop(t, p.debut + 0.2)})`}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 110}}>🏦</div>
          <div style={{fontSize: 40, fontWeight: 800, color: BLANC}}>Le service</div>
          {t >= tv + 1 ? <div style={{fontSize: 40, fontWeight: 800, color: VERT, transform: `scale(${pop(t, tv + 1)})`}}>« C'est vous ! » ✅</div> : null}
        </div>
      </div>
      {t >= tp - 0.2 ? <Legende t={t} t0={tp - 0.2} texte="… et c'est vous qui payez 💳" couleur={OR} y={700} taille={46} /> : null}
      {t >= tj - 0.2 ? <Legende t={t} t0={tj - 0.2} texte="🔒 Ne la montrez jamais à personne" couleur={ROUGE} y={820} taille={46} /> : null}
    </>
  );
};

const AnimRangement: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tb = Math.min(R(p, 'bloc'), p.debut + 0.5);
  const tc = R(p, 'claude');
  const items: {e: string; txt: string; t0: number; ok: boolean}[] = [
    {e: '📝', txt: 'Le bloc-notes', t0: tb, ok: false},
    {e: '💬', txt: 'WhatsApp', t0: R(p, 'whatsapp'), ok: false},
    {e: '📸', txt: "Une capture d'écran", t0: R(p, 'capture'), ok: false},
    {e: '🤖', txt: 'Directement dans Claude Code', t0: tc, ok: true},
    {e: '🔐', txt: 'Un gestionnaire de mots de passe', t0: R(p, 'gestion'), ok: true},
  ];
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Où ranger vos clés ?" emoji="🗝️" />
      <div style={{position: 'absolute', left: 140, top: 190, width: 760, fontFamily: POLICE, fontSize: 48, fontWeight: 800, color: ROUGE, opacity: fondu(t, tb, tb + 0.3)}}>✗ Jamais ici</div>
      <div style={{position: 'absolute', left: 1020, top: 190, width: 760, fontFamily: POLICE, fontSize: 48, fontWeight: 800, color: VERT, opacity: fondu(t, tc - 0.2, tc + 0.1)}}>✓ Ici</div>
      {items.map((it, i) => {
        const col = it.ok ? 1020 : 140;
        const row = it.ok ? i - 3 : i;
        const v = t >= it.t0 - 0.2;
        const barre = !it.ok && i === 0 ? doux(t, R(p, 'coffre') - 0.3, R(p, 'coffre') + 0.2) : !it.ok ? doux(t, it.t0 + 0.2, it.t0 + 0.6) : 0;
        return v ? (
          <div key={i} style={{position: 'absolute', left: col, top: 280 + row * 170, width: 760, height: 140, borderRadius: 28, background: '#0d1440',
            boxShadow: `0 0 0 4px ${it.ok ? VERT : ROUGE}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', boxSizing: 'border-box', fontFamily: POLICE,
            transform: `scale(${pop(t, it.t0 - 0.2)})`}}>
            <span style={{fontSize: 80}}>{it.e}</span>
            <span style={{fontSize: 42, fontWeight: 800, color: BLANC, position: 'relative'}}>{it.txt}
              {!it.ok ? <span style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 8, background: ROUGE, borderRadius: 4, transform: `scaleX(${barre})`, transformOrigin: 'left'}} /> : null}
            </span>
          </div>
        ) : null;
      })}
      {t >= R(p, 'coffre') - 0.2 && t < tc - 0.3 ? <Legende t={t} t0={R(p, 'coffre') - 0.2} texte="Un bloc-notes n'est pas un coffre-fort !" couleur={ROUGE} y={820} taille={42} /> : null}
    </>
  );
};

const AnimMaison: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const tm = Math.min(R(p, 'maison'), p.debut + 0.4);
  const tp = R(p, 'piece');
  const ta = R(p, 'avant');
  const pieces = [
    {x: 560, txt: 'Session ouverte AVANT', ok: false},
    {x: 980, txt: 'Nouvelle session', ok: true},
  ];
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La maison et ses pièces" emoji="🏠" />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <g style={{transform: `scale(${pop(t, tm, 0.5)})`, transformOrigin: '960px 560px'}}>
          <polygon points="420,420 960,170 1500,420" fill="#2c3462" stroke={OR} strokeWidth={8} />
          <rect x={460} y={420} width={1000} height={420} fill="#121a4a" stroke={OR} strokeWidth={8} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 44, color: OR, opacity: fondu(t, tm + 0.3, tm + 0.6)}}>
        L'environnement « Kekeli »</div>
      <div style={{position: 'absolute', left: 1330, top: 350, fontSize: 70, transform: `scale(${pop(t, tm + 0.8)}) rotate(${Math.sin(t * 3) * 8}deg)`}}>🔑🔑</div>
      {pieces.map((q, i) => {
        const t0 = i === 0 ? tp : ta + 1.2;
        const voit = q.ok;
        return t >= t0 - 0.2 ? (
          <div key={i} style={{position: 'absolute', left: q.x, top: 470, width: 380, height: 320, borderRadius: 20, background: '#0d1440',
            boxShadow: `0 0 0 5px ${t >= ta ? (voit ? VERT : ROUGE) : VIOLET}`, fontFamily: POLICE, textAlign: 'center', paddingTop: 30, boxSizing: 'border-box',
            transform: `scale(${pop(t, t0 - 0.2)})`}}>
            <div style={{fontSize: 90}}>{t >= ta ? (voit ? '😀' : '🙈') : '🚪'}</div>
            <div style={{fontSize: 34, fontWeight: 800, color: BLANC, marginTop: 10}}>{i === 0 ? 'Une pièce = une session' : q.txt}</div>
            {t >= ta ? <div style={{fontSize: 32, fontWeight: 800, color: voit ? VERT : ROUGE, marginTop: 10}}>{voit ? 'voit les clés ✅' : 'ne voit pas les clés ❌'}</div> : null}
          </div>
        ) : null;
      })}
      {t >= ta - 0.1 ? <Legende t={t} t0={ta - 0.1} texte="Ouverte avant d'avoir rangé les clés = ne les verra jamais" couleur={ROUGE} y={850} taille={38} /> : null}
    </>
  );
};


const AnimAttente: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const ta = Math.min(R(p, 'attendre'), p.debut + 0.3);
  const tp = R(p, 'panique');
  const tv = R(p, 'verifier');
  const tr = R(p, 'reprenez');
  const plein = doux(t, p.debut, ta + 0.6);
  const vide = doux(t, tr - 0.3, tr + 0.6);
  const niveau = plein * (1 - vide);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La limite est atteinte ?" emoji="⏳" />
      <div style={{position: 'absolute', left: 220, top: 260, width: 220, height: 520, borderRadius: 40, background: '#0d1440', boxShadow: `0 0 0 6px ${OR}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${niveau * 100}%`, background: niveau > 0.85 ? ROUGE : OR}} />
      </div>
      <div style={{position: 'absolute', left: 520, top: 300, fontSize: 170, transform: `rotate(${(t - ta) * 90}deg)`, opacity: fondu(t, ta, ta + 0.3)}}>🕰️</div>
      <div style={{position: 'absolute', left: 500, top: 530, width: 400, textAlign: 'center', fontFamily: POLICE, fontSize: 44, fontWeight: 800, color: BLANC, opacity: fondu(t, ta, ta + 0.3)}}>Quelques heures</div>
      {t >= tp - 0.2 ? <Carton x={1000} y={240} l={760} h={170} couleur={VERT} t={t} t0={tp - 0.2}><div style={{fontSize: 50, fontWeight: 800}}>😌 Pas de panique</div></Carton> : null}
      {t >= tv - 0.2 ? <Carton x={1000} y={440} l={760} h={170} couleur={OR} t={t} t0={tv - 0.2}><div style={{fontSize: 46, fontWeight: 800}}>🔍 Vérifiez le travail</div></Carton> : null}
      {t >= tr - 0.2 ? <Carton x={1000} y={640} l={760} h={170} couleur={VIOLET} t={t} t0={tr - 0.2}><div style={{fontSize: 46, fontWeight: 800}}>▶️ Reprenez où vous étiez</div></Carton> : null}
    </>
  );
};

// ---------------------------------------------------------------- vidéo libre de droits (plein écran)
const Libre: React.FC<{p: Plan; t: number; dossier: string}> = ({p, t, dossier}) => {
  const e = t - p.debut;
  const zoom = 1.04 + 0.06 * (e / Math.max(1, p.fin - p.debut));
  const src = staticFile(`formation/${dossier}/${p.fichier}.mp4`);
  return (
    <>
      {p.vertical ? (
        <>
          <Sequence from={Math.round(p.debut * FPS)} layout="none">
            <OffthreadVideo src={src} muted style={{position: 'absolute', left: 0, top: -420, width: 1920, height: 3413, objectFit: 'cover', filter: 'blur(30px) brightness(0.5)'}} />
          </Sequence>
          <div style={{position: 'absolute', left: 960 - 304, top: 40, width: 608, height: 1000, borderRadius: 30, overflow: 'hidden', boxShadow: `0 0 0 5px ${OR}, 0 30px 70px #000c`}}>
            <Sequence from={Math.round(p.debut * FPS)} layout="none">
              <OffthreadVideo src={src} muted style={{width: 608, height: 1080, objectFit: 'cover', transform: `scale(${zoom})`}} />
            </Sequence>
          </div>
        </>
      ) : (
        <AbsoluteFill style={{transform: `scale(${zoom})`}}>
          <Sequence from={Math.round(p.debut * FPS)} layout="none"><OffthreadVideo src={src} muted style={{width: 1920, height: 1080, objectFit: 'cover'}} /></Sequence>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #02062999 0%, #02062900 30%, #02062900 60%, #020629cc 100%)'}} />
      {p.titre ? <Titre t={t} t0={p.debut} texte={p.titre} /> : null}
      <Legende t={t} t0={p.tLegende ?? p.debut + 0.2} texte={p.legende ?? ''} y={p.vertical ? 820 : 800} taille={p.vertical ? 40 : 50} />
      <div style={{position: 'absolute', right: 30, top: 1040, fontFamily: POLICE, fontSize: 18, color: '#ffffff88'}}>Vidéo libre de droits · Mixkit</div>
    </>
  );
};

// ---------------------------------------------------------------- démonstration plein écran avec surlignage
const TEL = {x: 64, y: 120, h: 900};
const PAN = {x: 620, y: 185, l: 1240, h: 725};
const W = 1080;
const H = 2160;

const zoomA = (p: Plan, t: number) => {
  const z = p.zooms!;
  let cur = z[0];
  for (let i = 1; i < z.length; i++) {
    const k = doux(t, z[i].t - 0.3, z[i].t + 0.4);
    if (k > 0) cur = {t: 0, x: cur.x + (z[i].x - cur.x) * k, y: cur.y + (z[i].y - cur.y) * k, f: cur.f + (z[i].f - cur.f) * k};
  }
  const f = Math.max(PAN.l / W, interpolate(doux(t, p.debut + 0.1, p.debut + 0.8), [0, 1], [cur.f * 0.7, cur.f]));
  const lw = PAN.l / f;
  const lh = PAN.h / f;
  return {f, x0: Math.min(Math.max(cur.x - lw / 2, 0), W - lw), y0: Math.min(Math.max(cur.y - lh / 2, 0), H - lh), lw, lh};
};

const Surlignes: React.FC<{p: Plan; t: number; ech: number}> = ({p, t, ech}) => {
  const s = p.surlignes ?? [];
  const i = s.reduce((k, x, j) => (t >= x.t - 0.2 ? j : k), -1);
  if (i < 0) return null;
  const x = s[i];
  const k = doux(t, x.t - 0.2, x.t + 0.25);
  return (
    <div style={{position: 'absolute', left: x.x0 * ech - 6, top: x.y0 * ech - 6, width: (x.x1 - x.x0) * ech * k + 12, height: (x.y1 - x.y0) * ech + 12, borderRadius: 10,
      background: `${OR}33`, boxShadow: `0 0 0 ${Math.max(3, ech * 2)}px ${OR}, 0 0 ${ech * 18}px ${OR}aa`}} />
  );
};

const Demo: React.FC<{p: Plan; t: number; dossier: string}> = ({p, t, dossier}) => {
  const ech = TEL.h / H;
  const telL = W * ech;
  const {f, x0, y0, lw, lh} = zoomA(p, t);
  const src = staticFile(`formation/${dossier}/${p.fichier}.mp4`);
  const e = t - p.debut;
  const entree = doux(t, p.debut, p.debut + 0.45);
  const leg = (p.legendes ?? []).filter((l) => t >= l.t - 0.1).pop();
  return (
    <>
      <div style={{position: 'absolute', left: TEL.x - 14, top: TEL.y - 14, width: telL + 28, height: TEL.h + 28, borderRadius: 40, background: '#05081c',
        boxShadow: '0 0 0 3px #39407a, 0 20px 50px #000a', transform: `translateX(${(1 - entree) * -500}px)`}} />
      <div style={{position: 'absolute', left: TEL.x, top: TEL.y, width: telL, height: TEL.h, overflow: 'hidden', borderRadius: 28, transform: `translateX(${(1 - entree) * -500}px)`}}>
        <Sequence from={Math.round(p.debut * FPS)} layout="none"><OffthreadVideo src={src} muted style={{width: telL, height: TEL.h}} /></Sequence>
        <Surlignes p={p} t={t} ech={ech} />
        <div style={{position: 'absolute', left: x0 * ech, top: y0 * ech, width: lw * ech, height: lh * ech, border: `4px solid ${OR}`, borderRadius: 8, boxShadow: '0 0 0 2000px #02062955'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <path d={`M ${TEL.x + (x0 + lw) * ech} ${TEL.y + (y0 + lh / 2) * ech} C ${PAN.x - 60} ${TEL.y + (y0 + lh / 2) * ech}, ${PAN.x - 80} ${PAN.y + PAN.h / 2}, ${PAN.x} ${PAN.y + PAN.h / 2}`}
          fill="none" stroke={OR} strokeWidth={4} opacity={entree} />
      </svg>
      <div style={{position: 'absolute', left: PAN.x, top: PAN.y, width: PAN.l, height: PAN.h, overflow: 'hidden', borderRadius: 24, background: '#000',
        boxShadow: `0 0 0 5px ${OR}, 0 24px 60px #000c`, transform: `scale(${interpolate(entree, [0, 1], [0.85, 1])})`, opacity: entree}}>
        <div style={{position: 'absolute', left: -x0 * f, top: -y0 * f, width: W * f, height: H * f}}>
          <Sequence from={Math.round(p.debut * FPS)} layout="none"><OffthreadVideo src={src} muted style={{width: W * f, height: H * f}} /></Sequence>
          <Surlignes p={p} t={t} ech={f} />
        </div>
      </div>
      <div style={{position: 'absolute', left: PAN.x, top: 62, width: PAN.l, fontFamily: POLICE, fontWeight: 800, fontSize: (p.bandeau ?? '').length > 48 ? 38 : 44,
        color: BLANC, transform: `translateY(${(1 - fondu(e, 0, 0.3)) * -20}px)`, opacity: fondu(e, 0, 0.3)}}>{p.bandeau}</div>
      {leg ? <Legende key={leg.t} t={t} t0={leg.t} texte={leg.texte} x={PAN.x} l={PAN.l} y={800} taille={40} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- carte avec Coach Joseph
const Bureau: React.FC<{etat: EtatDouble}> = ({etat}) => (
  <>
    <div style={{position: 'absolute', left: 800, top: -990, width: 1080, height: 1920, transform: 'scale(1.12)', transformOrigin: '0 0'}}>
      <Scene2D etat={etat} ecran={<></>} />
    </div>
    <div style={{position: 'absolute', left: 800, top: 0, width: 300, height: 1080, background: `linear-gradient(90deg, ${NUIT}, ${NUIT}00)`}} />
  </>
);

const ICONES = ['💬', '📸', '🧭'];
const Carte: React.FC<{p: Plan; t: number}> = ({p, t}) => (
  <div style={{position: 'absolute', left: 80, top: 140, width: 760, fontFamily: POLICE, color: BLANC}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: fondu(t, p.debut, p.debut + 0.3)}}>
      <div style={{fontSize: 84, transform: `scale(${pop(t, p.debut + 0.05, 0.45)})`}}>{p.emoji}</div>
      <div style={{fontSize: 52, fontWeight: 800, lineHeight: 1.1}}>{p.titre}</div>
    </div>
    <div style={{height: 6, borderRadius: 3, background: OR, marginTop: 18, width: 320 * fondu(t, p.debut + 0.2, p.debut + 0.6)}} />
    <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 26}}>
      {(p.points ?? []).map((pt, i) => {
        const d = p.instants?.[i] ?? p.debut;
        const v = t >= d - 0.1;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, opacity: v ? 1 : 0.15, transform: `translateX(${v ? (1 - doux(t, d - 0.1, d + 0.3)) * -60 : 0}px)`}}>
            <div style={{flex: 'none', width: 92, height: 92, borderRadius: 26, background: '#1b2470', boxShadow: `0 0 0 4px ${OR}`, display: 'grid', placeItems: 'center', fontSize: 50,
              transform: `scale(${v ? pop(t, d - 0.1) : 1})`}}>{(p.icones ?? ICONES)[i % 3]}</div>
            <div style={{fontSize: 42, fontWeight: 800, lineHeight: 1.2}}><span style={{color: OR}}>{i + 1}.</span> {pt.texte}</div>
          </div>
        );
      })}
    </div>
  </div>
);

// ---------------------------------------------------------------- sous-titres
type Bloc = {mots: Mot[]; debut: number; fin: number};
const blocs = (mots: Mot[]): Bloc[] => {
  const out: Bloc[] = [];
  let cur: Mot[] = [];
  const fermer = () => {
    if (cur.length) out.push({mots: cur, debut: cur[0].debut, fin: cur[cur.length - 1].fin});
    cur = [];
  };
  mots.forEach((m, i) => {
    const prec = cur[cur.length - 1];
    const lettres = cur.reduce((s, x) => s + x.texte.length + 1, 0) + m.texte.length;
    if (prec && (m.debut - prec.fin > 0.5 || lettres > 42 || cur.length >= 7 || m.debut - cur[0].debut > 3)) fermer();
    cur.push(m);
    const suivant = mots[i + 1];
    if (/[.?!»]$/.test(m.texte) && (!suivant || suivant.debut - m.fin > 0.15)) fermer();
  });
  fermer();
  return out;
};

const SousTitres: React.FC<{liste: Bloc[]; t: number; gauche: number}> = ({liste, t, gauche}) => {
  const i = liste.findIndex((b, k) => t >= b.debut - 0.05 && t < Math.max(b.fin + 0.35, b.debut + 0.9) && (k === liste.length - 1 || t < liste[k + 1].debut - 0.05));
  if (i < 0) return null;
  const b = liste[i];
  return (
    <div style={{position: 'absolute', left: gauche, right: gauche > 300 ? 40 : 160, bottom: 30, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 19,
      fontFamily: POLICE, fontWeight: 800, fontSize: 48}}>
      {b.mots.map((w, k) => (
        <span key={k} style={{color: t >= w.debut - 0.03 ? BLANC : '#ffffff88', WebkitTextStroke: '9px #020629', paintOrder: 'stroke fill', textShadow: '0 6px 18px #000a',
          transform: `scale(${t >= w.debut - 0.03 && t < w.debut + 0.18 ? 1.08 : 1})`}}>{w.texte}</span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- composition
const ANIMS: Record<string, React.FC<{p: Plan; t: number}>> = {
  titre: AnimTitre, rappel: AnimRappel, conseil: AnimConseil, flou: AnimFlou, aide: AnimAide, ajuste: AnimAjuste, questions: AnimQuestions,
  noms: AnimNoms, regledor: AnimRegleDor, corrections: AnimCorrections, pullrequest: AnimPullRequest, regle: AnimRegle, appli: AnimAppli,
  boucle: AnimBoucle, fin: AnimFin, comptes: AnimComptes, jauge: AnimJauge, deuxparties: AnimDeuxParties, voiture: AnimVoiture,
  cleapi: AnimCleApi, rangement: AnimRangement, maison: AnimMaison, attente: AnimAttente,
};

export const VideoP2: React.FC<{D: Donnees; bouche: number[]; visemes: string; dossier: string}> = ({D, bouche, visemes, dossier}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / FPS;
  const liste = useMemo(() => blocs(D.mots), [D]);
  const idx = Math.max(0, D.plans.findIndex((p, i) => t >= p.debut && (i === D.plans.length - 1 || t < D.plans[i + 1].debut)));
  const p = D.plans[idx];
  const {g, ex} = useMemo(() => {
    const g: EtapeGeste[] = [{t: -10, geste: 'repos'}];
    const ex: EtapeExpression[] = [{t: -10, expression: 'neutre'}];
    D.plans.filter((x) => x.type === 'carte').forEach((c) => {
      g.push({t: c.debut + 0.1, geste: 'explique'}, {t: c.debut + 1.8, geste: 'repos'});
      (c.instants ?? []).forEach((d, i) => g.push({t: d - 0.15, geste: 'compte', doigts: (i + 1) as 1 | 2 | 3}, {t: d + 1.4, geste: 'repos'}));
      ex.push({t: c.debut, expression: 'sourire'}, {t: c.debut + 1.5, expression: 'neutre'});
    });
    g.sort((a, b) => a.t - b.t);
    ex.sort((a, b) => a.t - b.t);
    return {g, ex};
  }, [D]);
  const etat = etatDouble(t, g, ex, bouche, visemes, FPS);
  const sons: EvenementSonore[] = useMemo(() => {
    const out: EvenementSonore[] = [];
    D.plans.forEach((x, i) => {
      if (i > 0) out.push({t: x.debut - 0.12, son: 'whoosh', volume: 0.26});
      if (x.type === 'anim') for (const v of Object.values(x.reperes ?? {})) out.push({t: v - 0.05, son: 'pop', volume: 0.16});
      for (const s of x.surlignes ?? []) out.push({t: s.t - 0.15, son: 'pop', volume: 0.12});
      for (const d of x.instants ?? []) out.push({t: d - 0.1, son: 'pop', volume: 0.14});
      for (const l of x.legendes ?? []) out.push({t: l.t, son: 'pop', volume: 0.14});
      if (x.tLegende) out.push({t: x.tLegende, son: 'pop', volume: 0.14});
      if (x.nom === 'pullrequest') out.push({t: R(x, 'verifie'), son: 'ding', volume: 0.22}, {t: R(x, 'coffre') + 0.4, son: 'clic', volume: 0.3});
      if (x.nom === 'boucle') for (const k of ['b1', 'b2', 'b3', 'b4', 'b5']) out.push({t: R(x, k), son: 'ding', volume: 0.12});
      if (x.nom === 'flou') out.push({t: R(x, 'mediocre'), son: 'clic', volume: 0.35});
    });
    out.sort((a, b) => a.t - b.t);
    // jamais deux effets à moins de 0,12 s
    return out.filter((s, i) => i === 0 || s.t - out[i - 1].t > 0.12);
  }, [D]);
  const volumeMusique = (fr: number) => {
    const tt = fr / FPS;
    const parle = D.mots.some((w) => tt >= w.debut - 0.4 && tt <= w.fin + 0.4);
    return (parle ? 0.045 : 0.1) * interpolate(fr, [durationInFrames - 30, durationInFrames - 1], [1, 0], CLAMP) * interpolate(fr, [0, 20], [0.4, 1], CLAMP);
  };
  const e = t - p.debut;
  const zoomScene = interpolate(e, [0, 0.5], [1.04, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  let contenu: React.ReactNode = null;
  if (p.type === 'demo') contenu = <Demo key={idx} p={p} t={t} dossier={dossier} />;
  else if (p.type === 'libre') contenu = <Libre key={idx} p={p} t={t} dossier={dossier} />;
  else if (p.type === 'anim' && p.nom && ANIMS[p.nom]) {
    const A = ANIMS[p.nom];
    contenu = <A p={p} t={t} />;
  } else if (p.type === 'carte') contenu = (<><Bureau etat={etat} /><Carte p={p} t={t} /></>);
  return (
    <AbsoluteFill style={{background: NUIT}}>
      <Fond t={t} />
      <AbsoluteFill style={{transform: `scale(${zoomScene})`, opacity: fondu(e, 0, 0.2)}}>{contenu}</AbsoluteFill>
      <Img src={staticFile('marque/logo.jpg')} style={{position: 'absolute', left: 40, top: 30, width: 54, height: 54, borderRadius: 12}} />
      <SousTitres liste={liste} t={t} gauche={p.type === 'demo' ? 600 : 160} />
      <Audio src={staticFile(`formation/${dossier}/voix.wav`)} volume={0.9} />
      <Audio src={staticFile('serie/musique-formation.wav')} volume={volumeMusique} loop />
      <Effets evenements={sons} />
    </AbsoluteFill>
  );
};

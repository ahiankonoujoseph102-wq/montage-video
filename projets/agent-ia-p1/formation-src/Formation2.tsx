import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble, EtapeExpression, EtapeGeste} from '../commun/animationDouble';
import {Effets, EvenementSonore} from '../commun/sons';
import {COULEURS, POLICE} from '../theme';
import {EtatDouble} from '../v2d/Double2D';
import {Scene2D} from '../v2d/Scene2D';
import {DemoModuleE, EtapeDemo} from './DemoModuleE';
import data2A from '../../public/formation/2A/montage.json';
import data2B from '../../public/formation/2B/montage.json';
import bouche2A from '../../public/formation/2A/bouche.json';
import bouche2B from '../../public/formation/2B/bouche.json';
import visemes2A from '../../public/formation/2A/visemes.json';
import visemes2B from '../../public/formation/2B/visemes.json';

// Version 2 des vidéos 1A et 1B (style de l'extrait d'essai validé par Joseph) : Coach Joseph pour les explications,
// illustrations, démonstrations pas à pas sans avatar (téléphone en grand, zone touchée agrandie, cercle, bandeau
// « Étape n / N »). Données : public/formation/2A|2B/montage.json (projets/agent-ia-p1/montage/construire.py, PLAN=plan2).

export const FPS = 30;
type Point = {texte: string; mot: string};
type Cible = {t: number; x: number; y: number};
type Zoom = {t: number; x: number; y: number; f: number};
type Flou = {t0: number; t1: number; x: number; y: number; l: number; h: number};
type Visuel = {
  mode: string; titre?: string; emoji?: string; points?: Point[]; style?: string; definition?: string | null; image?: string; legende?: string;
  partie?: string; sous_titre?: string; suite?: string; n?: number; fixe?: number; etapes?: [string, number][];
  bandeau?: string; fichier?: string; cibles?: Cible[]; zooms?: Zoom[]; haut?: number; hclip?: number; wclip?: number; son?: boolean; flous?: Flou[]; note?: string;
};
type Plan = {debut: number; fin: number; visuel: Visuel; type: string; instants?: number[]};
type Mot = {texte: string; debut: number; fin: number; phrase: string};
type Donnees = {duree: number; plans: Plan[]; mots: Mot[]};

const DONNEES: Record<string, Donnees> = {'2A': data2A as Donnees, '2B': data2B as Donnees};
const BOUCHES: Record<string, number[]> = {'2A': bouche2A as number[], '2B': bouche2B as number[]};
const VISEMES: Record<string, string> = {'2A': visemes2A as string, '2B': visemes2B as string};
export const dureeFormation2 = (v: string) => Math.ceil((DONNEES[v].duree + 0.2) * FPS);

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, d: number, duree = 0.35) => interpolate(t, [d, d + duree * 0.6, d + duree], [0, 1.06, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
const fondu = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CLAMP);
const doux = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
const PAPIER = '#f6f4ee';
const ENCRE = '#1b2142';

// ---------------------------------------------------------------- éléments communs
const Fond: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 30% 30%, ${COULEURS.nuitClaire}, ${COULEURS.nuit} 72%)`}} />
);

const Bandeau: React.FC<{chapitre?: {n: number; titre: string}}> = ({chapitre}) => (
  <div style={{position: 'absolute', left: 50, top: 34, display: 'flex', alignItems: 'center', gap: 16, fontFamily: POLICE}}>
    <Img src={staticFile('marque/logo.jpg')} style={{width: 62, height: 62, borderRadius: 14, boxShadow: `0 0 0 2px ${COULEURS.or}55`}} />
    {chapitre ? (
      <>
        <div style={{background: COULEURS.or, color: COULEURS.nuit, fontWeight: 800, fontSize: 26, borderRadius: 12, padding: '5px 14px'}}>Chapitre {chapitre.n}</div>
        <div style={{color: COULEURS.blanc, fontWeight: 700, fontSize: 28}}>{chapitre.titre}</div>
      </>
    ) : null}
  </div>
);

const Bureau: React.FC<{etat: EtatDouble}> = ({etat}) => (
  <>
    <div style={{position: 'absolute', left: 800, top: -990, width: 1080, height: 1920, transform: 'scale(1.12)', transformOrigin: '0 0'}}>
      <Scene2D etat={etat} ecran={<></>} />
    </div>
    <div style={{position: 'absolute', left: 800, top: 0, width: 300, height: 1080, background: `linear-gradient(90deg, ${COULEURS.nuit}, ${COULEURS.nuit}00)`}} />
  </>
);

// ---------------------------------------------------------------- cartes (Coach Joseph en grand), avec illustration
const Carte: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const v = p.visuel;
  const pts = v.points ?? [];
  const n = pts.length;
  const img = !!v.image;
  const taille = img ? (n <= 3 ? 32 : 28) : n <= 3 ? 40 : n === 4 ? 37 : n === 5 ? 33 : 30;
  const e = t - p.debut;
  const flux = v.style === 'flux';
  return (
    <div style={{position: 'absolute', left: 70, top: img ? 115 : 130, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, transform: `translateY(${(1 - fondu(e, 0, 0.35)) * 30}px)`, opacity: fondu(e, 0, 0.3)}}>
        <div style={{fontSize: img ? 66 : 84, lineHeight: 1, transform: `scale(${pop(e, 0.05, 0.45)})`}}>{v.emoji}</div>
        <div style={{fontSize: v.titre!.length > 30 ? 44 : img ? 48 : 54, fontWeight: 800, lineHeight: 1.1, color: v.style === 'notion' ? COULEURS.or : COULEURS.blanc}}>{v.titre}</div>
      </div>
      <div style={{height: 6, borderRadius: 3, background: COULEURS.or, marginTop: 14, width: 300 * fondu(e, 0.2, 0.6)}} />
      {v.definition ? (
        <div style={{marginTop: 18, background: PAPIER, color: ENCRE, borderRadius: 18, padding: img ? '10px 20px' : '16px 22px', fontSize: img ? 31 : 36, fontWeight: 700, lineHeight: 1.25,
          boxShadow: `0 0 0 4px ${COULEURS.or}`, opacity: fondu(e, 0.3, 0.6)}}>{v.definition}</div>
      ) : null}
      {img ? (
        <div style={{marginTop: 18, height: 330, borderRadius: 22, background: '#eef0f7', display: 'grid', placeItems: 'center', overflow: 'hidden', position: 'relative',
          boxShadow: '0 14px 34px #0008', opacity: fondu(e, 0.25, 0.6), transform: `scale(${interpolate(e, [0.25, 0.7], [0.94, 1], CLAMP)})`}}>
          <Img src={staticFile(`formation/illus/${v.image}`)} style={{height: v.image!.endsWith('.png') || v.image!.endsWith('.jpg') ? 330 : 290,
            width: v.image!.endsWith('.png') || v.image!.endsWith('.jpg') ? '100%' : undefined, objectFit: 'cover',
            transform: `scale(${interpolate(e, [0, p.fin - p.debut], [1, 1.06], CLAMP)})`}} />
          {v.legende ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: '#020629cc', color: COULEURS.blanc, fontSize: 24, fontWeight: 700, padding: '6px 14px'}}>{v.legende}</div> : null}
        </div>
      ) : null}
      <div style={{marginTop: img ? 16 : 26, display: 'flex', flexDirection: 'column', gap: flux ? 4 : img ? 8 : 16}}>
        {pts.map((pt, i) => {
          const d = p.instants?.[i] ?? p.debut;
          const visible = t >= d - 0.05;
          const k = pop(t, d - 0.05, 0.4);
          return (
            <div key={i}>
              {flux && i > 0 ? <div style={{marginLeft: 26, height: img ? 8 : 16, borderLeft: `4px solid ${COULEURS.or}88`, opacity: visible ? 1 : 0.12}} /> : null}
              <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: visible ? 1 : 0.14, transform: `scale(${visible ? k : 1})`, transformOrigin: '0 50%'}}>
                {flux ? (
                  <div style={{flex: 'none', width: img ? 44 : 56, height: img ? 44 : 56, borderRadius: 28, background: COULEURS.or, color: COULEURS.nuit, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: img ? 24 : 28}}>{i + 1}</div>
                ) : (
                  <div style={{flex: 'none', width: 18, height: 18, borderRadius: 9, background: COULEURS.or, boxShadow: `0 0 12px ${COULEURS.or}`}} />
                )}
                <div style={{fontSize: taille, fontWeight: 700, lineHeight: 1.2}}>{pt.texte}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Intro: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const e = t - p.debut;
  return (
    <div style={{position: 'absolute', left: 90, top: 220, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{fontSize: 34, fontWeight: 700, letterSpacing: 10, color: COULEURS.or, opacity: fondu(e, 0.15, 0.4)}}>FORMATION</div>
      <div style={{fontSize: 66, fontWeight: 800, lineHeight: 1.08, marginTop: 14, transform: `scale(${pop(e, 0.35)})`, transformOrigin: '0 50%'}}>Comment créer un agent IA,</div>
      <div style={{fontSize: 104, fontWeight: 800, color: COULEURS.or, lineHeight: 1.05, transform: `scale(${pop(e, 0.7)})`, transformOrigin: '0 50%', textShadow: `0 0 40px ${COULEURS.or}55`}}>de A à Z</div>
      <div style={{height: 8, borderRadius: 4, background: COULEURS.or, marginTop: 22, width: 520 * fondu(e, 1.0, 1.4)}} />
      <div style={{fontSize: 44, fontWeight: 700, marginTop: 30, opacity: fondu(e, 1.4, 1.7)}}>Première partie</div>
      <div style={{display: 'inline-block', marginTop: 18, padding: '12px 30px', borderRadius: 40, background: COULEURS.or, color: COULEURS.nuit, fontSize: 40, fontWeight: 800,
        transform: `scale(${pop(e, 1.9)})`, transformOrigin: '0 50%'}}>Partie {p.visuel.partie} · {p.visuel.sous_titre}</div>
    </div>
  );
};

const FinPartie: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const e = t - p.debut;
  return (
    <div style={{position: 'absolute', left: 90, top: 270, width: 740, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{fontSize: 70, fontWeight: 800, lineHeight: 1.1, transform: `scale(${pop(e, 0.1)})`, transformOrigin: '0 50%'}}>{p.visuel.titre}</div>
      <div style={{height: 8, borderRadius: 4, background: COULEURS.or, marginTop: 26, width: 420 * fondu(e, 0.5, 0.9)}} />
      <div style={{fontSize: 34, fontWeight: 700, marginTop: 34, color: COULEURS.or, opacity: fondu(e, 0.9, 1.2)}}>À SUIVRE</div>
      <div style={{display: 'inline-block', marginTop: 14, padding: '14px 30px', borderRadius: 40, background: COULEURS.or, color: COULEURS.nuit, fontSize: 38, fontWeight: 800,
        transform: `scale(${pop(e, 1.2)})`, transformOrigin: '0 50%'}}>{p.visuel.suite}</div>
    </div>
  );
};

const Chapitre: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const e = t - p.debut;
  const sortie = fondu(e, p.fin - p.debut - 0.3, p.fin - p.debut);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: POLICE, opacity: 1 - sortie}}>
      <div style={{fontSize: 150, transform: `scale(${pop(e, 0.05, 0.5)})`}}>{p.visuel.emoji}</div>
      <div style={{marginTop: 10, fontSize: 40, fontWeight: 800, letterSpacing: 12, color: COULEURS.or, opacity: fondu(e, 0.2, 0.45)}}>CHAPITRE {p.visuel.n}</div>
      <div style={{marginTop: 16, fontSize: 76, fontWeight: 800, color: COULEURS.blanc, textAlign: 'center', maxWidth: 1500, lineHeight: 1.1,
        transform: `translateY(${(1 - fondu(e, 0.3, 0.7)) * 40}px)`, opacity: fondu(e, 0.3, 0.6)}}>{p.visuel.titre}</div>
      <div style={{marginTop: 30, height: 8, borderRadius: 4, background: COULEURS.or, width: 360 * fondu(e, 0.6, 1.0)}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- « GitHub = coffre-fort » (illustration de l'extrait validé)
const Coffre: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const e = t - t0;
  const ferme = doux(e, 1.6, 2.4);
  const carte = doux(e, 0.5, 1.5);
  const verrou = pop(e, 2.4, 0.4);
  return (
    <svg width={400} height={400} viewBox="0 0 330 330" style={{overflow: 'visible'}}>
      <rect x={20} y={30} width={290} height={270} rx={26} fill="#2c3462" stroke={COULEURS.or} strokeWidth={6} />
      <rect x={45} y={55} width={240} height={220} rx={16} fill="#11163a" />
      <g transform={`translate(${interpolate(carte, [0, 1], [-260, 95])}, ${interpolate(carte, [0, 1], [-40, 105])}) scale(${interpolate(carte, [0, 1], [1, 0.75])})`}>
        <rect width={140} height={110} rx={12} fill={COULEURS.or} />
        <text x={70} y={48} textAnchor="middle" fontFamily={POLICE} fontWeight={800} fontSize={34} fill={COULEURS.nuit}>{'</>'}</text>
        <rect x={22} y={68} width={96} height={8} rx={4} fill={COULEURS.nuit} />
        <rect x={22} y={84} width={64} height={8} rx={4} fill={COULEURS.nuit} />
      </g>
      <g transform={`translate(45 55) scale(${interpolate(ferme, [0, 1], [0.08, 1])} 1)`}>
        <rect width={240} height={220} rx={16} fill="#3a4580" stroke="#5b67a8" strokeWidth={4} />
        <circle cx={120} cy={110} r={58} fill="none" stroke={COULEURS.or} strokeWidth={8} opacity={ferme} />
        {[0, 60, 120].map((a) => (
          <rect key={a} x={116} y={58} width={8} height={104} rx={4} fill={COULEURS.or} opacity={ferme} transform={`rotate(${a + ferme * 180} 120 110)`} />
        ))}
      </g>
      <g transform={`translate(240 250) scale(${verrou})`}>
        <circle r={42} fill={COULEURS.or} />
        <text y={16} textAnchor="middle" fontSize={44}>🔒</text>
      </g>
    </svg>
  );
};

const Versions: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const e = t - t0;
  const retour = doux(e, 1.4, 2.4);
  const xs = [60, 230, 400];
  const x = interpolate(retour, [0, 1], [xs[2], xs[1]]);
  return (
    <svg width={700} height={230} viewBox="0 -10 470 160" style={{overflow: 'visible'}}>
      <defs><marker id="fl" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={COULEURS.or} /></marker></defs>
      <line x1={60} y1={70} x2={400} y2={70} stroke="#5b67a8" strokeWidth={8} strokeLinecap="round" />
      {xs.map((cx, i) => (
        <g key={i} opacity={fondu(e, i * 0.25, i * 0.25 + 0.3)}>
          <circle cx={cx} cy={70} r={24} fill="#2c3462" stroke={COULEURS.or} strokeWidth={5} />
          <text x={cx} y={128} textAnchor="middle" fontFamily={POLICE} fontWeight={700} fontSize={26} fill={COULEURS.blanc}>Version {i + 1}</text>
        </g>
      ))}
      <circle cx={x} cy={70} r={15} fill={COULEURS.or} />
      <path d="M 390 22 Q 315 -6 240 22" fill="none" stroke={COULEURS.or} strokeWidth={6} opacity={fondu(e, 1.2, 1.5)} markerEnd="url(#fl)" />
    </svg>
  );
};

const Depot: React.FC<{t: number; t0: number; tModif: number}> = ({t, t0, tModif}) => (
  <div style={{width: 720, background: '#0d1117', borderRadius: 22, boxShadow: '0 0 0 3px #30363d, 0 18px 40px #0008', padding: '28px 30px', fontFamily: POLICE,
    transform: `scale(${pop(t - t0, 0, 0.45)})`, transformOrigin: '0 0'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, color: '#e6edf3', fontSize: 34, fontWeight: 700, lineHeight: 1.25}}>
      <span>📁</span><span>ahiankonoujoseph102-wq / <b>agent-anglais-ia</b></span>
    </div>
    <div style={{display: 'flex', gap: 12, marginTop: 12}}>
      <span style={{border: '2px solid #30363d', color: '#8b949e', borderRadius: 24, padding: '4px 18px', fontSize: 30, fontWeight: 700}}>🔒 Privé</span>
      <span style={{color: '#8b949e', fontSize: 30, fontWeight: 600, paddingTop: 6}}>Le code de Talkami</span>
    </div>
    <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{display: 'flex', gap: 12, alignItems: 'center', color: '#e6edf3', fontSize: 31, fontWeight: 600,
          opacity: fondu(t, tModif + i * 0.45, tModif + i * 0.45 + 0.25), transform: `translateX(${(1 - fondu(t, tModif + i * 0.45, tModif + i * 0.45 + 0.3)) * 30}px)`}}>
          <span style={{color: '#3fb950', fontSize: 34}}>✔</span>Modification enregistrée
        </div>
      ))}
    </div>
  </div>
);

const IllusGithub: React.FC<{p: Plan; t: number; mots: Mot[]}> = ({p, t, mots}) => {
  const repere = (debut: string, defaut: number) => mots.find((w) => w.debut >= p.debut && w.debut < p.fin && w.texte.toLowerCase().startsWith(debut))?.debut ?? defaut;
  const L = p.fin - p.debut;
  const rSite = repere('site', p.debut + 2);
  const tDepot = repere('dépôt', p.debut + 0.25 * L) - 0.3;
  const tCoffre = repere('coffre-fort', p.debut + 0.4 * L) - 0.2;
  const tRevenir = repere('revenir', p.debut + 0.55 * L) - 0.3;
  const tTalkami = repere('talkami', p.debut + 0.75 * L) - 0.6;
  const tModif = repere('modification', p.debut + 0.9 * L) - 0.2;
  const phase = t < tCoffre ? 0 : t < tRevenir ? 1 : t < tTalkami ? 2 : 3;
  const debuts = [tDepot, tCoffre, tRevenir, tTalkami];
  const vis = (k: number) => (phase === k ? fondu(t, debuts[k], debuts[k] + 0.35) : 0);
  const legendes = ["Le dépôt : l'espace de votre projet", 'Comme un coffre-fort pour votre travail', 'On peut revenir en arrière', 'Exemple : le dépôt de Talkami'];
  const e = t - p.debut;
  return (
    <div style={{position: 'absolute', left: 70, top: 120, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: fondu(e, 0, 0.3)}}>
        <div style={{fontSize: 76, transform: `scale(${pop(e, 0.05, 0.45)})`}}>🔐</div>
        <div style={{fontSize: 54, fontWeight: 800, color: COULEURS.or}}>{p.visuel.titre}</div>
      </div>
      <div style={{marginTop: 20, background: PAPIER, color: ENCRE, borderRadius: 18, padding: '14px 22px', fontSize: 36, fontWeight: 700,
        boxShadow: `0 0 0 4px ${COULEURS.or}`, opacity: fondu(t, rSite - 0.2, rSite + 0.1), display: 'inline-block'}}>Le site où l'on range le code</div>
      <div style={{position: 'relative', height: 600, marginTop: 10}}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(0)}}>
          <Img src={staticFile('formation/illus/code-contribution.svg')} style={{height: 440, transform: `translateY(${(1 - fondu(t, tDepot, tDepot + 0.5)) * 40}px)`}} />
        </div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(1)}}><Coffre t={t} t0={tCoffre} /></div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(2)}}><Versions t={t} t0={tRevenir} /></div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(3)}}><Depot t={t} t0={tTalkami} tModif={tModif} /></div>
        {t >= tDepot ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: -4, textAlign: 'center', fontSize: 35, fontWeight: 800, color: COULEURS.or}}>
            <span style={{opacity: fondu(t, debuts[phase], debuts[phase] + 0.3)}}>{legendes[phase]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- démonstration pas à pas (sans avatar)
const TEL = {x: 64, y: 110, h: 900};
const PAN = {x: 620, y: 175, l: 1240, h: 735};

const zoomA = (v: Visuel, debut: number, t: number) => {
  const z = v.zooms!;
  const W = v.wclip!;
  const H = v.hclip!;
  let cur = z[0];
  for (let i = 1; i < z.length; i++) {
    const k = doux(t, z[i].t - 0.25, z[i].t + 0.35);
    if (k > 0) cur = {t: 0, x: cur.x + (z[i].x - cur.x) * k, y: cur.y + (z[i].y - cur.y) * k, f: cur.f + (z[i].f - cur.f) * k};
  }
  const fmin = PAN.l / W; // l'agrandissement couvre toujours toute la largeur du panneau
  const k0 = doux(t, debut + 0.1, debut + 0.7);
  const f = Math.max(fmin, interpolate(k0, [0, 1], [cur.f * 0.72, cur.f]));
  const lw = PAN.l / f;
  const lh = PAN.h / f;
  const x0 = Math.min(Math.max(cur.x - lw / 2, 0), Math.max(0, W - lw));
  const y0 = Math.min(Math.max(cur.y - lh / 2, 0), Math.max(0, H - lh));
  return {f, x0, y0, lw, lh};
};

const Anneau: React.FC<{x: number; y: number; t: number; t0: number; r: number}> = ({x, y, t, t0, r}) => {
  const e = t - t0;
  const ondes = [0, 0.5].map((d) => (((e + d) % 1.0) + 1) % 1.0);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${pop(e, 0, 0.35)})`}}>
      {ondes.map((o, i) => (
        <div key={i} style={{position: 'absolute', left: -r * (1 + o * 0.6), top: -r * (1 + o * 0.6), width: 2 * r * (1 + o * 0.6), height: 2 * r * (1 + o * 0.6),
          borderRadius: '50%', border: `${Math.max(2, r * 0.12)}px solid ${COULEURS.or}`, opacity: (1 - o) * 0.9}} />
      ))}
      <div style={{position: 'absolute', left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `${Math.max(3, r * 0.14)}px solid ${COULEURS.or}`,
        boxShadow: `0 0 ${r * 0.6}px ${COULEURS.or}, inset 0 0 ${r * 0.4}px ${COULEURS.or}88`}} />
    </div>
  );
};

const FlousEtape: React.FC<{flous: Flou[]; t: number; ech: number}> = ({flous, t, ech}) => (
  <>
    {flous.filter((f) => t >= f.t0 && t <= f.t1).map((f, i) => (
      <div key={i} style={{position: 'absolute', left: f.x * ech, top: f.y * ech, width: f.l * ech, height: f.h * ech, borderRadius: 6,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: '#8890a866'}} />
    ))}
  </>
);

const Demo: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const v = p.visuel;
  const W = v.wclip!;
  const H = v.hclip!;
  const ech = TEL.h / H;
  const telL = W * ech;
  const {f, x0, y0, lw, lh} = zoomA(v, p.debut, t);
  const src = staticFile(`formation/etapes/${v.fichier}.mp4`);
  const cibles = v.cibles ?? [];
  const ic = cibles.reduce((k, c, i) => (t >= c.t - 0.6 ? i : k), -1);
  // le cercle reste jusqu'au toucher suivant, au plus 2,5 s après le sien
  const cible = ic >= 0 && t < cibles[ic].t + 2.5 ? cibles[ic] : null;
  const e = t - p.debut;
  const entree = fondu(e, 0, 0.3);
  const titre = v.bandeau ?? '';
  const numero = /^Étape (\d+)/.exec(titre);
  const texte = titre.replace(/^Étape \d+ : /, '');
  const flous = v.flous ?? [];
  return (
    <>
      <div style={{position: 'absolute', left: TEL.x - 14, top: TEL.y - 14, width: telL + 28, height: TEL.h + 28, borderRadius: 40, background: '#05081c', boxShadow: '0 0 0 3px #39407a, 0 20px 50px #000a'}} />
      <div style={{position: 'absolute', left: TEL.x, top: TEL.y, width: telL, height: TEL.h, overflow: 'hidden', borderRadius: 28}}>
        <Sequence from={Math.round(p.debut * FPS)} layout="none">
          <OffthreadVideo src={src} muted style={{width: telL, height: TEL.h}} />
        </Sequence>
        <FlousEtape flous={flous} t={t} ech={ech} />
        <div style={{position: 'absolute', left: x0 * ech, top: y0 * ech, width: lw * ech, height: lh * ech, border: `4px solid ${COULEURS.or}`, borderRadius: 8,
          boxShadow: '0 0 0 2000px #02062955', opacity: entree}} />
        {cible ? <Anneau x={cible.x * ech} y={cible.y * ech} t={t} t0={cible.t - 0.6} r={22} /> : null}
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <path d={`M ${TEL.x + (x0 + lw) * ech} ${TEL.y + (y0 + lh / 2) * ech} C ${PAN.x - 60} ${TEL.y + (y0 + lh / 2) * ech}, ${PAN.x - 80} ${PAN.y + PAN.h / 2}, ${PAN.x} ${PAN.y + PAN.h / 2}`}
          fill="none" stroke={COULEURS.or} strokeWidth={4} opacity={entree} />
      </svg>
      <div style={{position: 'absolute', left: PAN.x, top: PAN.y, width: PAN.l, height: PAN.h, overflow: 'hidden', borderRadius: 24, background: '#000',
        boxShadow: `0 0 0 5px ${COULEURS.or}, 0 24px 60px #000c`, opacity: entree}}>
        <div style={{position: 'absolute', left: -x0 * f, top: -y0 * f, width: W * f, height: H * f}}>
          <Sequence from={Math.round(p.debut * FPS)} layout="none">
            <OffthreadVideo src={src} muted style={{width: W * f, height: H * f}} />
          </Sequence>
          <FlousEtape flous={flous} t={t} ech={f} />
          {cible ? <Anneau x={cible.x * f} y={cible.y * f} t={t} t0={cible.t - 0.6} r={34 * Math.min(f, 2)} /> : null}
        </div>
      </div>
      <div style={{position: 'absolute', left: PAN.x, top: 52, width: PAN.l, display: 'flex', alignItems: 'center', gap: 18, fontFamily: POLICE,
        transform: `translateY(${(1 - fondu(e, 0, 0.3)) * -20}px)`, opacity: entree}}>
        {numero ? (
          <div style={{flex: 'none', background: COULEURS.or, color: COULEURS.nuit, fontWeight: 800, fontSize: 34, borderRadius: 16, padding: '8px 20px',
            transform: `scale(${pop(e, 0.05, 0.4)})`}}>Étape {numero[1]} / {v.n}</div>
        ) : null}
        <div style={{color: COULEURS.blanc, fontWeight: 800, fontSize: texte.length > 48 ? 34 : texte.length > 40 ? 38 : 44, lineHeight: 1.1}}>{texte}</div>
      </div>
      {v.note ? (
        <div style={{position: 'absolute', left: PAN.x + 30, top: PAN.y + PAN.h - 30, maxWidth: PAN.l - 60, background: COULEURS.or, color: COULEURS.nuit, fontFamily: POLICE,
          fontWeight: 800, fontSize: 32, borderRadius: 16, padding: '10px 22px', boxShadow: '0 10px 30px #000a', transform: `scale(${pop(e, 0.6, 0.4)})`, transformOrigin: '0 0'}}>💡 {v.note}</div>
      ) : null}
      <Img src={staticFile('marque/logo.jpg')} style={{position: 'absolute', left: 50, top: 26, width: 54, height: 54, borderRadius: 12}} />
      <div style={{position: 'absolute', left: 118, top: 38, width: 480, fontFamily: POLICE, fontWeight: 700, fontSize: 24, color: '#ffffffbb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{v.titre}</div>
    </>
  );
};

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
    if (prec && (m.phrase !== prec.phrase || m.debut - prec.fin > 0.5 || lettres > 46 || cur.length >= 8 || m.debut - cur[0].debut > 3.2)) fermer();
    cur.push(m);
    const suivant = mots[i + 1];
    if (/[.?!»]$/.test(m.texte) && (!suivant || suivant.debut - m.fin > 0.15)) fermer();
  });
  fermer();
  return out;
};

const SousTitres: React.FC<{liste: Bloc[]; t: number; demo: boolean}> = ({liste, t, demo}) => {
  const i = liste.findIndex((b, k) => t >= b.debut - 0.05 && t < Math.max(b.fin + 0.35, b.debut + 0.9) && (k === liste.length - 1 || t < liste[k + 1].debut - 0.05));
  if (i < 0) return null;
  const b = liste[i];
  return (
    <div style={{position: 'absolute', left: demo ? 600 : 160, right: demo ? 40 : 160, bottom: demo ? 34 : 26, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16,
      fontFamily: POLICE, fontWeight: 800, fontSize: 46}}>
      {b.mots.map((w, k) => (
        <span key={k} style={{color: t >= w.debut - 0.03 ? COULEURS.blanc : '#ffffff99', WebkitTextStroke: '9px #020629', paintOrder: 'stroke fill', textShadow: '0 6px 18px #000a'}}>{w.texte}</span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- composition
const gestesDe = (plans: Plan[]) => {
  const g: EtapeGeste[] = [{t: -10, geste: 'repos'}];
  const ex: EtapeExpression[] = [{t: -10, expression: 'neutre'}];
  for (const p of plans) {
    const m = p.visuel.mode;
    if (m === 'intro' || m === 'finpartie') {
      g.push({t: p.debut + 0.2, geste: 'explique'}, {t: p.debut + 2.6, geste: 'repos'});
      ex.push({t: p.debut, expression: 'sourire'}, {t: p.debut + 3, expression: 'neutre'});
    } else if (m === 'carte' || m === 'github') {
      if (p.visuel.style === 'flux') {
        (p.instants ?? []).forEach((d, i) => {
          if (i < 4) g.push({t: d - 0.15, geste: 'compte', doigts: (i + 1) as 1 | 2 | 3 | 4}, {t: d + 1.3, geste: 'repos'});
        });
      } else {
        g.push({t: p.debut + 0.1, geste: 'explique'}, {t: p.debut + 1.9, geste: 'repos'});
        if ((p.instants ?? []).length > 2) g.push({t: p.instants![p.instants!.length - 1] - 0.1, geste: 'designe'}, {t: p.instants![p.instants!.length - 1] + 1.4, geste: 'repos'});
      }
    }
  }
  g.sort((a, b) => a.t - b.t);
  ex.sort((a, b) => a.t - b.t);
  return {g, ex};
};

export const Formation2: React.FC<{video: '2A' | '2B'}> = ({video}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / FPS;
  const d = DONNEES[video];
  const {g, ex} = useMemo(() => gestesDe(d.plans), [d]);
  const liste = useMemo(() => blocs(d.mots), [d]);
  const etat = etatDouble(t, g, ex, BOUCHES[video], VISEMES[video], FPS);
  const idx = Math.max(0, d.plans.findIndex((p, i) => t >= p.debut && (i === d.plans.length - 1 || t < d.plans[i + 1].debut)));
  const p = d.plans[idx];
  const chap = d.plans.slice(0, idx + 1).filter((x) => x.visuel.mode === 'chapitre').pop();
  const m = p.visuel.mode;
  const sons: EvenementSonore[] = useMemo(() => {
    const out: EvenementSonore[] = [];
    let prec = '';
    for (const x of d.plans) {
      const mo = x.visuel.mode;
      if (mo === 'chapitre') out.push({t: Math.max(0, x.debut - 0.1), son: 'whoosh', volume: 0.32});
      if (mo === 'intro') out.push({t: x.debut + 1.9, son: 'ding', volume: 0.25});
      for (const i of mo === 'carte' ? x.instants ?? [] : []) out.push({t: i - 0.05, son: 'pop', volume: 0.12});
      if (mo === 'demo') for (const i of (x.instants ?? []).slice(1)) out.push({t: i, son: 'pop', volume: 0.2});
      if (mo === 'etape') {
        if (prec !== 'etape') out.push({t: Math.max(0, x.debut - 0.15), son: 'whoosh', volume: 0.22});
        else out.push({t: x.debut, son: 'clic', volume: 0.12});
        for (const c of x.visuel.cibles ?? []) out.push({t: c.t - 0.6, son: 'pop', volume: 0.08});
      }
      prec = mo;
    }
    return out;
  }, [d]);

  let contenu: React.ReactNode = null;
  if (m === 'intro' || m === 'carte' || m === 'finpartie' || m === 'github') {
    contenu = (
      <>
        <Bureau etat={etat} />
        {m === 'intro' ? <Intro p={p} t={t} /> : m === 'finpartie' ? <FinPartie p={p} t={t} /> : m === 'github' ? <IllusGithub p={p} t={t} mots={d.mots} /> : <Carte key={idx} p={p} t={t} />}
      </>
    );
  } else if (m === 'chapitre') {
    contenu = <Chapitre p={p} t={t} />;
  } else if (m === 'etape') {
    contenu = <Demo key={idx} p={p} t={t} />;
  } else if (m === 'demo') {
    const n = Math.max(1, (p.instants ?? []).filter((x) => t >= x).length);
    contenu = <DemoModuleE etape={(p.visuel.fixe ?? Math.min(3, n)) as EtapeDemo} />;
  }
  const volumeMusique = (fr: number) => {
    const tt = fr / FPS;
    const pl = d.plans.find((x) => tt >= x.debut && tt < x.fin);
    const sonVideo = pl?.visuel.mode === 'etape' && pl.visuel.son;
    const parle = d.mots.some((w) => tt >= w.debut - 0.5 && tt <= w.fin + 0.5);
    const base = sonVideo ? 0.03 : parle ? 0.05 : 0.11;
    return base * interpolate(fr, [durationInFrames - 45, durationInFrames - 1], [1, 0], CLAMP) * interpolate(fr, [0, 15], [0.6, 1], CLAMP);
  };
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <Fond />
      {contenu}
      {m !== 'chapitre' && m !== 'demo' && m !== 'etape' ? <Bandeau chapitre={chap ? {n: chap.visuel.n!, titre: chap.visuel.titre!} : undefined} /> : null}
      <SousTitres liste={liste} t={t} demo={m === 'etape'} />
      <Audio src={staticFile(`formation/${video}/voix.wav`)} volume={0.85} />
      <Audio src={staticFile('serie/musique-formation.wav')} volume={volumeMusique} />
      <Effets evenements={sons} />
    </AbsoluteFill>
  );
};

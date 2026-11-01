import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble, EtapeExpression, EtapeGeste} from '../../commun/animationDouble';
import {Effets, EvenementSonore} from '../../commun/sons';
import {COULEURS, POLICE} from '../../theme';
import {EtatDouble} from '../../v2d/Double2D';
import {Scene2D} from '../../v2d/Scene2D';
import data from '../../../public/formation/essai2/montage.json';
import bouche from '../../../public/formation/essai2/bouche.json';
import visemes from '../../../public/formation/essai2/visemes.json';

// Extrait d'essai de la deuxième partie (vidéo 2A, la pull request) : démos pas à pas plein écran avec surlignage,
// animations plein écran (pull request, règle de fusion, application), Coach Joseph seulement pour l'explication finale.
// Données : public/formation/essai2/montage.json (projets/agent-ia-p2/montage/essai2.py).

export const FPS = 30;
type Zoom = {t: number; x: number; y: number; f: number};
type Surligne = {t: number; x0: number; y0: number; x1: number; y1: number};
type Plan = {type: string; debut: number; fin: number; fichier?: string; bandeau?: string; zooms?: Zoom[]; surlignes?: Surligne[];
  nom?: string; reperes?: Record<string, number>; titre?: string; emoji?: string; points?: {texte: string; mot: string}[]; instants?: number[]};
type Mot = {texte: string; debut: number; fin: number; phrase: string};
const D = data as {duree: number; plans: Plan[]; mots: Mot[]};
export const dureeEssaiP2 = Math.ceil(D.duree * FPS);

const OR = COULEURS.or;
const VIOLET = COULEURS.violet;
const VERT = '#2fd27a';
const ROUGE = '#ff5a5f';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, d: number, duree = 0.4) => interpolate(t, [d, d + duree * 0.6, d + duree], [0, 1.1, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
const fondu = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CLAMP);
const doux = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});

// ---------------------------------------------------------------- fond vivant (dégradé qui respire, particules)
const Fond: React.FC<{t: number}> = ({t}) => {
  const parts = useMemo(() => Array.from({length: 26}, (_, i) => ({x: (i * 397) % 1920, y: (i * 619) % 1080, r: 2 + (i % 4), v: 8 + (i % 5) * 4, c: i % 3 === 0 ? OR : VIOLET})), []);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${40 + 10 * Math.sin(t / 5)}% ${35 + 8 * Math.cos(t / 6)}%, #17206a, ${COULEURS.nuit} 70%)`}}>
      {parts.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: p.x, top: (p.y - t * p.v + 1080 * 4) % 1080, width: p.r * 2, height: p.r * 2, borderRadius: '50%',
          background: p.c, opacity: 0.25 + 0.2 * Math.sin(t * 1.3 + i), boxShadow: `0 0 ${p.r * 4}px ${p.c}`}} />
      ))}
    </AbsoluteFill>
  );
};

const Titre: React.FC<{t: number; t0: number; texte: string; emoji?: string}> = ({t, t0, texte, emoji}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, fontFamily: POLICE,
    transform: `translateY(${(1 - doux(t, t0, t0 + 0.4)) * -40}px)`, opacity: fondu(t, t0, t0 + 0.3)}}>
    {emoji ? <span style={{fontSize: 70, transform: `scale(${pop(t, t0 + 0.1)})`}}>{emoji}</span> : null}
    <span style={{fontSize: 66, fontWeight: 800, color: COULEURS.blanc}}>{texte}</span>
  </div>
);

const Legende: React.FC<{t: number; t0: number; texte: string; couleur?: string; y?: number}> = ({t, t0, texte, couleur = OR, y = 860}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', fontFamily: POLICE}}>
    <div style={{background: couleur, color: COULEURS.nuit, fontSize: 44, fontWeight: 800, borderRadius: 22, padding: '14px 34px', boxShadow: `0 0 40px ${couleur}66`,
      transform: `scale(${pop(t, t0, 0.45)})`}}>{texte}</div>
  </div>
);

// ---------------------------------------------------------------- animation : la pull request
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

const Doc: React.FC<{lignes: number; couleur?: string}> = ({lignes, couleur = '#e9ecf8'}) => (
  <div style={{width: 230, height: 280, background: couleur, borderRadius: 18, padding: 22, boxShadow: '0 18px 40px #0009', fontFamily: POLICE}}>
    <div style={{fontSize: 30, fontWeight: 800, color: COULEURS.nuit}}>{'</>'} Kekeli</div>
    {Array.from({length: 6}, (_, i) => (
      <div key={i} style={{height: 14, borderRadius: 7, marginTop: 16, width: `${60 + ((i * 37) % 40)}%`, background: i < lignes ? (i >= 3 ? VIOLET : COULEURS.nuit) : '#c9cee3',
        opacity: i < lignes ? 1 : 0.5}} />
    ))}
  </div>
);

const AnimPullRequest: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const r = p.reperes!;
  const sortie = doux(t, r.copie - 0.3, r.copie + 0.6); // la copie part du coffre
  const travail = interpolate(t, [r.copie + 0.6, r.verifie - 0.2], [3, 6], CLAMP);
  const retour = doux(t, r.fusionne, r.depot + 0.4); // la copie revient dans le coffre
  const xCopie = interpolate(sortie, [0, 1], [-820, 0]) + interpolate(retour, [0, 1], [0, -780]);
  const yCopie = interpolate(retour, [0, 1], [0, 40]);
  const echCopie = interpolate(retour, [0.7, 1], [1.3, 0.35], CLAMP);
  const ferme = doux(t, r.coffre - 0.2, r.coffre + 0.6);
  const verifie = pop(t, r.verifie, 0.45);
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La pull request" emoji="🔀" />
      {/* le coffre-fort : le dépôt */}
      <div style={{position: 'absolute', left: 330, top: 260, transform: `scale(${1.2 * pop(t, p.debut + 0.2, 0.5)})`, transformOrigin: '50% 40%'}}>
        <Coffre ferme={ferme} lueur={fondu(t, r.coffre, r.coffre + 0.3) * (1 - fondu(t, r.coffre + 1.2, r.coffre + 2))} />
        <div style={{textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 36, color: OR, marginTop: 10}}>Le dépôt</div>
        <div style={{textAlign: 'center', fontFamily: POLICE, fontWeight: 600, fontSize: 28, color: COULEURS.blanc, opacity: 0.85}}>votre coffre-fort</div>
      </div>
      {/* la copie de travail de Claude Code */}
      <div style={{position: 'absolute', left: 1220, top: 300, transform: `translate(${xCopie}px, ${yCopie}px) scale(${echCopie})`, transformOrigin: '50% 50%', opacity: fondu(t, r.copie - 0.3, r.copie)}}>
        <Doc lignes={Math.floor(travail)} />
        <div style={{position: 'absolute', left: -20, top: -60, background: VIOLET, color: COULEURS.blanc, fontFamily: POLICE, fontWeight: 800, fontSize: 28,
          borderRadius: 14, padding: '6px 16px', opacity: 1 - retour}}>🤖 La copie de Claude Code</div>
        <div style={{position: 'absolute', right: -40, top: 110, width: 110, height: 110, borderRadius: '50%', background: VERT, display: 'grid', placeItems: 'center',
          fontSize: 70, color: COULEURS.blanc, transform: `scale(${verifie}) rotate(${(1 - verifie) * -40}deg)`, boxShadow: `0 0 30px ${VERT}`, opacity: 1 - retour}}>✓</div>
      </div>
      {/* flèches : copier, puis fusionner */}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <defs><marker id="pf" markerWidth={10} markerHeight={10} refX={5} refY={5} orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={OR} /></marker></defs>
        <path d="M 760 380 C 900 250, 1050 250, 1170 330" fill="none" stroke={VIOLET} strokeWidth={8} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - doux(t, r.copie - 0.4, r.copie + 0.4)}
          markerEnd={t > r.copie + 0.35 ? 'url(#pf)' : undefined} opacity={1 - fondu(t, r.fusionne, r.fusionne + 0.3)} />
        <path d="M 1290 720 C 1120 860, 900 860, 760 690" fill="none" stroke={OR} strokeWidth={10} strokeDasharray="1" pathLength={1}
          strokeDashoffset={1 - doux(t, r.fusionne - 0.2, r.fusionne + 0.5)} markerEnd={t > r.fusionne + 0.45 ? 'url(#pf)' : undefined} />
      </svg>
      <div style={{position: 'absolute', left: 735, top: 470, fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: VIOLET, opacity: fondu(t, r.copie, r.copie + 0.3) * (1 - fondu(t, r.fusionne, r.fusionne + 0.3))}}>1. Il travaille sur une copie</div>
      <div style={{position: 'absolute', left: 1340, top: 760, fontFamily: POLICE, fontWeight: 800, fontSize: 38, color: VERT, opacity: fondu(t, r.verifie, r.verifie + 0.3) * (1 - fondu(t, r.fusionne, r.fusionne + 0.3))}}>2. Le travail est vérifié</div>
      <div style={{position: 'absolute', left: 780, top: 870, fontFamily: POLICE, fontWeight: 800, fontSize: 42, color: OR, opacity: fondu(t, r.fusionne, r.fusionne + 0.3) * (1 - fondu(t, r.ranger - 0.3, r.ranger))}}>3. On fusionne dans le dépôt</div>
      {t >= r.ranger - 0.1 ? <Legende t={t} t0={r.ranger - 0.1} texte="Fusionner = ranger le travail terminé à sa place" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- animation : la règle de fusion
const Pastille: React.FC<{couleur: string; signe: string; t: number; t0: number}> = ({couleur, signe, t, t0}) => (
  <div style={{width: 64, height: 64, borderRadius: '50%', background: couleur, display: 'grid', placeItems: 'center', fontSize: 40, color: COULEURS.blanc, fontWeight: 800,
    transform: `scale(${pop(t, t0, 0.35)})`, boxShadow: `0 0 20px ${couleur}`}}>{signe}</div>
);

const AnimRegle: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const r = p.reperes!;
  const tourne = interpolate(t, [r.rouges + 0.6, r.vert], [0, 360], CLAMP);
  const repare = fondu(t, r.vert - 0.4, r.vert);
  const Carte = ({x, couleur, titre, t0, children}: {x: number; couleur: string; titre: string; t0: number; children: React.ReactNode}) => (
    <div style={{position: 'absolute', left: x, top: 250, width: 760, height: 560, borderRadius: 34, background: '#0d1440', boxShadow: `0 0 0 5px ${couleur}, 0 30px 70px #000a`,
      padding: '36px 44px', fontFamily: POLICE, transform: `translateY(${(1 - doux(t, t0, t0 + 0.5)) * 120}px)`, opacity: fondu(t, t0, t0 + 0.3)}}>
      <div style={{fontSize: 50, fontWeight: 800, color: couleur}}>{titre}</div>
      {children}
    </div>
  );
  return (
    <>
      <Titre t={t} t0={p.debut} texte="La règle de fusion" emoji="📜" />
      <Carte x={150} couleur={VERT} titre="Vérifications vertes" t0={p.debut + 0.1}>
        <div style={{display: 'flex', gap: 22, marginTop: 30}}>
          {[0, 1, 2].map((i) => <Pastille key={i} couleur={VERT} signe="✓" t={t} t0={r.vertes + i * 0.25} />)}
        </div>
        <div style={{marginTop: 50, fontSize: 46, fontWeight: 800, color: COULEURS.blanc, lineHeight: 1.2, opacity: fondu(t, r.fusionne - 0.2, r.fusionne + 0.2)}}>
          → Claude Code fusionne tout seul 🔀
        </div>
      </Carte>
      <Carte x={1010} couleur={ROUGE} titre="Vérifications rouges" t0={p.debut + 0.3}>
        <div style={{display: 'flex', gap: 22, marginTop: 30, alignItems: 'center'}}>
          <Pastille couleur={VERT} signe="✓" t={t} t0={r.rouges} />
          <div style={{transform: `rotate(${tourne}deg)`}}><Pastille couleur={repare > 0.5 ? VERT : ROUGE} signe={repare > 0.5 ? '✓' : '✗'} t={t} t0={r.rouges + 0.25} /></div>
          <Pastille couleur={VERT} signe="✓" t={t} t0={r.rouges + 0.5} />
        </div>
        <div style={{marginTop: 50, fontSize: 44, fontWeight: 800, color: COULEURS.blanc, lineHeight: 1.25, opacity: fondu(t, r.rouges + 0.4, r.rouges + 0.8)}}>
          → il corrige, renvoie,<br />et attend le vert 🔁
        </div>
      </Carte>
    </>
  );
};

// ---------------------------------------------------------------- animation : l'application
const Telephone: React.FC<{src: string; x: number; rot: number; t: number; t0: number; legende: string}> = ({src, x, rot, t, t0, legende}) => {
  const k = doux(t, t0, t0 + 0.6);
  return (
    <div style={{position: 'absolute', left: x, top: 175 + (1 - k) * 700 + 8 * Math.sin(t * 1.4), transform: `rotate(${rot * k}deg)`, opacity: fondu(t, t0, t0 + 0.2)}}>
      <div style={{width: 330, height: 666, borderRadius: 46, background: '#05081c', padding: 12, boxShadow: '0 0 0 4px #39407a, 0 40px 80px #000c'}}>
        <Img src={staticFile(src)} style={{width: 306, height: 642, borderRadius: 36, objectFit: 'cover', objectPosition: 'top'}} />
      </div>
      <div style={{marginTop: 18, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: OR, opacity: fondu(t, t0 + 0.5, t0 + 0.8)}}>{legende}</div>
    </div>
  );
};

const AnimAppli: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const r = p.reperes!;
  return (
    <>
      <Titre t={t} t0={p.debut} texte="Le résultat de l'étape 1" emoji="🎉" />
      <Telephone src="formation/p2/illus/appli_384.png" x={560} rot={-4} t={t} t0={p.debut + 0.15} legende="La page « Mes projets »" />
      <Telephone src="formation/p2/illus/appli_402.png" x={1030} rot={4} t={t} t0={r.resultat + 0.9} legende="Créer un nouveau projet" />
    </>
  );
};

// ---------------------------------------------------------------- démonstration (plein écran) avec surlignage
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

const Demo: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const ech = TEL.h / H;
  const telL = W * ech;
  const {f, x0, y0, lw, lh} = zoomA(p, t);
  const src = staticFile(`formation/essai2/${p.fichier}.mp4`);
  const e = t - p.debut;
  const entree = doux(t, p.debut, p.debut + 0.45);
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
        color: COULEURS.blanc, transform: `translateY(${(1 - fondu(e, 0, 0.3)) * -20}px)`, opacity: fondu(e, 0, 0.3)}}>{p.bandeau}</div>
    </>
  );
};

// ---------------------------------------------------------------- carte avec Coach Joseph
const Bureau: React.FC<{etat: EtatDouble}> = ({etat}) => (
  <>
    <div style={{position: 'absolute', left: 800, top: -990, width: 1080, height: 1920, transform: 'scale(1.12)', transformOrigin: '0 0'}}>
      <Scene2D etat={etat} ecran={<></>} />
    </div>
    <div style={{position: 'absolute', left: 800, top: 0, width: 300, height: 1080, background: `linear-gradient(90deg, ${COULEURS.nuit}, ${COULEURS.nuit}00)`}} />
  </>
);

const ICONES = ['💬', '📸', '🧭'];
const Carte: React.FC<{p: Plan; t: number}> = ({p, t}) => (
  <div style={{position: 'absolute', left: 80, top: 140, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
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
              transform: `scale(${v ? pop(t, d - 0.1) : 1})`}}>{ICONES[i % 3]}</div>
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
    <div style={{position: 'absolute', left: gauche, right: gauche > 300 ? 40 : 160, bottom: 30, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16,
      fontFamily: POLICE, fontWeight: 800, fontSize: 48}}>
      {b.mots.map((w, k) => (
        <span key={k} style={{color: t >= w.debut - 0.03 ? COULEURS.blanc : '#ffffff88', WebkitTextStroke: '9px #020629', paintOrder: 'stroke fill', textShadow: '0 6px 18px #000a',
          transform: `scale(${t >= w.debut - 0.03 && t < w.debut + 0.18 ? 1.08 : 1})`}}>{w.texte}</span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- composition
export const EssaiP2: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / FPS;
  const liste = useMemo(() => blocs(D.mots), []);
  const idx = Math.max(0, D.plans.findIndex((p, i) => t >= p.debut && (i === D.plans.length - 1 || t < D.plans[i + 1].debut)));
  const p = D.plans[idx];
  const carte = D.plans.find((x) => x.type === 'carte');
  const {g, ex} = useMemo(() => {
    const g: EtapeGeste[] = [{t: -10, geste: 'repos'}];
    const ex: EtapeExpression[] = [{t: -10, expression: 'neutre'}];
    if (carte) {
      g.push({t: carte.debut + 0.1, geste: 'explique'}, {t: carte.debut + 2, geste: 'repos'});
      (carte.instants ?? []).forEach((d, i) => g.push({t: d - 0.15, geste: 'compte', doigts: (i + 1) as 1 | 2 | 3}, {t: d + 1.4, geste: 'repos'}));
      ex.push({t: carte.fin - 1.5, expression: 'sourire'});
    }
    return {g, ex};
  }, [carte]);
  const etat = etatDouble(t, g, ex, bouche as number[], visemes as string, FPS);
  const sons: EvenementSonore[] = useMemo(() => {
    const out: EvenementSonore[] = [];
    D.plans.forEach((x, i) => {
      if (i > 0) out.push({t: x.debut - 0.12, son: 'whoosh', volume: 0.26});
      if (x.type === 'anim') for (const v of Object.values(x.reperes ?? {})) out.push({t: v - 0.05, son: 'pop', volume: 0.16});
      for (const s of x.surlignes ?? []) out.push({t: s.t - 0.15, son: 'pop', volume: 0.12});
      for (const d of x.instants ?? []) out.push({t: d - 0.1, son: 'pop', volume: 0.14});
    });
    const pr = D.plans.find((x) => x.nom === 'pullrequest');
    if (pr) out.push({t: pr.reperes!.verifie, son: 'ding', volume: 0.22}, {t: pr.reperes!.coffre + 0.4, son: 'clic', volume: 0.3});
    return out.sort((a, b) => a.t - b.t);
  }, []);
  const volumeMusique = (fr: number) => {
    const tt = fr / FPS;
    const parle = D.mots.some((w) => tt >= w.debut - 0.4 && tt <= w.fin + 0.4);
    return (parle ? 0.045 : 0.1) * interpolate(fr, [durationInFrames - 30, durationInFrames - 1], [1, 0], CLAMP) * interpolate(fr, [0, 20], [0.4, 1], CLAMP);
  };
  // transition : léger zoom avant au changement de scène
  const e = t - p.debut;
  const zoomScene = interpolate(e, [0, 0.5], [1.04, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  let contenu: React.ReactNode = null;
  if (p.type === 'demo') contenu = <Demo key={idx} p={p} t={t} />;
  else if (p.type === 'anim' && p.nom === 'pullrequest') contenu = <AnimPullRequest p={p} t={t} />;
  else if (p.type === 'anim' && p.nom === 'regle') contenu = <AnimRegle p={p} t={t} />;
  else if (p.type === 'anim' && p.nom === 'appli') contenu = <AnimAppli p={p} t={t} />;
  else if (p.type === 'carte') contenu = (<><Bureau etat={etat} /><Carte p={p} t={t} /></>);
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <Fond t={t} />
      <AbsoluteFill style={{transform: `scale(${zoomScene})`, opacity: fondu(e, 0, 0.25)}}>{contenu}</AbsoluteFill>
      <Img src={staticFile('marque/logo.jpg')} style={{position: 'absolute', left: 40, top: 30, width: 54, height: 54, borderRadius: 12}} />
      <SousTitres liste={liste} t={t} gauche={p.type === 'demo' ? 600 : 160} />
      <Audio src={staticFile('formation/essai2/voix.wav')} volume={0.9} />
      <Audio src={staticFile('serie/musique-formation.wav')} volume={volumeMusique} />
      <Effets evenements={sons} />
    </AbsoluteFill>
  );
};

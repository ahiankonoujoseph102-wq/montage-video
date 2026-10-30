import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble, EtapeExpression, EtapeGeste} from '../commun/animationDouble';
import {Effets, EvenementSonore} from '../commun/sons';
import {COULEURS, POLICE} from '../theme';
import {EtatDouble} from '../v2d/Double2D';
import {Scene2D} from '../v2d/Scene2D';
import data from '../../public/formation/essai/essai.json';
import bouche from '../../public/formation/essai/bouche.json';
import visemes from '../../public/formation/essai/visemes.json';

// Extrait d'essai de la version 2 : « 5. GitHub et le dépôt » illustré (Coach Joseph à droite), puis la démo
// GitHub pas à pas sans l'avatar : téléphone en grand, zone touchée agrandie, cercle sur l'endroit à toucher,
// bandeau « Étape n ». Données : public/formation/essai/essai.json (projets/agent-ia-p1/montage/essai.py).

export const FPS = 30;
type Cible = {t: number; x: number; y: number};
type Zoom = {t: number; x: number; y: number; f: number};
type Plan = {type: string; debut: number; fin: number; fichier?: string; bandeau?: string; etape?: number; cibles?: Cible[]; zooms?: Zoom[];
  reperes?: Record<string, number>};
type Mot = {texte: string; debut: number; fin: number; phrase: string};
const D = data as {duree: number; plans: Plan[]; mots: Mot[]};
export const dureeEssai = Math.ceil(D.duree * FPS);

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, d: number, duree = 0.35) => interpolate(t, [d, d + duree * 0.6, d + duree], [0, 1.08, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
const fondu = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CLAMP);
const doux = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
const W_SRC = 1080;
const H_SRC = 2160;

const Fond: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 30% 30%, ${COULEURS.nuitClaire}, ${COULEURS.nuit} 72%)`}} />
);

const Logo: React.FC = () => (
  <Img src={staticFile('marque/logo.jpg')} style={{position: 'absolute', left: 40, top: 30, width: 58, height: 58, borderRadius: 14, boxShadow: `0 0 0 2px ${COULEURS.or}55`}} />
);

// ---------------------------------------------------------------- illustration « GitHub = coffre-fort »
const Coffre: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const e = t - t0;
  const ferme = doux(e, 1.6, 2.4); // la porte se ferme
  const carte = doux(e, 0.5, 1.5); // la feuille de code entre dans le coffre
  const verrou = pop(e, 2.4, 0.4);
  return (
    <svg width={400} height={400} viewBox="0 0 330 330" style={{overflow: 'visible'}}>
      <rect x={20} y={30} width={290} height={270} rx={26} fill="#2c3462" stroke={COULEURS.or} strokeWidth={6} />
      <rect x={45} y={55} width={240} height={220} rx={16} fill="#11163a" />
      {/* feuille de code */}
      <g transform={`translate(${interpolate(carte, [0, 1], [-260, 95])}, ${interpolate(carte, [0, 1], [-40, 105])}) scale(${interpolate(carte, [0, 1], [1, 0.75])})`}>
        <rect width={140} height={110} rx={12} fill={COULEURS.or} />
        <text x={70} y={48} textAnchor="middle" fontFamily={POLICE} fontWeight={800} fontSize={34} fill={COULEURS.nuit}>{'</>'}</text>
        <rect x={22} y={68} width={96} height={8} rx={4} fill={COULEURS.nuit} />
        <rect x={22} y={84} width={64} height={8} rx={4} fill={COULEURS.nuit} />
      </g>
      {/* porte qui pivote */}
      <g transform={`translate(45 55) scale(${interpolate(ferme, [0, 1], [0.08, 1])} 1)`}>
        <rect width={240} height={220} rx={16} fill="#3a4580" stroke="#5b67a8" strokeWidth={4} />
        <circle cx={120} cy={110} r={58} fill="none" stroke={COULEURS.or} strokeWidth={8} opacity={ferme} />
        {[0, 60, 120].map((a) => (
          <rect key={a} x={116} y={58} width={8} height={104} rx={4} fill={COULEURS.or} opacity={ferme}
            transform={`rotate(${a + ferme * 180} 120 110)`} />
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
      <line x1={60} y1={70} x2={400} y2={70} stroke="#5b67a8" strokeWidth={8} strokeLinecap="round" />
      {xs.map((cx, i) => (
        <g key={i} opacity={fondu(e, i * 0.25, i * 0.25 + 0.3)}>
          <circle cx={cx} cy={70} r={24} fill="#2c3462" stroke={COULEURS.or} strokeWidth={5} />
          <text x={cx} y={128} textAnchor="middle" fontFamily={POLICE} fontWeight={700} fontSize={26} fill={COULEURS.blanc}>Version {i + 1}</text>
        </g>
      ))}
      <circle cx={x} cy={70} r={15} fill={COULEURS.or} />
      <path d="M 390 22 Q 315 -6 240 22" fill="none" stroke={COULEURS.or} strokeWidth={6} opacity={fondu(e, 1.2, 1.5)} markerEnd="url(#fl)" />
      <defs>
        <marker id="fl" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={COULEURS.or} /></marker>
      </defs>
    </svg>
  );
};

const Depot: React.FC<{t: number; t0: number; tModif: number}> = ({t, t0, tModif}) => {
  const e = t - t0;
  const lignes = ['Modification enregistrée', 'Modification enregistrée', 'Modification enregistrée'];
  return (
    <div style={{width: 720, background: '#0d1117', borderRadius: 22, boxShadow: `0 0 0 3px #30363d, 0 18px 40px #0008`, padding: '28px 30px',
      fontFamily: POLICE, transform: `scale(${pop(e, 0, 0.45)})`, transformOrigin: '0 0'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, color: '#e6edf3', fontSize: 34, fontWeight: 700, lineHeight: 1.25}}>
        <span>📁</span><span>ahiankonoujoseph102-wq / <b>agent-anglais-ia</b></span>
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 12}}>
        <span style={{border: '2px solid #30363d', color: '#8b949e', borderRadius: 24, padding: '4px 18px', fontSize: 30, fontWeight: 700}}>🔒 Privé</span>
        <span style={{color: '#8b949e', fontSize: 30, fontWeight: 600, paddingTop: 6}}>Le code de Talkami</span>
      </div>
      <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8}}>
        {lignes.map((l, i) => (
          <div key={i} style={{display: 'flex', gap: 12, alignItems: 'center', color: '#e6edf3', fontSize: 31, fontWeight: 600,
            opacity: fondu(t, tModif + i * 0.45, tModif + i * 0.45 + 0.25), transform: `translateX(${(1 - fondu(t, tModif + i * 0.45, tModif + i * 0.45 + 0.3)) * 30}px)`}}>
            <span style={{color: '#3fb950', fontSize: 34}}>✔</span>{l}
          </div>
        ))}
      </div>
    </div>
  );
};

const Illustration: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const r = p.reperes!;
  const e = t - p.debut;
  const tDepot = r['dépôt'] - 0.3;
  const tCoffre = r['coffre-fort'] - 0.2;
  const tRevenir = r['revenir'] - 0.3;
  const tTalkami = r['talkami'] - 0.6;
  // une image à la fois dans la zone d'illustration (fondu entre les étapes)
  const phase = t < tCoffre ? 0 : t < tRevenir ? 1 : t < tTalkami ? 2 : 3;
  const debuts = [tDepot, tCoffre, tRevenir, tTalkami];
  const vis = (k: number) => (phase === k ? fondu(t, debuts[k], debuts[k] + 0.35) : 0);
  const legendes = ['Le dépôt : l\'espace de votre projet', 'Comme un coffre-fort pour votre travail', 'On peut revenir en arrière', 'Exemple : le dépôt de Talkami'];
  return (
    <div style={{position: 'absolute', left: 70, top: 120, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: fondu(e, 0, 0.3)}}>
        <div style={{fontSize: 76, transform: `scale(${pop(e, 0.05, 0.45)})`}}>🔐</div>
        <div style={{fontSize: 54, fontWeight: 800, color: COULEURS.or}}>5. GitHub et le dépôt</div>
      </div>
      <div style={{marginTop: 20, background: '#f6f4ee', color: '#1b2142', borderRadius: 18, padding: '14px 22px', fontSize: 36, fontWeight: 700,
        boxShadow: `0 0 0 4px ${COULEURS.or}`, opacity: fondu(t, r['site'] - 0.2, r['site'] + 0.1), display: 'inline-block'}}>
        Le site où l'on range le code
      </div>
      <div style={{position: 'relative', height: 600, marginTop: 10}}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(0)}}>
          <Img src={staticFile('formation/illus/code-contribution.svg')} style={{height: 440, transform: `translateY(${(1 - fondu(t, tDepot, tDepot + 0.5)) * 40}px)`}} />
        </div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(1)}}><Coffre t={t} t0={tCoffre} /></div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(2)}}><Versions t={t} t0={tRevenir} /></div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: vis(3)}}><Depot t={t} t0={tTalkami} tModif={r['modification'] - 0.2} /></div>
        {t >= tDepot ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: -4, textAlign: 'center', fontSize: 35, fontWeight: 800, color: COULEURS.or}}>
            <span style={{opacity: fondu(t, debuts[phase], debuts[phase] + 0.3)}}>{legendes[phase]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Bureau: React.FC<{etat: EtatDouble}> = ({etat}) => (
  <>
    <div style={{position: 'absolute', left: 800, top: -990, width: 1080, height: 1920, transform: 'scale(1.12)', transformOrigin: '0 0'}}>
      <Scene2D etat={etat} ecran={<></>} />
    </div>
    <div style={{position: 'absolute', left: 800, top: 0, width: 300, height: 1080, background: `linear-gradient(90deg, ${COULEURS.nuit}, ${COULEURS.nuit}00)`}} />
  </>
);

// ---------------------------------------------------------------- démonstration
const TEL = {x: 64, y: 110, h: 900};
const ECH = TEL.h / H_SRC; // échelle du téléphone
const TEL_L = W_SRC * ECH;
const PAN = {x: 620, y: 175, l: 1240, h: 735};

const zoomA = (p: Plan, t: number) => {
  const z = p.zooms!;
  let cur = z[0];
  for (let i = 1; i < z.length; i++) {
    const k = doux(t, z[i].t - 0.25, z[i].t + 0.35);
    if (k > 0) cur = {t: 0, x: cur.x + (z[i].x - cur.x) * k, y: cur.y + (z[i].y - cur.y) * k, f: cur.f + (z[i].f - cur.f) * k};
  }
  // entrée du zoom : on part d'un cadre plus large
  const k0 = doux(t, p.debut + 0.1, p.debut + 0.7);
  const f = interpolate(k0, [0, 1], [cur.f * 0.72, cur.f]);
  const lw = PAN.l / f;
  const lh = PAN.h / f;
  const x0 = Math.min(Math.max(cur.x - lw / 2, 0), W_SRC - lw);
  const y0 = Math.min(Math.max(cur.y - lh / 2, 0), H_SRC - lh);
  return {f, x0, y0, lw, lh};
};

const Anneau: React.FC<{x: number; y: number; t: number; t0: number; r: number}> = ({x, y, t, t0, r}) => {
  const e = t - t0;
  const ondes = [0, 0.5].map((d) => ((e + d) % 1.0 + 1) % 1.0);
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

const Demo: React.FC<{p: Plan; t: number; n: number}> = ({p, t, n}) => {
  const {f, x0, y0, lw, lh} = zoomA(p, t);
  const src = staticFile(`formation/essai/${p.fichier}`);
  const cibles = p.cibles ?? [];
  const ic = cibles.reduce((k, c, i) => (t >= c.t - 0.6 ? i : k), -1);
  const cible = ic >= 0 ? cibles[ic] : null;
  const e = t - p.debut;
  const entree = fondu(e, 0, 0.3);
  const titre = p.bandeau!;
  const numero = /^Étape (\d+)/.exec(titre);
  const texte = titre.replace(/^Étape \d+ : /, '');
  return (
    <>
      {/* téléphone */}
      <div style={{position: 'absolute', left: TEL.x - 14, top: TEL.y - 14, width: TEL_L + 28, height: TEL.h + 28, borderRadius: 40, background: '#05081c',
        boxShadow: '0 0 0 3px #39407a, 0 20px 50px #000a'}} />
      <div style={{position: 'absolute', left: TEL.x, top: TEL.y, width: TEL_L, height: TEL.h, overflow: 'hidden', borderRadius: 28}}>
        <Sequence from={Math.round(p.debut * FPS)} layout="none">
          <OffthreadVideo src={src} muted style={{width: TEL_L, height: TEL.h}} />
        </Sequence>
        <div style={{position: 'absolute', left: x0 * ECH, top: y0 * ECH, width: lw * ECH, height: lh * ECH, border: `4px solid ${COULEURS.or}`, borderRadius: 8,
          boxShadow: '0 0 0 2000px #02062955', opacity: entree}} />
        {cible ? <Anneau x={cible.x * ECH} y={cible.y * ECH} t={t} t0={cible.t - 0.6} r={22} /> : null}
      </div>
      {/* trait entre le téléphone et l'agrandissement */}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <path d={`M ${TEL.x + (x0 + lw) * ECH} ${TEL.y + (y0 + lh / 2) * ECH} C ${PAN.x - 60} ${TEL.y + (y0 + lh / 2) * ECH}, ${PAN.x - 80} ${PAN.y + PAN.h / 2}, ${PAN.x} ${PAN.y + PAN.h / 2}`}
          fill="none" stroke={COULEURS.or} strokeWidth={4} opacity={entree} />
      </svg>
      {/* agrandissement */}
      <div style={{position: 'absolute', left: PAN.x, top: PAN.y, width: PAN.l, height: PAN.h, overflow: 'hidden', borderRadius: 24, background: '#000',
        boxShadow: `0 0 0 5px ${COULEURS.or}, 0 24px 60px #000c`, opacity: entree}}>
        <div style={{position: 'absolute', left: -x0 * f, top: -y0 * f, width: W_SRC * f, height: H_SRC * f}}>
          <Sequence from={Math.round(p.debut * FPS)} layout="none">
            <OffthreadVideo src={src} muted style={{width: W_SRC * f, height: H_SRC * f}} />
          </Sequence>
          {cible ? <Anneau x={cible.x * f} y={cible.y * f} t={t} t0={cible.t - 0.6} r={34 * Math.min(f, 2)} /> : null}
        </div>
      </div>
      {/* bandeau de l'étape */}
      <div style={{position: 'absolute', left: PAN.x, top: 52, width: PAN.l, display: 'flex', alignItems: 'center', gap: 18, fontFamily: POLICE,
        transform: `translateY(${(1 - fondu(e, 0, 0.3)) * -20}px)`, opacity: entree}}>
        {numero ? (
          <div style={{flex: 'none', background: COULEURS.or, color: COULEURS.nuit, fontWeight: 800, fontSize: 34, borderRadius: 16, padding: '8px 20px',
            transform: `scale(${pop(e, 0.05, 0.4)})`}}>Étape {numero[1]} / {n}</div>
        ) : null}
        <div style={{color: COULEURS.blanc, fontWeight: 800, fontSize: texte.length > 42 ? 38 : 44, lineHeight: 1.1}}>{texte}</div>
      </div>
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

const SousTitres: React.FC<{liste: Bloc[]; t: number; gauche: number}> = ({liste, t, gauche}) => {
  const i = liste.findIndex((b, k) => t >= b.debut - 0.05 && t < Math.max(b.fin + 0.35, b.debut + 0.9) && (k === liste.length - 1 || t < liste[k + 1].debut - 0.05));
  if (i < 0) return null;
  const b = liste[i];
  return (
    <div style={{position: 'absolute', left: gauche, right: gauche === 600 ? 40 : 160, bottom: 34, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16,
      fontFamily: POLICE, fontWeight: 800, fontSize: 46}}>
      {b.mots.map((w, k) => (
        <span key={k} style={{color: t >= w.debut - 0.03 ? COULEURS.blanc : '#ffffff99', WebkitTextStroke: '9px #020629', paintOrder: 'stroke fill', textShadow: '0 6px 18px #000a'}}>{w.texte}</span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- composition
export const Essai: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = f / FPS;
  const liste = useMemo(() => blocs(D.mots), []);
  const illu = D.plans[0];
  const demos = D.plans.filter((p) => p.type === 'demo');
  const nEtapes = demos.filter((p) => /^Étape/.test(p.bandeau!)).length;
  const {g, ex} = useMemo(() => {
    const r = illu.reperes!;
    const g: EtapeGeste[] = [{t: -10, geste: 'repos'}, {t: 0.2, geste: 'explique'}, {t: 2.2, geste: 'repos'}, {t: r['coffre-fort'] - 0.2, geste: 'explique'},
      {t: r['coffre-fort'] + 1.6, geste: 'repos'}, {t: r['talkami'] - 0.3, geste: 'designe'}, {t: r['talkami'] + 1.8, geste: 'repos'}];
    const ex: EtapeExpression[] = [{t: -10, expression: 'neutre'}, {t: r['talkami'] - 0.2, expression: 'sourire'}, {t: r['talkami'] + 2, expression: 'neutre'}];
    return {g, ex};
  }, [illu]);
  const etat = etatDouble(t, g, ex, bouche as number[], visemes as string, FPS);
  const p = [...D.plans].reverse().find((x) => t >= x.debut - (x.type === 'demo' ? 0 : 0)) ?? illu;
  const sons: EvenementSonore[] = useMemo(() => {
    const out: EvenementSonore[] = [];
    const r = illu.reperes!;
    for (const k of ['site', 'dépôt', 'coffre-fort', 'revenir', 'talkami']) out.push({t: r[k] - 0.25, son: 'pop', volume: 0.14});
    out.push({t: r['coffre-fort'] + 2.1, son: 'clic', volume: 0.25});
    for (const x of demos) {
      out.push({t: Math.max(0, x.debut - 0.15), son: 'whoosh', volume: 0.22});
      for (const c of x.cibles ?? []) out.push({t: c.t - 0.6, son: 'pop', volume: 0.1});
    }
    out.push({t: demos[demos.length - 1].debut + 0.4, son: 'ding', volume: 0.22});
    return out;
  }, [illu, demos]);
  const volumeMusique = (fr: number) => {
    const tt = fr / FPS;
    const parle = D.mots.some((w) => tt >= w.debut - 0.4 && tt <= w.fin + 0.4);
    return (parle ? 0.05 : 0.11) * interpolate(fr, [durationInFrames - 30, durationInFrames - 1], [1, 0], CLAMP);
  };
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <Fond />
      {p.type === 'illustration' ? (
        <>
          <Bureau etat={etat} />
          <Illustration p={p} t={t} />
        </>
      ) : (
        <Demo key={p.fichier} p={p} t={t} n={nEtapes} />
      )}
      <Logo />
      <SousTitres liste={liste} t={t} gauche={p.type === 'demo' ? 600 : 160} />
      <Audio src={staticFile('formation/essai/voix.wav')} volume={0.85} />
      <Audio src={staticFile('serie/musique-formation.wav')} volume={volumeMusique} />
      <Effets evenements={sons} />
    </AbsoluteFill>
  );
};

import {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {etatDouble, EtapeExpression, EtapeGeste} from '../commun/animationDouble';
import {Effets, EvenementSonore} from '../commun/sons';
import {COULEURS, POLICE} from '../theme';
import {EtatDouble} from '../v2d/Double2D';
import {Scene2D} from '../v2d/Scene2D';
import {DemoModuleE, EtapeDemo} from './DemoModuleE';
import {Medaillon} from './TestAvatar';
import clips from '../../public/formation/clips/clips.json';
import data1A from '../../public/formation/1A/montage.json';
import data1B from '../../public/formation/1B/montage.json';
import bouche1A from '../../public/formation/1A/bouche.json';
import bouche1B from '../../public/formation/1B/bouche.json';
import visemes1A from '../../public/formation/1A/visemes.json';
import visemes1B from '../../public/formation/1B/visemes.json';

// Formation « Comment créer un agent IA, de A à Z », partie 1 (vidéos 1A et 1B), 1920 × 1080.
// Tout vient de public/formation/<v>/montage.json (construit par projets/agent-ia-p1/montage/construire.py) :
// voix, mots (sous-titres) et plans (Coach Joseph et cartes, écrans, démonstration, chapitres).

export const FPS = 30;
type Point = {texte: string; mot: string};
type Visuel = {
  mode: string; titre?: string; emoji?: string; points?: Point[]; style?: string; definition?: string | null;
  rush?: string; vs?: number; ve?: number; morceaux?: [number, number, string][]; partie?: string; sous_titre?: string;
  suite?: string; n?: number; fixe?: number;
};
type Plan = {debut: number; fin: number; visuel: Visuel; type: string; instants?: number[]; rush?: string; plage?: [number, number]; morceaux?: {o0: number; s0: number; s1: number}[]};
type Mot = {texte: string; debut: number; fin: number; phrase: string};
type Donnees = {duree: number; plans: Plan[]; mots: Mot[]};
type Clip = {debut: number; rush: string; zone: number; flous: {t0: number; t1: number; x: number; y: number; l: number; h: number}[]};

const DONNEES: Record<string, Donnees> = {'1A': data1A as Donnees, '1B': data1B as Donnees};
const BOUCHES: Record<string, number[]> = {'1A': bouche1A as number[], '1B': bouche1B as number[]};
const VISEMES: Record<string, string> = {'1A': visemes1A as string, '1B': visemes1B as string};
const CLIPS = clips as Record<string, Clip>;
export const dureeFormation = (v: string) => Math.ceil((DONNEES[v].duree + 0.2) * FPS);

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, d: number, duree = 0.35) => interpolate(t, [d, d + duree * 0.6, d + duree], [0, 1.06, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
const fondu = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], CLAMP);
const PAPIER = '#f6f4ee';
const ENCRE = '#1b2142';
const H_CLIP = 2180;

const nomClip = (rush: string, a: number, b: number) => `${rush.split('/').pop()!.replace('.mp4', '')}_${a.toFixed(1)}_${b.toFixed(1)}`;

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

// Coach Joseph dans son bureau, à droite de l'image.
const Bureau: React.FC<{etat: EtatDouble}> = ({etat}) => (
  <>
    <div style={{position: 'absolute', left: 800, top: -990, width: 1080, height: 1920, transform: 'scale(1.12)', transformOrigin: '0 0'}}>
      <Scene2D etat={etat} ecran={<></>} />
    </div>
    <div style={{position: 'absolute', left: 800, top: 0, width: 300, height: 1080, background: `linear-gradient(90deg, ${COULEURS.nuit}, ${COULEURS.nuit}00)`}} />
  </>
);

// ---------------------------------------------------------------- cartes (Coach Joseph en grand)
const Carte: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const v = p.visuel;
  const pts = v.points ?? [];
  const n = pts.length;
  const taille = n <= 3 ? 40 : n === 4 ? 37 : n === 5 ? 33 : 30;
  const e = t - p.debut;
  const flux = v.style === 'flux';
  return (
    <div style={{position: 'absolute', left: 70, top: 130, width: 760, fontFamily: POLICE, color: COULEURS.blanc}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, transform: `translateY(${(1 - fondu(e, 0, 0.35)) * 30}px)`, opacity: fondu(e, 0, 0.3)}}>
        <div style={{fontSize: 84, lineHeight: 1, transform: `scale(${pop(e, 0.05, 0.45)})`}}>{v.emoji}</div>
        <div style={{fontSize: v.titre!.length > 30 ? 46 : 54, fontWeight: 800, lineHeight: 1.1, color: v.style === 'notion' ? COULEURS.or : COULEURS.blanc}}>{v.titre}</div>
      </div>
      <div style={{height: 6, borderRadius: 3, background: COULEURS.or, marginTop: 18, width: 300 * fondu(e, 0.2, 0.6)}} />
      {v.definition ? (
        <div style={{marginTop: 24, background: PAPIER, color: ENCRE, borderRadius: 18, padding: '16px 22px', fontSize: 36, fontWeight: 700, lineHeight: 1.25,
          boxShadow: `0 0 0 4px ${COULEURS.or}`, opacity: fondu(e, 0.3, 0.6)}}>{v.definition}</div>
      ) : null}
      <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: flux ? 4 : 16}}>
        {pts.map((pt, i) => {
          const d = p.instants?.[i] ?? p.debut;
          const visible = t >= d - 0.05;
          const k = pop(t, d - 0.05, 0.4);
          return (
            <div key={i}>
              {flux && i > 0 ? <div style={{marginLeft: 26, height: 16, borderLeft: `4px solid ${COULEURS.or}88`, opacity: visible ? 1 : 0.12}} /> : null}
              <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: visible ? 1 : 0.14, transform: `scale(${visible ? k : 1})`, transformOrigin: '0 50%'}}>
                {flux ? (
                  <div style={{flex: 'none', width: 56, height: 56, borderRadius: 28, background: COULEURS.or, color: COULEURS.nuit, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 28}}>{i + 1}</div>
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

// ---------------------------------------------------------------- écrans du téléphone
const TEL = {x: 330, y: 150, h: 800};
const ECH = TEL.h / H_CLIP;
const PANNEAU = {x: 900, y: 240, l: 960};
const ZONE = 760;

type Video = {clip: string; sequences: {de: number; a: number; source: number; vitesse: number}[]};

const Flous: React.FC<{clip: Clip; tc: number; ech: number; decalY?: number}> = ({clip, tc, ech, decalY = 0}) => (
  <>
    {clip.flous.filter((f) => tc >= f.t0 && tc <= f.t1).map((f, i) => (
      <div key={i} style={{position: 'absolute', left: f.x * ech, top: (f.y - decalY) * ech, width: f.l * ech, height: f.h * ech, borderRadius: 6,
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: '#8890a855'}} />
    ))}
  </>
);

// Le même extrait, au même instant, dans le téléphone et dans le panneau agrandi.
const VideoClip: React.FC<{video: Video; largeur: number; decalY: number}> = ({video, largeur, decalY}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const clip = CLIPS[video.clip];
  const ech = largeur / 1080;
  const seq = video.sequences.find((s) => t >= s.de && t < s.a) ?? video.sequences[video.sequences.length - 1];
  const tc = seq.source - clip.debut + (Math.min(t, seq.a) - seq.de) * seq.vitesse;
  return (
    <div style={{position: 'absolute', left: 0, top: -decalY * ech, width: largeur, height: H_CLIP * ech}}>
      {video.sequences.map((s, i) => (
        <Sequence key={i} from={Math.round(s.de * FPS)} durationInFrames={Math.max(1, Math.round((s.a - s.de) * FPS))} layout="none">
          <OffthreadVideo src={staticFile(`formation/clips/${video.clip}.mp4`)} muted startFrom={Math.round((s.source - clip.debut) * FPS)} playbackRate={s.vitesse}
            style={{width: largeur, height: H_CLIP * ech, position: 'absolute'}} />
        </Sequence>
      ))}
      <Flous clip={clip} tc={tc} ech={ech} />
    </div>
  );
};

const Ecran: React.FC<{p: Plan; t: number; video: Video; titre: string; etat: EtatDouble; etape?: string}> = ({p, t, video, titre, etat, etape}) => {
  const e = t - p.debut;
  const clip = CLIPS[video.clip];
  const zone = Math.min(Math.max(0, clip.zone), H_CLIP - ZONE);
  const entree = interpolate(e, [0, 0.4], [60, 0], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const k = pop(e, 0.3, 0.45);
  const echP = PANNEAU.l / 1080;
  return (
    <>
      <div style={{position: 'absolute', left: TEL.x, top: TEL.y + entree, width: 1080 * ECH + 28, height: TEL.h + 28, borderRadius: 44, background: '#0d0f1a',
        boxShadow: '0 0 0 3px #2b3152, 0 30px 60px #000c', padding: 14}}>
        <div style={{width: 1080 * ECH, height: TEL.h, borderRadius: 32, overflow: 'hidden', position: 'relative', background: '#000'}}>
          <VideoClip video={video} largeur={1080 * ECH} decalY={0} />
          <div style={{position: 'absolute', left: 4, right: 4, top: zone * ECH, height: ZONE * ECH, border: `4px solid ${COULEURS.or}`, borderRadius: 10, boxShadow: `0 0 16px ${COULEURS.or}88`, opacity: k}} />
        </div>
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <path d={`M ${TEL.x + 1080 * ECH + 22} ${TEL.y + 14 + (zone + ZONE / 2) * ECH} C ${PANNEAU.x - 70} ${TEL.y + 14 + (zone + ZONE / 2) * ECH}, ${PANNEAU.x - 80} ${PANNEAU.y + 300}, ${PANNEAU.x - 12} ${PANNEAU.y + 300}`}
          fill="none" stroke={COULEURS.or} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      </svg>
      <div style={{position: 'absolute', left: PANNEAU.x, top: PANNEAU.y - 70, width: PANNEAU.l, fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: COULEURS.or,
        opacity: fondu(e, 0.1, 0.4), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>🔍 {titre}</div>
      <div style={{position: 'absolute', left: PANNEAU.x, top: PANNEAU.y, width: PANNEAU.l, height: ZONE * echP, borderRadius: 22, overflow: 'hidden', background: '#000',
        boxShadow: `0 0 0 5px ${COULEURS.or}, 0 30px 70px #000d`, transform: `scale(${k})`, transformOrigin: '0 50%'}}>
        <VideoClip video={video} largeur={PANNEAU.l} decalY={zone} />
      </div>
      {etape ? (
        <div style={{position: 'absolute', left: PANNEAU.x, top: PANNEAU.y + ZONE * echP + 30, fontFamily: POLICE, fontWeight: 800, fontSize: 42, color: COULEURS.nuit,
          background: COULEURS.or, borderRadius: 16, padding: '10px 24px'}}>{etape}</div>
      ) : null}
      <Medaillon etat={etat} t={t} entree={p.debut} x={70} y={720} d={220} />
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
    if (prec && (m.phrase !== prec.phrase && m.phrase !== 'live' || m.debut - prec.fin > 0.5 || lettres > 46 || cur.length >= 8 || m.debut - cur[0].debut > 3.2)) fermer();
    cur.push(m);
    const suivant = mots[i + 1];
    if (/[.?!»]$/.test(m.texte) && (!suivant || suivant.debut - m.fin > 0.15)) fermer();
  });
  fermer();
  // un petit mot seul en fin de bloc passe au bloc suivant
  return out;
};

const SousTitres: React.FC<{liste: Bloc[]; t: number}> = ({liste, t}) => {
  const i = liste.findIndex((b, k) => t >= b.debut - 0.05 && t < Math.max(b.fin + 0.35, b.debut + 0.9) && (k === liste.length - 1 || t < liste[k + 1].debut - 0.05));
  if (i < 0) return null;
  const b = liste[i];
  return (
    <div style={{position: 'absolute', left: 160, right: 160, bottom: 26, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16, fontFamily: POLICE, fontWeight: 800, fontSize: 46}}>
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
    } else if (m === 'chapitre') {
      ex.push({t: p.debut, expression: 'sourire'}, {t: p.fin, expression: 'neutre'});
    } else if (m === 'carte') {
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

const videoDe = (p: Plan): Video | null => {
  const v = p.visuel;
  if (v.mode === 'ecran') {
    const clip = nomClip(v.rush!, v.vs!, v.ve!);
    return {clip, sequences: [{de: p.debut, a: p.fin, source: v.vs!, vitesse: Math.max(0.1, (v.ve! - v.vs!) / Math.max(0.5, p.fin - p.debut))}]};
  }
  if (v.mode === 'live' && p.morceaux) {
    const clip = nomClip(p.rush!, p.plage![0], p.plage![1]);
    return {clip, sequences: p.morceaux.map((m) => ({de: m.o0, a: m.o0 + (m.s1 - m.s0), source: m.s0, vitesse: 1}))};
  }
  return null;
};

export const Formation: React.FC<{video: '1A' | '1B'}> = ({video}) => {
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
  const pauses = d.plans.filter((x) => x.type === 'pause');
  const sons: EvenementSonore[] = useMemo(() => {
    const out: EvenementSonore[] = [];
    for (const x of d.plans) {
      if (x.visuel.mode === 'chapitre') out.push({t: Math.max(0, x.debut - 0.1), son: 'whoosh', volume: 0.32});
      if (x.visuel.mode === 'intro') out.push({t: x.debut + 1.9, son: 'ding', volume: 0.25});
      for (const i of x.visuel.mode === 'carte' ? x.instants ?? [] : []) out.push({t: i - 0.05, son: 'pop', volume: 0.12});
      if (x.visuel.mode === 'demo') for (const i of (x.instants ?? []).slice(1)) out.push({t: i, son: 'pop', volume: 0.2});
    }
    return out;
  }, [d]);

  let contenu: React.ReactNode = null;
  if (m === 'intro' || m === 'carte' || m === 'finpartie') {
    contenu = (
      <>
        <Bureau etat={etat} />
        {m === 'intro' ? <Intro p={p} t={t} /> : m === 'finpartie' ? <FinPartie p={p} t={t} /> : <Carte key={idx} p={p} t={t} />}
      </>
    );
  } else if (m === 'chapitre') {
    contenu = <Chapitre p={p} t={t} />;
  } else if (m === 'ecran' || m === 'live') {
    const v = videoDe(p);
    contenu = v ? <Ecran p={p} t={t} video={v} titre={p.visuel.titre ?? ''} etat={etat} /> : null;
  } else if (m === 'muet') {
    const morc = p.visuel.morceaux!;
    const pas = (p.fin - p.debut) / morc.length;
    const k = Math.min(morc.length - 1, Math.floor((t - p.debut) / pas));
    const [a, b, etiquette] = morc[k];
    const v: Video = {clip: nomClip(p.visuel.rush!, a, b), sequences: [{de: p.debut + k * pas, a: p.debut + (k + 1) * pas, source: a, vitesse: (b - a) / pas}]};
    contenu = <Ecran key={k} p={{...p, debut: p.debut + k * pas}} t={t} video={v} titre={p.visuel.titre ?? ''} etat={etat} etape={etiquette} />;
  } else if (m === 'demo') {
    const n = Math.max(1, (p.instants ?? []).filter((x) => t >= x).length);
    contenu = <DemoModuleE etape={(p.visuel.fixe ?? Math.min(3, n)) as EtapeDemo} />;
  }
  const volumeMusique = (fr: number) => {
    const tt = fr / FPS;
    const enPause = pauses.some((x) => tt >= x.debut - 0.3 && tt <= x.fin + 0.3);
    const base = enPause ? 0.16 : 0.055;
    return base * interpolate(fr, [durationInFrames - 45, durationInFrames - 1], [1, 0], CLAMP) * interpolate(fr, [0, 15], [0.6, 1], CLAMP);
  };
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <Fond />
      {contenu}
      {m !== 'chapitre' && m !== 'demo' ? <Bandeau chapitre={chap ? {n: chap.visuel.n!, titre: chap.visuel.titre!} : undefined} /> : null}
      <SousTitres liste={liste} t={t} />
      <Audio src={staticFile(`formation/${video}/voix.wav`)} volume={0.85} />
      <Audio src={staticFile('serie/musique-formation.wav')} volume={volumeMusique} />
      <Effets evenements={sons} />
    </AbsoluteFill>
  );
};

import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EcranVide, ScenePatricia} from '../../apercus/ApercuPatricia';
import {EtapeExpression, EtapeGeste, etatDouble} from '../../commun/animationDouble';
import {CarteContacts} from '../../commun/CarteContacts';
import {CadreEcran} from '../../commun/Ecran';
import {LogoCoin} from '../../commun/LogoCoin';
import {Effets, EvenementSonore} from '../../commun/sons';
import {blocsSousTitres} from '../../commun/SousTitresVoix';
import {pop, prog} from '../../commun/temps';
import {COULEURS, Expression, FORMAT, Geste, POLICE} from '../../theme';
import {EtatDouble} from '../../v2d/Double2D';
import {BrasPatricia2D, Patricia2D, posesPatricia} from '../../v2d/Patricia2D';
import {BarreEtapes, BlocST, MEDAILLON, PlanTel, SousTitresMot, Telephone} from '../ep02/elements';
import {ILLUSTRATIONS} from '../ep02/illustrations';
import bouche from './bouche.json';
import {ILLUSTRATIONS_EP04} from './illustrations';
import {FIN_VOIX, LIAISONS, MOTS, MOTS_CLES, MOTS_FORTS, TEMPS} from './scenario';
import sequenceJson from './sequence.json';
import visemes from './visemes.json';

// Épisode 4 : « Une affiche pro en quelques minutes », présenté par Patricia.
// Montage dynamique de l'épisode 2 (plans de 1,5 à 2,5 s, captures dans le
// téléphone animé, illustrations) et énergie de l'épisode 3 (musique puissante,
// impacts). Séquence : episodes/ep04/montage.py → sequence.json.

type Plan = {
  nom: string;
  debut: number;
  fin: number;
  type: 'P' | 'T' | 'I' | 'CARTE';
  cadre?: 'large' | 'moyen' | 'gros';
  geste?: Geste;
  expression?: Expression;
  doigts?: 1 | 2 | 3 | 4;
  texte?: string;
  illus?: string;
  n?: number;
  partie?: number;
  phase?: number;
} & Partial<PlanTel>;

const PLANS = sequenceJson.plans as unknown as Plan[];
export const DUREE_EP04 = Math.round(PLANS[PLANS.length - 1].fin * FORMAT.fps);
export const FIN_EXTRAIT_EP04 = sequenceJson.fin_extrait;
const DEBUT_CARTE = PLANS.find((p) => p.type === 'CARTE')!.debut;
// la barre des étapes reste jusqu'à la fin de la deuxième génération
const FIN_ETAPES = PLANS.find((p) => p.illus === 'troisAffiches')!.debut - 0.1;
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;
const LOGO = {x: 14, y: 198, taille: 74};
const NUMEROS_A = [FIN_VOIX + 0.35 - DEBUT_CARTE, FIN_VOIX + 1.05 - DEBUT_CARTE];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const planA = (t: number) => PLANS.find((p) => t >= p.debut && t < p.fin) ?? PLANS[PLANS.length - 1];

// ------------------------------------------------------------------ gestes, expressions

const GESTES: EtapeGeste[] = [{t: -10, geste: 'repos'}];
const EXPRESSIONS: EtapeExpression[] = [{t: -10, expression: 'sourire'}];
for (const p of PLANS) {
  if (p.type !== 'P') continue;
  GESTES.push({t: p.debut - 0.15, geste: p.geste ?? 'explique', doigts: p.doigts});
  EXPRESSIONS.push({t: p.debut, expression: p.expression ?? 'neutre'});
}
const etatPatricia = (t: number, fps: number) => etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps, posesPatricia);

// ------------------------------------------------------------------ sous-titres mot par mot

const BLOCS: BlocST[] = (() => {
  const blocs = blocsSousTitres(MOTS, MOTS_CLES, LIAISONS);
  let i = 0;
  return blocs.map((b) => ({
    mots: b.mots.map((m) => {
      const v = MOTS[i++];
      return {texte: m.texte, debut: v.debut, fin: v.fin, cle: !!m.couleur};
    }),
    debut: b.debut,
    fin: b.fin,
  }));
})();

// ------------------------------------------------------------------ musique et bruitages

// Voix normalisée (-14,2 LUFS) jouée à 0,8 ≈ -16,1 LUFS ; musique puissante -15,3 LUFS.
// 16 LU sous la voix sur Patricia (0,145), 10 LU sous la voix en plein écran (0,29).
const niveau = (p: Plan) => (p.type === 'P' ? 0.145 : 0.29);

// Mot clé de la phrase en cours, affiché en grand sur les gros plans : premier mot
// clé (en jaune dans les sous-titres) prononcé pendant le plan, sinon le mot le plus long.
const nettoyer = (m: string) => m.replace(/[«»:,.?!]/g, '').replace(/\u00a0/g, ' ').trim().toUpperCase();
// mots trop pauvres seuls : on affiche le groupe entier prononcé
const GROUPES: Record<string, string> = {BIEN: 'BIEN SÛR', 'PLAÎT': 'TE PLAÎT PAS ?'};
const motClePlan = (p: Plan): {texte: string; a: number} | null => {
  const dedans = MOTS.map((m, i) => ({...m, i})).filter((m) => m.debut >= p.debut - 0.05 && m.debut < p.fin - 0.25);
  if (!dedans.length) return null;
  const cle = dedans.find((m) => MOTS_CLES[m.i]);
  if (cle) {
    // une expression clé (« trois points », « la vendre ») s'affiche entière
    let fin = cle.i;
    while (MOTS_CLES[fin + 1] && MOTS[fin + 1].debut < p.fin) fin++;
    const texte = nettoyer(MOTS.slice(cle.i, fin + 1).map((m) => m.texte).join(' '));
    return {texte, a: cle.debut};
  }
  const long = [...dedans].sort((x, y) => nettoyer(y.texte).length - nettoyer(x.texte).length)[0];
  const texte = nettoyer(long.texte);
  return {texte: GROUPES[texte] ?? texte, a: long.debut};
};


const EVENEMENTS: EvenementSonore[] = (() => {
  const e: EvenementSonore[] = [];
  const s = (t: number, son: EvenementSonore['son'], volume: number) => e.push({t, son, volume});
  PLANS.forEach((p, i) => {
    if (i > 0 && p.type !== PLANS[i - 1].type) s(p.debut - 0.06, 'whoosh', 0.12);
    if (p.type === 'T' && p.icone) s(p.debut + 0.12, 'pop', 0.2);
    if (p.type === 'I' && p.illus === 'etape') s(p.debut + 0.05, 'impact', 0.2);
    if (p.type === 'I' && p.illus === 'infosAffiche') for (let k = 0; k < 4; k++) s(p.debut + 0.35 + k * 0.28, 'pop', 0.14);
    if (p.texte === 'GRATUIT') s(p.debut + 0.05, 'tampon', 0.34);
    if (p.texte && !['outils', 'GRATUIT', 'nom'].includes(p.texte)) s(p.debut + 0.05, 'boum', 0.22);
    if (p.type === 'P' && p.cadre === 'gros' && !p.texte) {
      const c = motClePlan(p);
      if (c) s(c.a, 'impact', 0.16);
    }
    if (p.type === 'I' && p.illus === 'prompt' && p.partie === 1) s(p.debut + 0.05, 'pop', 0.18);
    if (p.type === 'I' && p.illus === 'zoomAffiche') s(p.debut, p.partie === 5 ? 'succes' : 'ding', p.partie === 5 ? 0.16 : 0.12);
    if (p.type === 'T' && (p as {pourcent?: number[]}).pourcent?.[1] === 100) s(p.fin - 0.1, 'ding', 0.18);
    if (p.type === 'I' && p.illus === 'troisAffiches') for (let k = 0; k < 3; k++) s(p.debut + 0.05 + k * 0.18, 'pop', 0.15);
    if (p.type === 'I' && p.illus === 'comparaison') s(p.debut + 0.7, 'succes', 0.14);
    if (p.type === 'I' && p.illus === 'vendre' && p.partie === 2) s(p.debut + 0.1, 'pieces', 0.24);
    if (p.type === 'I' && p.illus === 'vendre' && p.partie === 3) s(p.debut + 0.1, 'pieces', 0.2);
    if (p.type === 'I' && p.illus === 'commentaireAffiche') for (let k = 0; k < 7; k++) s(p.debut + 0.25 + k * 0.085, 'clic', 0.2);
    if (p.texte === 'nom' && PLANS[i - 1]?.texte !== 'nom') s(p.debut + 0.1, 'pop', 0.18);
    if (p.type === 'CARTE') {
      s(p.debut - 2.0, 'riser', 0.22);
      s(p.debut, 'boum', 0.3);
      s(p.debut + 0.05, 'fin', 0.26);
      for (const a of NUMEROS_A) s(p.debut + a, 'ding', 0.16);
    }
  });
  s(0, 'boum', 0.24); // l'affiche claque à l'ouverture
  s(PLANS[1].debut + 0.15, 'succes', 0.12); // balayage de lumière sur l'affiche
  for (const k of [MOTS[10].debut, MOTS[11].debut, MOTS[13].debut]) s(k, 'pop', 0.16); // les trois outils de l'accroche
  for (const k of [TEMPS.telephone, TEMPS.chatgpt, TEMPS.pinterest]) s(k - 0.04, 'impact', 0.18);
  for (const k of [TEMPS.tiktok, TEMPS.whatsapp, TEMPS.partout, TEMPS.commercants, TEMPS.eglises, TEMPS.ecoles, TEMPS.entreprises]) s(k, 'pop', 0.17);
  return e.sort((a, b) => a.t - b.t);
})();

// ------------------------------------------------------------------ Patricia

const punch = (t: number) => {
  let z = 0;
  for (const m of MOTS_FORTS) {
    const d = t - m;
    if (d >= -0.02 && d < 0.7) z = Math.max(z, d < 0.08 ? (d + 0.02) / 0.1 : Math.exp(-(d - 0.08) * 5));
  }
  return 1 + 0.12 * z;
};

const CADRES = {
  large: {s: 1, o: '540px 1100px'},
  moyen: {s: 1.5, o: '540px 1180px'},
  gros: {s: 2.25, o: '540px 1120px'},
};

// Écran du décor : vignette de l'affiche finale (jamais le grand logo, donc le petit
// logo du coin reste) ; contenu entre y 475 et 805 de l'image, entier dans le plan
// moyen même pendant les zooms brusques.
const EcranAffiche: React.FC<{t: number}> = ({t}) => (
  <CadreEcran titre="Lomé IA School" droite="Tutoriel">
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: POLICE}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 900, height: 900, marginLeft: -450, marginTop: -450, transform: `rotate(${t * 25}deg)`, opacity: 0.25, background: `conic-gradient(${COULEURS.violet}, transparent 25%, ${COULEURS.or} 50%, transparent 75%, ${COULEURS.violet})`}} />
      <div style={{position: 'absolute', left: 130, top: 235, width: 220, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: `0 0 0 4px ${COULEURS.or}, 0 0 40px ${COULEURS.or}88`, transform: `rotate(${-3 + Math.sin(t * 1.6) * 1.5}deg)`}}>
        <Img src={staticFile('episodes/ep04/affiche1.png')} style={{width: 220, height: 330}} />
      </div>
      <div style={{position: 'absolute', left: 400, top: 290, color: COULEURS.blanc, fontWeight: 800, fontSize: 56, lineHeight: 1.08}}>
        Une affiche
        <br />
        <span style={{color: COULEURS.or}}>pro</span> en
        <br />
        quelques minutes
      </div>
    </div>
  </CadreEcran>
);

const Personnage: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {fps} = useVideoConfig();
  const etat = etatPatricia(t, fps);
  const c = CADRES[p.cadre ?? 'moyen'];
  const local = t - p.debut;
  const entree = interpolate(local, [0, 0.12], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const s = c.s * entree * (1 + 0.025 * local) * punch(t);
  // texte animé par-dessus Patricia : écran du décor sans texte, pour ne rien superposer
  const gros = p.cadre === 'gros' || !!p.texte;
  return (
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: c.o}}>
      {/* en gros plan : ni enseigne (coupée par le bord) ni texte sur l'écran (coupé en haut) */}
      <ScenePatricia etat={etat} enseigne={p.cadre !== 'gros'} ecran={gros ? <EcranVide /> : <EcranAffiche t={t} />} />
    </AbsoluteFill>
  );
};

// Médaillon de Patricia (captures et illustrations), même place que celui de Joseph.
const MedaillonPatricia: React.FC<{etat: EtatDouble; t: number; entree: number}> = ({etat, t, entree}) => {
  const {x, y, d} = MEDAILLON;
  const s = 0.82;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: d, height: d, borderRadius: '50%', overflow: 'hidden', background: `radial-gradient(circle at 50% 35%, #3b2f8a, ${COULEURS.nuit} 75%)`, boxShadow: `0 0 0 6px ${COULEURS.or}, 0 16px 40px #000b`, transform: `scale(${pop(t - entree, 0, 0.3)})`}}>
      <div style={{position: 'absolute', left: d / 2 - 540 * s, top: d * 0.52 - 1110 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Patricia2D etat={etat} />
        <BrasPatricia2D etat={etat} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ textes par-dessus Patricia

const CONTOUR = {WebkitTextStroke: `14px ${COULEURS.nuit}`, paintOrder: 'stroke fill'} as const;

// « Avec mon téléphone, ChatGPT et Pinterest » : trois pastilles qui surgissent à leur mot.
const Outils: React.FC<{t: number}> = ({t}) => {
  const items: [string, number][] = [['📱 Téléphone', MOTS[10].debut], ['ChatGPT', MOTS[11].debut], ['Pinterest', MOTS[13].debut]];
  return (
    <div style={{position: 'absolute', left: 50, width: 900, top: 360, display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', fontFamily: POLICE}}>
      {items.map(([nom, a], i) =>
        t >= a - 0.05 ? (
          <div key={nom} style={{padding: '10px 28px', borderRadius: 999, background: i ? COULEURS.violet : COULEURS.or, color: COULEURS.nuit, fontSize: 52, fontWeight: 800, transform: `scale(${interpolate(t, [a - 0.05, a + 0.08, a + 0.2], [2, 0.92, 1], clamp)}) rotate(${(i - 1) * 3}deg)`, boxShadow: '0 10px 30px #000a', whiteSpace: 'nowrap'}}>
            {nom}
          </div>
        ) : null
      )}
    </div>
  );
};

const Tampon: React.FC<{texte: string; t: number}> = ({texte, t}) => (
  <div style={{position: 'absolute', left: 50, width: 900, top: 380, display: 'flex', justifyContent: 'center', fontFamily: POLICE}}>
    <div style={{padding: '6px 40px', border: `12px solid #22d36b`, borderRadius: 30, color: '#22d36b', fontSize: 150, fontWeight: 800, letterSpacing: 6, background: '#0b2a20cc', transform: `scale(${interpolate(t, [0, 0.12, 0.24], [2.6, 0.92, 1], clamp)}) rotate(-8deg)`, opacity: prog(t, 0, 0.05), boxShadow: '0 20px 50px #000c'}}>
      {texte}
    </div>
  </div>
);

// Présentation : « Patricia · Assistante de Lomé IA School ».
const Bandeau: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 50, width: 900, top: 350, display: 'flex', justifyContent: 'center', fontFamily: POLICE, transform: `translateY(${(1 - pop(t, 0, 0.35)) * -60}px)`, opacity: prog(t, 0, 0.1)}}>
    <div style={{padding: '14px 38px', borderRadius: 30, background: `${COULEURS.nuit}e6`, boxShadow: `0 0 0 5px ${COULEURS.or}, 0 14px 40px #000a`, textAlign: 'center'}}>
      <div style={{fontSize: 78, fontWeight: 800, color: COULEURS.or, lineHeight: 1.05}}>Patricia</div>
      <div style={{fontSize: 46, fontWeight: 700, color: COULEURS.blanc}}>Assistante de Lomé IA School</div>
    </div>
  </div>
);

const GrosTexte: React.FC<{texte: string; t: number}> = ({texte, t}) => (
  <div style={{position: 'absolute', left: 50, width: 900, top: 380, textAlign: 'center', fontFamily: POLICE, fontSize: 130, fontWeight: 800, color: COULEURS.or, ...CONTOUR, textShadow: `0 0 50px ${COULEURS.or}88`, transform: `scale(${interpolate(t, [0, 0.12, 0.24], [2, 0.94, 1], clamp)}) rotate(-3deg)`}}>
    {texte}
  </div>
);

const MotCle: React.FC<{texte: string; t: number}> = ({texte, t}) => (
  <div style={{position: 'absolute', left: 50, width: 900, top: 390, display: 'flex', justifyContent: 'center', fontFamily: POLICE, opacity: prog(t, -0.02, 0.04)}}>
    <div style={{padding: '4px 34px', borderRadius: 26, background: `${COULEURS.nuit}d9`, border: `8px solid ${COULEURS.or}`, color: COULEURS.or, fontSize: texte.length > 12 ? 92 : 120, fontWeight: 800, letterSpacing: 3, whiteSpace: 'nowrap', transform: `scale(${interpolate(t, [0, 0.12, 0.24], [2.4, 0.92, 1], clamp)}) rotate(-6deg)`, boxShadow: `0 20px 50px #000c, 0 0 40px ${COULEURS.or}66`}}>
      {texte}
    </div>
  </div>
);

// Pourcentage de la génération accélérée, en grand au milieu de l'écran du téléphone.
const Pourcent: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const [a, b] = (p as {pourcent?: [number, number]}).pourcent!;
  const v = Math.round(interpolate(t, [p.debut, p.fin - 0.1], [a, b], clamp));
  return (
    <div style={{position: 'absolute', left: 240, width: 600, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: POLICE}}>
      <div style={{padding: '6px 34px', borderRadius: 30, background: COULEURS.or, color: COULEURS.nuit, fontSize: 96, fontWeight: 800, boxShadow: `0 16px 40px #000c, 0 0 50px ${COULEURS.or}88`, transform: `scale(${1 + 0.04 * Math.sin(t * 14)})`}}>
        {v} %
      </div>
      <div style={{marginTop: 14, width: 520, height: 22, borderRadius: 11, background: '#ffffff33', overflow: 'hidden'}}>
        <div style={{width: `${v}%`, height: '100%', background: COULEURS.or}} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ composition

export const Episode04: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = planA(t);
  const etat = etatPatricia(t, fps);
  const debutMedaillon = (() => {
    let i = PLANS.indexOf(p);
    while (i > 0 && PLANS[i - 1].type !== 'P') i--;
    return PLANS[i].debut;
  })();
  const Illus = p.type === 'I' ? ILLUSTRATIONS_EP04[p.illus!] ?? ILLUSTRATIONS[p.illus!] : null;
  const medaillon = (p.type === 'T' || (p.type === 'I' && !['affiche', 'zoomAffiche'].includes(p.illus!))) && t < DEBUT_CARTE && !(p as {sansMedaillon?: boolean}).sansMedaillon;
  const local = t - p.debut;
  const cle = p.type === 'P' && p.cadre === 'gros' && !p.texte ? motClePlan(p) : null;
  const premierPlanNom = p.texte === 'nom' && PLANS[PLANS.indexOf(p) - 1]?.texte !== 'nom';
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      {p.type === 'P' ? <Personnage p={p} t={t} /> : null}
      {p.type === 'T' ? (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #232a75 0%, ${COULEURS.nuit} 70%)`}}>
          <Telephone p={p as PlanTel} t={t} dossier="episodes/ep04/plans" />
        </AbsoluteFill>
      ) : null}
      {Illus ? <Illus t={local} d={p.fin - p.debut} tg={t} temps={TEMPS} n={p.n} texte={p.texte} partie={p.partie} phase={p.phase} /> : null}
      {p.type === 'P' && p.texte === 'outils' ? <Outils t={t} /> : null}
      {p.type === 'P' && p.texte === 'GRATUIT' ? <Tampon texte="GRATUIT" t={local} /> : null}
      {p.type === 'P' && p.texte === 'nom' ? <Bandeau t={premierPlanNom ? local : 1} /> : null}
      {p.type === 'P' && p.texte && !['outils', 'GRATUIT', 'nom'].includes(p.texte) ? <GrosTexte texte={p.texte} t={local} /> : null}
      {p.type === 'P' && p.cadre === 'gros' && !p.texte && cle ? <MotCle texte={cle.texte} t={t - cle.a} /> : null}
      {p.type === 'T' && (p as {pourcent?: number[]}).pourcent ? <Pourcent p={p} t={t} /> : null}
      {p.type === 'CARTE' ? <CarteContacts t={t - DEBUT_CARTE} numeros={NUMEROS_A} lien={0.1} /> : null}
      {medaillon ? <MedaillonPatricia etat={etat} t={t} entree={debutMedaillon} /> : null}

      {/* titre de l'épisode en surimpression pendant les 2 premières secondes */}
      {t < 2 ? (
        <div style={{position: 'absolute', left: 50, width: 900, top: 225, textAlign: 'center', fontFamily: POLICE, opacity: 1 - prog(t, 1.75, 2), transform: `scale(${1 - prog(t, 1.75, 2) * 0.1})`}}>
          <div style={{display: 'inline-block', padding: '8px 28px', borderRadius: 999, background: COULEURS.violet, color: COULEURS.nuit, fontWeight: 800, fontSize: 44}}>Une astuce IA · Épisode 4</div>
          <div style={{marginTop: 10, color: COULEURS.blanc, fontWeight: 800, fontSize: 88, lineHeight: 1.04, ...CONTOUR}}>
            Une affiche <span style={{color: COULEURS.or}}>pro</span> en quelques minutes
          </div>
        </div>
      ) : null}

      {p.type !== 'CARTE' ? <LogoCoin position={LOGO} /> : null}
      <BarreEtapes t={t} debuts={[TEMPS.etape1, TEMPS.etape2, TEMPS.etape3]} apparition={TEMPS.etape1 - 0.1} disparition={FIN_ETAPES} noms={['Texte', 'Modèle', 'Affiche']} sansLibelle />
      {p.type !== 'CARTE' ? <SousTitresMot blocs={BLOCS} t={t} /> : null}

      <Audio src={staticFile('episodes/ep04/voix-dynamique.wav')} volume={0.8} />
      <Audio
        src={staticFile('serie/musique-puissante.wav')}
        volume={(f) => {
          const tt = f / fps;
          const q = planA(tt);
          const v = interpolate(tt, [q.debut, q.debut + 0.2], [niveau(planA(q.debut - 0.01)), niveau(q)], clamp);
          return v * interpolate(f, [DUREE_EP04 - 40, DUREE_EP04 - 1], [1, 0], clamp);
        }}
      />
      <Effets evenements={EVENEMENTS} />
    </AbsoluteFill>
  );
};

import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EtapeExpression, EtapeGeste, etatDouble} from '../../commun/animationDouble';
import {CarteContacts} from '../../commun/CarteContacts';
import {CadreEcran, Etoile} from '../../commun/Ecran';
import {LogoCoin} from '../../commun/LogoCoin';
import {Effets, EvenementSonore} from '../../commun/sons';
import {blocsSousTitres} from '../../commun/SousTitresVoix';
import {pop, prog} from '../../commun/temps';
import {COULEURS, Expression, FORMAT, Geste, POLICE} from '../../theme';
import {Scene2D} from '../../v2d/Scene2D';
import bouche from './bouche.json';
import {BarreEtapes, BlocST, Medaillon, PlanTel, SousTitresMot, Telephone} from './elements';
import {ILLUSTRATIONS} from './illustrations';
import {FIN_VOIX, LIAISONS, MOTS, MOTS_CLES, MOTS_FORTS, TEMPS} from './scenario';
import sequenceJson from './sequence.json';
import visemes from './visemes.json';

// Épisode 2, montage dynamique : un changement visuel toutes les 1 à 2,5 s,
// alternance personnage (plans large, moyen, gros, zooms brusques), captures
// dans un téléphone animé et illustrations animées, avec le personnage en
// médaillon dès qu'il n'est pas à l'image.

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
  ecran?: string;
  illus?: string;
  n?: number;
  partie?: number;
  phase?: number;
} & Partial<PlanTel>;

const PLANS = sequenceJson.plans as unknown as Plan[];
export const DUREE_EP02 = Math.round(PLANS[PLANS.length - 1].fin * FORMAT.fps);
const DEBUT_CARTE = PLANS.find((p) => p.type === 'CARTE')!.debut;
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;
const LOGO = {x: 14, y: 198, taille: 74};
// Les deux numéros de la carte de fin surgissent après la voix (temps relatifs à la carte).
const NUMEROS_A = [FIN_VOIX + 0.35 - DEBUT_CARTE, FIN_VOIX + 1.05 - DEBUT_CARTE];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ------------------------------------------------------------------ gestes, expressions

const GESTES: EtapeGeste[] = [{t: -10, geste: 'repos'}];
const EXPRESSIONS: EtapeExpression[] = [{t: -10, expression: 'neutre'}];
for (const p of PLANS) {
  if (p.type !== 'P' && p.illus !== 'vision') continue;
  GESTES.push({t: p.debut - 0.15, geste: p.geste ?? 'explique', doigts: p.doigts});
  EXPRESSIONS.push({t: p.debut, expression: p.expression ?? 'neutre'});
}

// ------------------------------------------------------------------ sous-titres mot par mot

const BLOCS: BlocST[] = (() => {
  const blocs = blocsSousTitres(MOTS, MOTS_CLES, LIAISONS);
  let i = 0;
  return blocs.map((b) => {
    const mots = b.mots.map((m) => {
      const v = MOTS[i++];
      return {texte: m.texte, debut: v.debut, fin: v.fin, cle: !!m.couleur};
    });
    return {mots, debut: b.debut, fin: b.fin};
  });
})();

// ------------------------------------------------------------------ musique et bruitages

// Voix à 0,8 ≈ -15,7 LUFS ; musique à 1 ≈ -16,4 LUFS. 16 LU sous la voix sur le
// personnage (gain 0,172), 10 LU sous la voix en plein écran (0,343).
const MUSIQUE_PERSO = 0.172;
const MUSIQUE_PLEIN = 0.343;
const niveau = (p: Plan) => (p.type === 'P' || p.illus === 'vision' ? MUSIQUE_PERSO : MUSIQUE_PLEIN);
const planA = (t: number) => PLANS.find((p) => t >= p.debut && t < p.fin) ?? PLANS[PLANS.length - 1];

const EVENEMENTS: EvenementSonore[] = (() => {
  const e: EvenementSonore[] = [];
  PLANS.forEach((p, i) => {
    if (i > 0 && p.type !== PLANS[i - 1].type) e.push({t: p.debut - 0.06, son: 'whoosh', volume: 0.1});
    if (p.type === 'T' && p.icone) e.push({t: p.debut + 0.12, son: 'pop', volume: 0.2});
    if (p.type === 'I') {
      const sons: Record<string, EvenementSonore['son']> = {fusee: 'decollage', enLigne: 'tampon', commission: 'pieces', etape: 'lettre'};
      e.push({t: p.debut + (p.illus === 'enLigne' ? 0.15 : 0.05), son: sons[p.illus!] ?? 'pop', volume: p.illus === 'fusee' ? 0.32 : 0.18});
    }
    if (p.illus === 'recherche') for (let k = 0; k < 12; k++) e.push({t: p.debut + 0.05 + k * 0.06, son: 'clic', volume: 0.2});
    if (p.type === 'CARTE') {
      e.push({t: p.debut, son: 'fin', volume: 0.3});
      for (const a of NUMEROS_A) e.push({t: p.debut + a, son: 'ding', volume: 0.16});
    }
  });
  for (const cle of ['vitrine', 'formationsChemin', 'inscription', 'ama', 'ecole', 'cible', 'formations', 'payer', 'recevoir', 'affiliation']) {
    if (['ecole', 'cible', 'recevoir', 'affiliation'].includes(cle)) continue; // seuls les items vus à l'écran
    e.push({t: TEMPS[cle], son: 'ding', volume: 0.16});
  }
  return e.sort((a, b) => a.t - b.t);
})();

// ------------------------------------------------------------------ personnage

const punch = (t: number) => {
  // zoom brusque sur les mots forts : +12 % en 0,08 s, retour en 0,6 s
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

// Écran derrière le personnage : logo animé de l'école sur fond qui tourne.
// Pendant un gros texte (« Presque tout le monde la saute »…), le logo est masqué :
// seul le fond animé reste, pour que le texte se lise sans rien derrière.
const EcranPerso: React.FC<{p: Plan; t: number}> = ({p, t}) => (
  <CadreEcran titre="Lomé IA School" droite="lomeiaschool">
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 900, height: 900, marginLeft: -450, marginTop: -450, transform: `rotate(${t * 25}deg)`, opacity: 0.25, background: `conic-gradient(${COULEURS.violet}, transparent 25%, ${COULEURS.or} 50%, transparent 75%, ${COULEURS.violet})`}} />
      <div style={{position: 'absolute', inset: 0, display: p.texte ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', gap: 34}}>
        <Img src={staticFile('marque/logo.jpg')} style={{width: 280, height: 280, borderRadius: 50, transform: `translateY(${Math.sin(t * 2.4) * 10}px) rotate(${Math.sin(t * 1.6) * 3}deg)`, boxShadow: `0 0 50px ${COULEURS.or}88`}} />
        <div style={{transform: `rotate(${t * 60}deg)`}}>
          <Etoile taille={90} couleur={COULEURS.or} />
        </div>
      </div>
    </div>
  </CadreEcran>
);

const Personnage: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {fps} = useVideoConfig();
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const c = CADRES[p.cadre ?? 'moyen'];
  // léger travelling permanent + zoom d'entrée brusque + zooms sur les mots forts
  const local = t - p.debut;
  const entree = interpolate(local, [0, 0.12], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const derive = 1 + 0.025 * local;
  const s = c.s * entree * derive * punch(t);
  return (
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: c.o}}>
      <Scene2D etat={etat} ecran={<EcranPerso p={p} t={t} />} />
    </AbsoluteFill>
  );
};

// Gros texte animé par-dessus le personnage (« LA PLUS IMPORTANTE », « VISION »…).
const GrosTexte: React.FC<{texte: string; t: number; taille?: number; y?: number}> = ({texte, t, taille = 96, y = 410}) => (
  <div style={{position: 'absolute', left: 40, right: 140, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 34, rowGap: 0, fontFamily: POLICE}}>
    {texte.split(' ').map((mot, m) => (
      <span key={m} style={{display: 'inline-flex', whiteSpace: 'nowrap'}}>
        {mot.split('').map((l, j) => {
          const i = m * 4 + j;
          return (
            <span
              key={j}
              style={{
                display: 'inline-block',
                fontSize: taille,
                fontWeight: 800,
                color: COULEURS.or,
                WebkitTextStroke: `14px ${COULEURS.nuit}`,
                paintOrder: 'stroke fill',
                textShadow: `0 0 40px ${COULEURS.or}88`,
                transform: `translateY(${(1 - pop(t, 0.03 * i, 0.3)) * -120}px) scale(${pop(t, 0.03 * i, 0.3)}) rotate(${Math.sin(t * 6 + i) * 3}deg)`,
              }}
            >
              {l}
            </span>
          );
        })}
      </span>
    ))}
  </div>
);

const Vision: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const instant = (p.phase === 1 ? TEMPS.vision1 : TEMPS.vision2) - p.debut;
  return (
    <>
      <Personnage p={{...p, cadre: 'gros'}} t={t} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, transparent 30%, ${COULEURS.nuit}cc 80%)`}} />
      {local >= instant - 0.05 ? (
        <div style={{position: 'absolute', left: 0, right: 90, top: 300, textAlign: 'center', fontFamily: POLICE}}>
          {p.phase === 2 ? <div style={{fontSize: 64, fontWeight: 800, color: COULEURS.blanc, WebkitTextStroke: `10px ${COULEURS.nuit}`, paintOrder: 'stroke fill', transform: `scale(${pop(local, 0, 0.3)})`}}>Elle exécute ta</div> : null}
          <div style={{fontSize: 160, fontWeight: 800, letterSpacing: 6, color: COULEURS.or, WebkitTextStroke: `16px ${COULEURS.nuit}`, paintOrder: 'stroke fill', transform: `scale(${interpolate(local - instant, [0, 0.12, 0.3], [1.7, 0.94, 1], clamp) * (1 + 0.04 * Math.sin(local * 8))}) rotate(${-4 + Math.sin(local * 3) * 2}deg)`, textShadow: `0 0 70px ${COULEURS.or}`}}>
            VISION
          </div>
        </div>
      ) : null}
    </>
  );
};

// ------------------------------------------------------------------ composition

export const Episode02: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = planA(t);
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const debutMedaillon = (() => {
    let i = PLANS.indexOf(p);
    while (i > 0 && PLANS[i - 1].type !== 'P' && PLANS[i - 1].illus !== 'vision') i--;
    return PLANS[i].debut;
  })();
  const Illus = p.type === 'I' && p.illus !== 'vision' ? ILLUSTRATIONS[p.illus!] : null;
  const medaillon = (p.type === 'T' || (p.type === 'I' && p.illus !== 'vision')) && t < DEBUT_CARTE;
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      {p.type === 'P' ? <Personnage p={p} t={t} /> : null}
      {p.illus === 'vision' ? <Vision p={p} t={t} /> : null}
      {p.type === 'T' ? (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #232a75 0%, ${COULEURS.nuit} 70%)`}}>
          <Telephone p={p as PlanTel} t={t} />
        </AbsoluteFill>
      ) : null}
      {Illus ? <Illus t={t - p.debut} d={p.fin - p.debut} tg={t} temps={{...TEMPS, formations: TEMPS.formations}} n={p.n} texte={p.texte} partie={p.partie} phase={p.phase} /> : null}
      {p.type === 'P' && p.texte ? <GrosTexte texte={p.texte} t={t - p.debut} taille={p.texte.length > 16 ? 84 : 100} /> : null}
      {p.type === 'CARTE' ? <CarteContacts t={t - DEBUT_CARTE} numeros={NUMEROS_A} lien={0.1} /> : null}
      {medaillon ? <Medaillon etat={etat} t={t} entree={debutMedaillon} /> : null}

      {/* titre de l'épisode en surimpression pendant les 2 premières secondes */}
      {t < 2 ? (
        <div style={{position: 'absolute', left: 50, right: 140, top: 230, textAlign: 'center', fontFamily: POLICE, opacity: 1 - prog(t, 1.75, 2), transform: `scale(${1 - prog(t, 1.75, 2) * 0.1})`}}>
          <div style={{display: 'inline-block', padding: '10px 28px', borderRadius: 999, background: COULEURS.violet, color: COULEURS.nuit, fontWeight: 800, fontSize: 40}}>Une astuce IA · Épisode 2</div>
          <div style={{marginTop: 16, color: COULEURS.blanc, fontWeight: 800, fontSize: 86, lineHeight: 1.04, WebkitTextStroke: `14px ${COULEURS.nuit}`, paintOrder: 'stroke fill'}}>
            J’ai créé ce site depuis <span style={{color: COULEURS.or}}>mon téléphone</span>
          </div>
        </div>
      ) : null}

      {p.type !== 'CARTE' ? <LogoCoin position={LOGO} /> : null}
      <BarreEtapes t={t} debuts={[TEMPS.etape1, TEMPS.etape2, TEMPS.etape3, TEMPS.etape4, TEMPS.etape5]} apparition={TEMPS.etape1 - 0.1} disparition={TEMPS.retiens - 0.1} />
      <SousTitresMot blocs={BLOCS} t={t} />

      <Audio src={staticFile('episodes/ep02/voix-dynamique.wav')} volume={0.8} />
      <Audio
        src={staticFile('serie/musique-energie.wav')}
        volume={(f) => {
          const tt = f / fps;
          const q = planA(tt);
          const v = interpolate(tt, [q.debut, q.debut + 0.2], [niveau(planA(q.debut - 0.01)), niveau(q)], clamp);
          return v * interpolate(f, [DUREE_EP02 - 40, DUREE_EP02 - 1], [1, 0], clamp);
        }}
      />
      <Effets evenements={EVENEMENTS} />
    </AbsoluteFill>
  );
};

export {FIN_VOIX};

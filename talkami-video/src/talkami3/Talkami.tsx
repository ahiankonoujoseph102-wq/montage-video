import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EtapeExpression, EtapeGeste, etatDouble} from '../commun/animationDouble';
import {CarteContacts} from '../commun/CarteContacts';
import {CadreEcran, Etoile} from '../commun/Ecran';
import {LogoCoin} from '../commun/LogoCoin';
import {blocsSousTitres} from '../commun/SousTitresVoix';
import {pop, prog} from '../commun/temps';
import {BarreEtapes, BlocST, Medaillon, PlanTel, SousTitresMot, Telephone} from '../episodes/ep02/elements';
import {COULEURS, Expression, FORMAT, Geste, POLICE} from '../theme';
import {Scene2D} from '../v2d/Scene2D';
import bouche from './bouche.json';
import {ILLUSTRATIONS} from './illustrations';
import {FIN_VOIX, LIAISONS, MOTS, MOTS_CLES, MOTS_FORTS, REACTIONS, TEMPS} from './scenario';
import sequenceJson from './sequence.json';
import visemes from './visemes.json';

// Vidéo Talkami, version 3 (la version 2 validée reste dans src/talkami/, intacte).
// Même identité (fond violet, double en médaillon, logo, barre des étapes, sous-titres mot par
// mot, carte « Consultation gratuite »), plus percutante d'après l'étude des références :
// voix resserrée (pauses ≤ 0,2 s, tempo × 1,06) et plus présente, transition visible à chaque
// changement de plan (zoom flouté, glissé, éclair blanc sur les révélations), pulsations sur
// les mots clés des illustrations, réactions en émojis 3D, gros textes sur les plans du
// personnage, boucle ouverte dans l'accroche, coupure de musique avant les révélations.

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
  bandeau?: boolean;
  illus?: string;
  n?: number;
  phase?: number;
  de?: number;
  a?: number;
  tap?: number;
} & Partial<PlanTel>;

const PLANS = sequenceJson.plans as unknown as Plan[];
export const DUREE_TALKAMI3 = Math.round(PLANS[PLANS.length - 1].fin * FORMAT.fps);
const DEBUT_CARTE = PLANS.find((p) => p.type === 'CARTE')!.debut;
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;
const LOGO = {x: 14, y: 198, taille: 74};
const NUMEROS_A = [FIN_VOIX + 0.6 - DEBUT_CARTE, FIN_VOIX + 1.3 - DEBUT_CARTE];
// Téléphone animé : 1190 px × 0,78 = 928 px, de y 236 à 1164 ; sous-titres sur trois lignes à partir de ≈ 1 224 px.
const ECHELLE_TELEPHONE = 0.78;
const BAS_TELEPHONE = 1185;
const ETAPES_SEANCE = ['Évaluation', 'Leçon', 'Pratique', 'Conversation', 'Bilan'];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ------------------------------------------------------------------ gestes, expressions

const GESTES: EtapeGeste[] = [{t: -10, geste: 'repos'}];
const EXPRESSIONS: EtapeExpression[] = [{t: -10, expression: 'parle'}];
for (const p of PLANS) {
  if (p.type !== 'P') continue;
  GESTES.push({t: p.debut - 0.15, geste: p.geste ?? 'explique', doigts: p.doigts});
  EXPRESSIONS.push({t: p.debut, expression: p.expression ?? 'neutre'});
  // l'expression marquée (grimace, surprise) revient au sourire léger après 1,2 s
  if (p.expression === 'grimace' || p.expression === 'surpris') EXPRESSIONS.push({t: p.debut + 1.2, expression: 'parle'});
}
GESTES.sort((a, b) => a.t - b.t);
EXPRESSIONS.sort((a, b) => a.t - b.t);

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

// ------------------------------------------------------------------ bruitages

// Décalage (s) entre le début du fichier et son impact : le son démarre avant l'instant
// visé pour que son pic tombe pile sur l'image (public/talkami/sfx/decalages.json).
const PIC: Record<string, number> = {
  transition: 0.53, souffle: 0.47, impact: 0.07, impactFort: 0.08, ding: 0.03, pieces: 0.17, jackpot: 0.17, tintement: 0.08,
  frappe: 0, clic: 0.05, bulle: 0.2, magie: 0.35, notif: 0.19, montee: 2.49, erreur: 0, lettre: 0,
};
const SERIE = new Set(['erreur', 'lettre']); // effets générés de la série (public/serie/sfx)
// priorité : deux effets à moins de 0,25 s → seul le plus important est gardé
const PRIORITE = ['impactFort', 'jackpot', 'montee', 'impact', 'ding', 'magie', 'erreur', 'pieces', 'clic', 'bulle', 'notif', 'frappe', 'transition', 'souffle', 'tintement', 'lettre'];
type Evt = {t: number; son: string; volume: number};

// Révélations : « Voici le résultat », « voici mes premiers paiements ».
const REVELATIONS = [TEMPS.resultat, TEMPS.regardePaiements];
const planA = (t: number) => PLANS.find((p) => t >= p.debut && t < p.fin) ?? PLANS[PLANS.length - 1];
const L = (p: Plan, cle: string) => TEMPS[cle];

const EVENEMENTS: Evt[] = (() => {
  const e: Evt[] = [{t: 0, son: 'impactFort', volume: 0.5}, {t: TEMPS.apprendre1 + 0.1, son: 'impact', volume: 0.45}];
  PLANS.forEach((p, i) => {
    const q = PLANS[i - 1];
    const d = p.fin - p.debut;
    if (i > 0 && p.type !== 'CARTE') {
      if (p.type !== q.type) e.push({t: p.debut, son: 'transition', volume: 0.16});
      else if (p.type === 'T' || p.illus !== q.illus) e.push({t: p.debut + 0.05, son: 'souffle', volume: 0.12});
    }
    if (p.type === 'P' && p.texte) e.push({t: p.debut + 0.05, son: 'impact', volume: 0.22});
    if (p.type === 'T') {
      if (p.icone) e.push({t: p.debut + 0.2, son: 'bulle', volume: 0.3});
      if (p.surligne) e.push({t: p.debut + 0.5, son: 'ding', volume: 0.16});
      if (p.tap !== undefined && p.de !== undefined && p.a !== undefined) e.push({t: p.debut + ((p.tap - p.de) / (p.a - p.de)) * d, son: 'clic', volume: 0.4});
    }
    if (p.type === 'I') {
      const a = p.debut;
      switch (p.illus) {
        case 'telephone': e.push({t: a + 0.1, son: 'magie', volume: 0.22}); break;
        case 'sansOrdinateur': e.push({t: a + 0.3, son: 'erreur', volume: 0.3}); break;
        case 'sansCode': e.push({t: a + 0.35, son: 'erreur', volume: 0.3}); break;
        case 'pasArgent': e.push({t: a + 0.35, son: 'tintement', volume: 0.12}); break;
        case 'carte': e.push({t: a + 0.45, son: 'impact', volume: 0.22}); if (p.phase === 2) e.push({t: L(p, 'lycee'), son: 'ding', volume: 0.2}); break;
        case 'prix':
          if (p.phase === 2) e.push({t: L(p, 'sixMois'), son: 'tintement', volume: 0.15}, {t: L(p, 'prix2'), son: 'impact', volume: 0.38});
          else e.push({t: L(p, 'construit'), son: 'erreur', volume: 0.25}, {t: L(p, 'presqueRien'), son: 'ding', volume: 0.28});
          break;
        case 'ampoule': e.push({t: a + 0.15, son: 'magie', volume: 0.28}); break;
        case 'construire': for (let k = 0; k < 4; k++) e.push({t: a + 0.15 + k * (Math.max(0.6, d - 0.6) / 4) + 0.2, son: 'clic', volume: 0.25}); break;
        case 'revelation': e.push({t: a, son: 'magie', volume: 0.35}, {t: a + 0.45, son: 'impactFort', volume: 0.4}); break;
        case 'etape': e.push({t: a + 0.05, son: 'impact', volume: 0.3}); break;
        case 'situations': e.push({t: a + 0.15, son: 'bulle', volume: 0.3}, {t: L(p, 'travail') + 0.15, son: 'bulle', volume: 0.3}, {t: L(p, 'voyage') + 0.15, son: 'bulle', volume: 0.3}); break;
        case 'resultat': e.push({t: a + 0.05, son: 'impact', volume: 0.3}); break;
        case 'niveaux': e.push({t: a + 0.2, son: 'notif', volume: 0.2}); break;
        case 'communaute': for (let k = 0; k < 4; k++) e.push({t: a + 0.3 + k * 0.2, son: 'bulle', volume: 0.14}); break;
        case 'ilsPaient': e.push({t: a + 0.12, son: 'jackpot', volume: 0.38}); break;
        case 'paiements':
          for (const c of ['clients', 'abonnement', 'togo']) e.push({t: L(p, c) + 0.25, son: 'ding', volume: 0.42});
          break;
        case 'nuit': e.push({t: a + 0.45, son: 'bulle', volume: 0.14}, {t: a + 1.05, son: 'bulle', volume: 0.14}, {t: a + 1.65, son: 'bulle', volume: 0.14}); break;
        case 'troisChoses':
          if (p.phase === 1) e.push({t: a + 0.05, son: 'erreur', volume: 0.22}, {t: L(p, 'leMien'), son: 'impact', volume: 0.25});
          else if (p.phase === 2) e.push({t: L(p, 'troisChoses'), son: 'magie', volume: 0.3});
          else for (const c of ['solution', 'service', 'competence']) e.push({t: L(p, c) + 0.3, son: 'ding', volume: 0.22});
          break;
        case 'barrieres': e.push({t: L(p, 'creer') + 0.15, son: 'impact', volume: 0.3}, {t: L(p, 'innover') + 0.15, son: 'impact', volume: 0.3}); break;
        case 'possibles':
          for (const c of ['site', 'application', 'agent', 'automatisation']) e.push({t: L(p, c) + 0.1, son: 'bulle', volume: 0.28});
          e.push({t: L(p, 'possible') + 0.1, son: 'impactFort', volume: 0.3});
          break;
        case 'iceberg': e.push({t: L(p, 'texte') + 0.1, son: 'bulle', volume: 0.25}, {t: L(p, 'image') + 0.1, son: 'bulle', volume: 0.25}, {t: p.fin - 1.2, son: 'souffle', volume: 0.25}); break;
        case 'entreprise': e.push({t: L(p, 'agents') + 0.15, son: 'bulle', volume: 0.3}, {t: L(p, 'automatisations') + 0.15, son: 'bulle', volume: 0.3}); break;
        case 'gains': e.push({t: a + 0.1, son: 'notif', volume: 0.2}, {t: L(p, 'plus') + 0.1, son: 'ding', volume: 0.25}); break;
        case 'ecole': e.push({t: a + 0.05, son: 'magie', volume: 0.3}); break;
        case 'offre': for (const c of ['creePourToi', 'sites', 'agentsIA', 'automatisations2']) e.push({t: L(p, c) + 0.1, son: 'bulle', volume: 0.25}); break;
        case 'consultation': e.push({t: a + 0.15, son: 'ding', volume: 0.25}, {t: L(p, 'url'), son: 'frappe', volume: 0.18}); break;
        case 'whatsapp': e.push({t: a + 0.1, son: 'bulle', volume: 0.3}, {t: L(p, 'numero'), son: 'frappe', volume: 0.18}); break;
        case 'formation': for (const c of ['troisMois', 'deuxCent', 'attestation']) e.push({t: L(p, c) + 0.25, son: 'ding', volume: 0.22}); break;
      }
    }
    if (p.type === 'CARTE') {
      e.push({t: p.debut, son: 'montee', volume: 0.3});
      for (const n of NUMEROS_A) e.push({t: p.debut + n, son: 'ding', volume: 0.18});
    }
  });
  for (const k of ['etape2', 'etape3', 'etape4', 'etape5']) e.push({t: TEMPS[k], son: 'notif', volume: 0.16});
  for (const [a] of REACTIONS) e.push({t: a + 0.08, son: 'bulle', volume: 0.32});
  // révélations : montée qui culmine sur le mot, puis impact (la musique se coupe juste avant)
  for (const d of REVELATIONS) e.push({t: d, son: 'montee', volume: 0.3}, {t: d + 0.02, son: 'impactFort', volume: 0.42});
  // effets toujours nettement sous la voix (mesuré sur le rendu : −3 dB de plus), sauf l'impact d'ouverture
  for (const x of e) if (x.t > 0) x.volume *= 0.7;
  // un seul effet à la fois : on garde le plus important dans chaque fenêtre de 0,25 s
  e.sort((a, b) => a.t - b.t);
  const garde: Evt[] = [];
  for (const x of e) {
    const voisin = garde.find((g) => Math.abs(g.t - x.t) < 0.25);
    if (!voisin) garde.push(x);
    else if (PRIORITE.indexOf(x.son) < PRIORITE.indexOf(voisin.son)) garde.splice(garde.indexOf(voisin), 1, x);
  }
  return garde;
})();

const Effets: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      {EVENEMENTS.map((e, i) => {
        const debut = e.t - (PIC[e.son] ?? 0);
        const coupe = Math.max(0, -debut); // son qui commencerait avant 0 : on saute son début
        return (
          <Sequence key={i} from={Math.max(0, Math.round(debut * fps))} durationInFrames={Math.round(3 * fps)} name={`son ${e.son}`}>
            <Audio src={staticFile(SERIE.has(e.son) ? `serie/sfx/${e.son}.wav` : `talkami/sfx/x_${e.son}.wav`)} volume={e.volume} startFrom={Math.round(coupe * fps)} />
          </Sequence>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ musique

// Musique de Joseph (−8 LUFS) en boucle (fondu enchaîné de 1,5 s). Voix à 0,8 ≈ −16 LUFS.
// Gains : 16 LU sous la voix sur le personnage, 13 LU sur les captures et illustrations,
// 10 LU sur la carte de fin ; fondu de sortie sur la dernière seconde.
const DUREE_MUSIQUE = 143.1;
const FONDU_BOUCLE = 1.5;
const niveauMusique = (p: Plan) => (p.type === 'P' ? 0.064 : p.type === 'CARTE' ? 0.13 : 0.09);
const volumeMusique = (tt: number, total: number) => {
  const q = planA(tt);
  const precedent = planA(q.debut - 0.01);
  const v = interpolate(tt, [q.debut, q.debut + 0.25], [niveauMusique(precedent), niveauMusique(q)], clamp);
  // coupure (presque silence) 0,5 s avant chaque révélation, retour franc sur l'impact
  const coupe = REVELATIONS.reduce((k, d) => k * interpolate(tt, [d - 0.75, d - 0.55, d - 0.02, d + 0.03], [1, 0.12, 0.12, 1], clamp), 1);
  return v * coupe * interpolate(tt, [total - 1, total], [1, 0], clamp);
};

const Musique: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const total = durationInFrames / fps;
  const boucles = Math.ceil(total / (DUREE_MUSIQUE - FONDU_BOUCLE));
  return (
    <>
      {Array.from({length: boucles}, (_, k) => {
        const debut = k * (DUREE_MUSIQUE - FONDU_BOUCLE);
        return (
          <Sequence key={k} from={Math.round(debut * fps)} durationInFrames={Math.round(DUREE_MUSIQUE * fps)} name={`musique ${k + 1}`}>
            <Audio
              src={staticFile('talkami/musique.m4a')}
              volume={(f) => {
                const local = f / fps;
                const entree = k === 0 ? 1 : interpolate(local, [0, FONDU_BOUCLE], [0, 1], clamp);
                const sortie = interpolate(local, [DUREE_MUSIQUE - FONDU_BOUCLE, DUREE_MUSIQUE], [1, 0], clamp);
                return volumeMusique(debut + local, total) * entree * sortie;
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ personnage

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

// Logo de l'écran du décor : toujours entier à l'image. En plan moyen ou gros, le haut de
// l'écran sort du cadre ; on calcule pour chaque plan la partie de l'écran qui reste visible
// au zoom le plus fort du plan (entrée, dérive, zoom sur un mot fort) et on y loge le logo.
const ECRAN_CONTENU = {haut: 306, bas: 840}; // zone sous la barre de titre (MISE_EN_PAGE.ecran + barre)
const placeLogo = (p: Plan) => {
  const c = CADRES[p.cadre ?? 'moyen'];
  const oy = parseFloat(c.o.split(' ')[1]);
  const d = p.fin - p.debut;
  const fort = MOTS_FORTS.some((m) => m > p.debut - 0.7 && m < p.fin);
  const sMax = c.s * Math.max(1.08, 1 + 0.025 * d) * (fort ? 1.12 : 1);
  const visibleHaut = Math.max(ECRAN_CONTENU.haut, oy - oy / sMax) + 14;
  const taille = Math.min(280, ECRAN_CONTENU.bas - 14 - visibleHaut);
  const centre = Math.min(ECRAN_CONTENU.bas - 14 - taille / 2, Math.max((ECRAN_CONTENU.haut + ECRAN_CONTENU.bas) / 2, visibleHaut + taille / 2));
  return {taille, haut: centre - taille / 2 - ECRAN_CONTENU.haut};
};

const EcranPerso: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {taille, haut} = placeLogo(p);
  const k = taille / 280; // le logo et l'étoile gardent leurs proportions
  return (
    <CadreEcran titre="Talkami" droite="Lomé IA School">
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 900, height: 900, marginLeft: -450, marginTop: -450, transform: `rotate(${t * 25}deg)`, opacity: 0.25, background: `conic-gradient(${COULEURS.violet}, transparent 25%, ${COULEURS.or} 50%, transparent 75%, ${COULEURS.violet})`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: haut, height: taille, display: p.texte || taille < 70 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', gap: 34 * k}}>
          <Img src={staticFile('marque/logo.jpg')} style={{width: taille, height: taille, borderRadius: 50 * k, transform: `rotate(${Math.sin(t * 1.6) * 3}deg)`, boxShadow: `0 0 ${50 * k}px ${COULEURS.or}88`}} />
          <div style={{transform: `rotate(${t * 60}deg)`}}>
            <Etoile taille={90 * k} couleur={COULEURS.or} />
          </div>
        </div>
      </div>
    </CadreEcran>
  );
};

const Personnage: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {fps} = useVideoConfig();
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const c = CADRES[p.cadre ?? 'moyen'];
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

const GrosTexte: React.FC<{texte: string; t: number}> = ({texte, t}) => {
  const taille = texte.length > 16 ? 84 : 104;
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: 400, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 34, fontFamily: POLICE}}>
      {texte.split(' ').map((mot, m) => (
        <span key={m} style={{display: 'inline-flex', whiteSpace: 'nowrap'}}>
          {mot.split('').map((l, j) => {
            const i = m * 4 + j;
            return (
              <span key={j} style={{display: 'inline-block', fontSize: taille, fontWeight: 800, color: COULEURS.or, WebkitTextStroke: `14px ${COULEURS.nuit}`, paintOrder: 'stroke fill', textShadow: `0 0 40px ${COULEURS.or}88`, transform: `translateY(${(1 - pop(t, 0.03 * i, 0.3)) * -120}px) scale(${pop(t, 0.03 * i, 0.3)}) rotate(${Math.sin(t * 6 + i) * 3}deg)`}}>
                {l}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

// Bandeau du nom (présentation).
const Bandeau: React.FC<{t: number}> = ({t}) => {
  const e = prog(t, 0.15, 0.5, Easing.out(Easing.back(1.3)));
  return (
    <div style={{position: 'absolute', left: 50, top: 1120, transform: `translateX(${(1 - e) * -900}px)`, fontFamily: POLICE}}>
      <div style={{padding: '14px 34px', borderRadius: '24px 24px 24px 0', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: COULEURS.nuit, fontWeight: 800, fontSize: 62}}>Joseph Ahiankonou</div>
      <div style={{display: 'inline-block', marginTop: 8, padding: '8px 26px', borderRadius: '0 18px 18px 18px', background: COULEURS.nuit, border: `4px solid ${COULEURS.violet}`, color: COULEURS.blanc, fontWeight: 700, fontSize: 38}}>Créateur de Talkami · Lomé IA School</div>
    </div>
  );
};

// ------------------------------------------------------------------ transitions et relances

// Plans qui s'ouvrent sur un éclair blanc (révélations, chiffres, étapes).
const ECLAIR = new Set(['revelation', 'paiements', 'ilsPaient', 'resultat', 'etape', 'ecole', 'possibles']);
// Transition d'entrée de chaque plan (0,2 s) : zoom flouté, glissé (téléphone → téléphone,
// sens alterné) ou éclair blanc. Pas de transition sur l'image 0 (miniature).
const transition = (p: Plan, t: number) => {
  const i = PLANS.indexOf(p);
  const e = i === 0 ? 0 : 1 - prog(t - p.debut, 0, 0.2, Easing.out(Easing.cubic));
  const q = PLANS[i - 1];
  const glisse = q && q.type === p.type && p.type !== 'P';
  const sens = i % 2 ? 1 : -1;
  const eclair = p.type === 'CARTE' || (p.type === 'I' && ECLAIR.has(p.illus ?? ''));
  return {
    transform: glisse ? `translateX(${sens * 170 * e}px) scale(${1 + 0.04 * e})` : `scale(${1 + 0.16 * e})`,
    filter: e > 0.01 ? `blur(${(glisse ? 10 : 14) * e}px)` : undefined,
    blanc: eclair ? 0.55 * e : 0,
  };
};

// Pulsation des illustrations sur leurs mots clés (comme un battement) : +5 % en 0,08 s, retour en 0,5 s.
const INSTANTS = Object.values(TEMPS);
const pulsation = (p: Plan, t: number) => {
  if (p.type !== 'I') return 1;
  let z = 0;
  for (const m of INSTANTS) {
    if (m <= p.debut + 0.3 || m >= p.fin) continue;
    const d = t - m;
    if (d >= -0.02 && d < 0.6) z = Math.max(z, d < 0.08 ? (d + 0.02) / 0.1 : Math.exp(-(d - 0.08) * 6));
  }
  return 1 + 0.05 * z;
};

// Réaction en émoji 3D : surgit (110 % → 100 %), se balance, disparaît en 0,2 s.
const Reactions: React.FC<{t: number}> = ({t}) => (
  <>
    {REACTIONS.map(([a, emoji, x, y], i) => {
      const l = t - a;
      if (l < 0 || l > 1.4) return null;
      const s = interpolate(l, [0, 0.12, 0.22], [0.2, 1.12, 1], clamp) * (1 - prog(l, 1.2, 1.4));
      return (
        <Img key={i} src={staticFile(`talkami3/emoji/${emoji}.png`)} style={{position: 'absolute', left: x, top: y, width: 220, height: 220, transform: `scale(${s}) rotate(${Math.sin(l * 7) * 8}deg)`, filter: 'drop-shadow(0 14px 24px #000a)'}} />
      );
    })}
  </>
);

// Boucle ouverte de l'accroche : promesse d'une preuve plus loin, pour retenir dès 2 s.
const PromesseAccroche: React.FC<{t: number}> = ({t}) => {
  const a = 2.3;
  const b = 5.2;
  if (t < a || t > b) return null;
  const s = pop(t, a, 0.35) * (1 - prog(t, b - 0.2, b));
  return (
    <div style={{position: 'absolute', left: 290, right: 110, top: 1150, display: 'flex', justifyContent: 'center', transform: `scale(${s * (1 + 0.03 * Math.sin(t * 8))})`}}>
      <div style={{padding: '12px 26px', borderRadius: 999, background: COULEURS.nuit, border: `4px solid ${COULEURS.or}`, color: COULEURS.blanc, fontFamily: POLICE, fontWeight: 800, fontSize: 32, whiteSpace: 'nowrap', boxShadow: `0 0 26px ${COULEURS.or}88`}}>
        Reste : je montre mes <span style={{color: COULEURS.or}}>vrais paiements</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ composition

export const Talkami3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = planA(t);
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const debutMedaillon = (() => {
    let i = PLANS.indexOf(p);
    while (i > 0 && PLANS[i - 1].type !== 'P') i--;
    return PLANS[i].debut;
  })();
  const Illus = p.type === 'I' ? ILLUSTRATIONS[p.illus!] : null;
  const medaillon = (p.type === 'T' || p.type === 'I') && t < DEBUT_CARTE;
  const tr = transition(p, t);
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <AbsoluteFill style={{transform: `${tr.transform} scale(${pulsation(p, t)})`, filter: tr.filter}}>
      {p.type === 'P' ? <Personnage p={p} t={t} /> : null}
      {p.type === 'T' ? (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2d2a8a 0%, ${COULEURS.nuit} 70%)`}}>
          <div style={{position: 'absolute', left: 540 - 900, top: 760 - 900, width: 1800, height: 1800, transform: `rotate(${t * 10}deg)`, opacity: 0.1, background: `conic-gradient(${COULEURS.violet}, transparent 12%, ${COULEURS.or} 25%, transparent 37%, ${COULEURS.violet} 50%, transparent 62%, ${COULEURS.or} 75%, transparent 87%, ${COULEURS.violet})`}} />
          {/* téléphone réduit (0,78) et arrêté au-dessus des sous-titres : ils ne le touchent jamais,
              même pendant l'entrée par le bas */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: BAS_TELEPHONE, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, transform: `scale(${ECHELLE_TELEPHONE})`, transformOrigin: '530px 236px'}}>
              <Telephone p={p as PlanTel} t={t} dossier="talkami3/plans" />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {Illus ? <Illus t={t - p.debut} d={p.fin - p.debut} tg={t} temps={TEMPS} n={p.n} texte={p.texte} phase={p.phase} /> : null}
      {p.type === 'P' && p.texte ? <GrosTexte texte={p.texte} t={t - p.debut} /> : null}
      {p.type === 'P' && p.bandeau ? <Bandeau t={t - p.debut} /> : null}
      {p.type === 'CARTE' ? <CarteContacts t={t - DEBUT_CARTE} numeros={NUMEROS_A} lien={0.1} /> : null}
      </AbsoluteFill>
      {tr.blanc > 0 ? <AbsoluteFill style={{background: '#ffffff', opacity: tr.blanc}} /> : null}
      {p.type !== 'CARTE' ? <Reactions t={t} /> : null}
      <PromesseAccroche t={t} />
      {medaillon ? <Medaillon etat={etat} t={t} entree={debutMedaillon} /> : null}

      {p.type !== 'CARTE' ? <LogoCoin position={LOGO} /> : null}
      <BarreEtapes t={t} debuts={[TEMPS.etape1, TEMPS.etape2, TEMPS.etape3, TEMPS.etape4, TEMPS.etape5]} apparition={TEMPS.etape1 - 0.1} disparition={TEMPS.formules - 0.05} noms={ETAPES_SEANCE} />
      {p.type !== 'CARTE' ? <SousTitresMot blocs={BLOCS} t={t} /> : null}

      <Audio src={staticFile('talkami3/voix-st.wav')} volume={0.8} />
      <Musique />
      <Effets />
    </AbsoluteFill>
  );
};

export {FIN_VOIX, EVENEMENTS};

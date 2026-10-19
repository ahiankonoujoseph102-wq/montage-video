import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EtapeExpression, EtapeGeste, etatDouble} from '../../commun/animationDouble';
import {CarteContacts} from '../../commun/CarteContacts';
import {CadreEcran, Etoile} from '../../commun/Ecran';
import {LogoCoin} from '../../commun/LogoCoin';
import {Effets, EvenementSonore} from '../../commun/sons';
import {blocsSousTitres} from '../../commun/SousTitresVoix';
import {prog} from '../../commun/temps';
import {COULEURS, FORMAT, POLICE} from '../../theme';
import {Scene2D} from '../../v2d/Scene2D';
import {BarreEtapes, BlocST, Medaillon, SousTitresMot} from '../ep02/elements';
import {ILLUSTRATIONS} from '../ep02/illustrations';
import {PlanBon, PlanMauvais, PlanNumero, TitreAstuce, VoletDisPlutot} from './Astuce';
import bouche from './bouche.json';
import {ACCENTS, secousse} from './Fonds';
import {ILLUSTRATIONS_EP03, Sauvegarde} from './illustrations';
import {CARTES, FIN_VOIX, LIAISONS, MOTS, MOTS_CLES, MOTS_FORTS, TEMPS} from './scenario';
import {PIECES, PLANS, Plan, TEMPS_ASTUCES, astuceA, b, planA} from './sequence';
import visemes from './visemes.json';

// Épisode 3 : 7 astuces en plans courts (sequence.ts), décor propre à chaque
// astuce, musique puissante, bruitages d'impact.

export const DUREE_EP03 = Math.round(PLANS[PLANS.length - 1].fin * FORMAT.fps);
export const PLANS_EP03 = PLANS;
const DEBUT_FIN = PLANS[PLANS.length - 1].debut;
const NUMEROS_A = [FIN_VOIX + 0.35 - DEBUT_FIN, FIN_VOIX + 1.05 - DEBUT_FIN];
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;
const LOGO = {x: 14, y: 198, taille: 74};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FIN_ACCROCHE = TEMPS_ASTUCES[0].debut;

const GESTES: EtapeGeste[] = [{t: -10, geste: 'repos'}];
const EXPRESSIONS: EtapeExpression[] = [{t: -10, expression: 'neutre'}];
for (const q of PLANS) {
  if (q.type !== 'P') continue;
  GESTES.push({t: q.debut - 0.15, geste: q.geste ?? 'explique', doigts: q.doigts});
  EXPRESSIONS.push({t: q.debut, expression: q.expression ?? 'neutre'});
}

const BLOCS: BlocST[] = (() => {
  const blocs = blocsSousTitres(MOTS, MOTS_CLES, LIAISONS);
  let i = 0;
  return blocs.map((bl) => ({
    mots: bl.mots.map((m) => {
      const v = MOTS[i++];
      return {texte: m.texte, debut: v.debut, fin: v.fin, cle: !!m.couleur};
    }),
    debut: bl.debut,
    fin: bl.fin,
  }));
})();

// ------------------------------------------------------------------ musique et bruitages

// Musique puissante (-15,3 LUFS) : 16 LU sous la voix sur le personnage (0,151),
// 10 LU sous la voix en plein écran et sur la carte de fin (0,302).
const niveau = (q: Plan) => (q.type === 'P' ? 0.151 : 0.302);

const EVENEMENTS: EvenementSonore[] = (() => {
  const e: EvenementSonore[] = [];
  const s = (t: number, son: EvenementSonore['son'], volume: number) => e.push({t, son, volume});
  PLANS.forEach((q, i) => {
    if (i > 0 && q.type !== PLANS[i - 1].type) s(q.debut - 0.06, 'whoosh', 0.12);
    if (q.type === 'I') s(q.debut + 0.05, 'pop', 0.18);
  });
  // accroche
  s(0.0, 'boum', 0.22);
  for (let k = 0; k < 8; k++) s(TEMPS.ameliore + k * 0.055, 'clic', 0.2);
  s(TEMPS.croixAccroche - 0.02, 'tampon', 0.35);
  s(TEMPS.croixAccroche, 'erreur', 0.25);
  s(TEMPS.froisse, 'froisse', 0.45);
  s(TEMPS.froisse + 0.3, 'whoosh', 0.12);
  s(1.85, 'pop', 0.16); // « Sauvegarde cette vidéo »
  // astuces
  TEMPS_ASTUCES.forEach((a, i) => {
    s(a.debut + 0.05, 'pop', 0.16); // barre de progression
    s(a.debut, 'boum', 0.32);
    s(a.chiffre, 'ding', 0.12);
    s(a.debut + 0.12, 'pop', 0.16);
    s(a.neDisPas + 0.05, 'impact', 0.14);
    const nb = Math.round((a.tape[1] - a.tape[0]) / 0.06);
    for (let k = 0; k < nb; k++) s(a.tape[0] + k * 0.06, 'clic', 0.17);
    s(a.reponse, 'erreur', 0.24);
    s(a.tampon - 0.02, 'tampon', 0.36);
    s(a.tampon, 'impact', 0.16);
    s(a.disPlutot + 0.12, 'pop', 0.18);
    for (const p of PIECES[i]) {
      if (p.crochet) {
        s(p.debut, 'impact', 0.15);
        s(p.debut + 0.33, 'whoosh', 0.1);
        s(p.debut + 0.68, 'collage', 0.32);
      } else s(p.debut, 'pop', 0.12);
    }
    s(a.resultat + 0.15, 'ding', 0.18);
    s(a.resultat + 0.2, 'succes', 0.1);
  });
  for (const cle of ['contexte', 'resultat', 'style']) s(TEMPS[cle], 'pop', 0.2);
  s(TEMPS.commentaire + 0.45, 'pop', 0.18);
  // montée avant la carte de fin, impact à l'arrivée
  s(DEBUT_FIN - 2.0, 'riser', 0.22);
  s(DEBUT_FIN, 'boum', 0.3);
  s(DEBUT_FIN + 0.05, 'fin', 0.26);
  for (const a of NUMEROS_A) s(DEBUT_FIN + a, 'ding', 0.16);
  return e.sort((x, y) => x.t - y.t);
})();

// ------------------------------------------------------------------ personnage

const FORTS = [...MOTS_FORTS, ...TEMPS_ASTUCES.map((a) => a.debut), ...TEMPS_ASTUCES.map((a) => a.disPlutot + 0.1)];
const punch = (t: number) => {
  let z = 0;
  for (const m of FORTS) {
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

const EcranPerso: React.FC<{t: number}> = ({t}) => {
  const n = t < TEMPS.remarque ? astuceA(t) : 0;
  return (
    <CadreEcran titre="Lomé IA School" droite="Une astuce IA">
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 900, height: 900, marginLeft: -450, marginTop: -450, transform: `rotate(${t * 25}deg)`, opacity: 0.3, background: `conic-gradient(${n ? ACCENTS[n - 1] : COULEURS.violet}, transparent 25%, ${COULEURS.or} 50%, transparent 75%, ${n ? ACCENTS[n - 1] : COULEURS.violet})`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34}}>
          {n > 0 ? (
            <div style={{width: 280, height: 280, borderRadius: 140, display: 'grid', placeItems: 'center', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: COULEURS.nuit, fontFamily: POLICE, fontWeight: 800, fontSize: 200, transform: `translateY(${Math.sin(t * 2.4) * 10}px)`, boxShadow: `0 0 50px ${COULEURS.or}88`}}>{n}</div>
          ) : (
            <Img src={staticFile('marque/logo.jpg')} style={{width: 280, height: 280, borderRadius: 50, transform: `translateY(${Math.sin(t * 2.4) * 10}px) rotate(${Math.sin(t * 1.6) * 3}deg)`, boxShadow: `0 0 50px ${COULEURS.or}88`}} />
          )}
          <div style={{transform: `rotate(${t * 60}deg)`}}>
            <Etoile taille={90} couleur={COULEURS.or} />
          </div>
        </div>
      </div>
    </CadreEcran>
  );
};

const Personnage: React.FC<{q: Plan; t: number}> = ({q, t}) => {
  const {fps} = useVideoConfig();
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const c = CADRES[q.cadre ?? 'moyen'];
  const local = t - q.debut;
  const entree = interpolate(local, [0, 0.12], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const s = c.s * entree * (1 + 0.03 * local) * punch(t);
  return (
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: c.o}}>
      <Scene2D etat={etat} ecran={<EcranPerso t={t} />} />
    </AbsoluteFill>
  );
};

// Ouverture (image 0 = miniature) : « ARRÊTE ✋ » claque, titre complet.
const TitreOuverture: React.FC<{t: number}> = ({t}) => {
  if (t >= 1.85) return null;
  const cam = secousse(t, [0], 26, 0.5);
  const s = interpolate(t, [0, 0.12, 0.24], [1.12, 0.96, 1], clamp);
  const sortie = prog(t, 1.6, 1.85);
  return (
    <div style={{position: 'absolute', left: 50, width: 900, top: 225, textAlign: 'center', fontFamily: POLICE, opacity: 1 - sortie, transform: `${cam.transform} scale(${s - sortie * 0.1})`}}>
      <div style={{display: 'inline-block', padding: '8px 28px', borderRadius: 999, background: COULEURS.violet, color: COULEURS.nuit, fontWeight: 800, fontSize: 44}}>Une astuce IA · Épisode 3</div>
      <div style={{marginTop: 4, color: COULEURS.or, fontWeight: 800, fontSize: 150, lineHeight: 1.05, WebkitTextStroke: `18px ${COULEURS.nuit}`, paintOrder: 'stroke fill', transform: `rotate(-3deg)`}}>ARRÊTE ✋</div>
      <div style={{color: COULEURS.blanc, fontWeight: 800, fontSize: 76, lineHeight: 1.05, WebkitTextStroke: `14px ${COULEURS.nuit}`, paintOrder: 'stroke fill'}}>
        de dire <span style={{color: COULEURS.or}}>« améliore ça »</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ composition

export const Episode03: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const q = planA(t);
  const etat = etatDouble(t, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);
  const i = q.carte ?? 0;
  const ta = TEMPS_ASTUCES[i];
  const Illus = q.type === 'I' ? ILLUSTRATIONS_EP03[q.illus!] ?? ILLUSTRATIONS[q.illus!] : null;
  const medaillon = q.type === 'I' || q.type === 'MAUVAIS' || q.type === 'BON';
  const debutMedaillon = (() => {
    let k = PLANS.indexOf(q);
    while (k > 0 && !['P', 'NUMERO'].includes(PLANS[k - 1].type)) k--;
    return PLANS[k].debut;
  })();
  const pendantAstuces = t > FIN_ACCROCHE - 0.1 && t < TEMPS.remarque + 0.3;
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      {q.type === 'P' ? <Personnage q={q} t={t} /> : null}
      {Illus ? <Illus t={t - q.debut} d={q.fin - q.debut} tg={t} temps={TEMPS} texte={q.texte} phase={q.phase} partie={q.partie} /> : null}
      {q.type === 'NUMERO' ? <PlanNumero i={i} ta={ta} t={t} /> : null}
      {q.type === 'MAUVAIS' ? <PlanMauvais i={i} ta={ta} t={t} debut={q.debut} /> : null}
      {q.type === 'BON' ? <PlanBon i={i} ta={ta} t={t} debut={q.debut} /> : null}
      {q.type === 'FIN' ? <CarteContacts t={t - DEBUT_FIN} numeros={NUMEROS_A} lien={0.1} /> : null}
      {medaillon ? <Medaillon etat={etat} t={t} entree={debutMedaillon} /> : null}

      {/* sur le personnage, bande sombre derrière la barre des astuces (l'écran du décor passe dessous) */}
      {q.type === 'P' && pendantAstuces ? <div style={{position: 'absolute', left: 0, right: 0, top: 150, height: 260, background: `linear-gradient(${COULEURS.nuit}ee 0%, ${COULEURS.nuit}cc 60%, transparent 100%)`}} /> : null}
      {q.type === 'P' && q.disPlutot ? <VoletDisPlutot t={t} debut={q.debut} /> : null}
      {q.type === 'P' && q.titre ? <TitreAstuce i={i} t={t} a={q.debut} /> : null}

      {t < 1.85 ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, opacity: 1 - prog(t, 1.6, 1.85), background: `linear-gradient(${COULEURS.nuit} 0%, ${COULEURS.nuit}e6 55%, transparent 100%)`}} /> : null}
      <TitreOuverture t={t} />
      <Sauvegarde t={t} a={1.85} fin={FIN_ACCROCHE} />

      {q.type !== 'FIN' ? <LogoCoin position={LOGO} /> : null}
      <BarreEtapes t={t} debuts={TEMPS_ASTUCES.map((a) => a.debut + 0.05)} apparition={FIN_ACCROCHE - 0.1} disparition={TEMPS.remarque} noms={CARTES.map((c) => c.titre)} sansLibelle />
      {/* pas de sous-titres sur la carte de fin : elle affiche déjà « Lien dans la bio » (évite le chevauchement) */}
      {q.type !== 'FIN' ? <SousTitresMot blocs={BLOCS} t={t} /> : null}

      <Audio src={staticFile('episodes/ep03/voix-dynamique.wav')} volume={0.8} />
      <Audio
        src={staticFile('serie/musique-puissante.wav')}
        volume={(f) => {
          const tt = f / fps;
          const p = planA(tt);
          const v = interpolate(tt, [p.debut, p.debut + 0.2], [niveau(planA(p.debut - 0.01)), niveau(p)], clamp);
          return v * interpolate(f, [DUREE_EP03 - 40, DUREE_EP03 - 1], [1, 0], clamp);
        }}
      />
      <Effets evenements={EVENEMENTS} />
    </AbsoluteFill>
  );
};

export {b};

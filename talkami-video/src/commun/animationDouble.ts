import {Easing} from 'remotion';
import {Expression, Geste, Pose} from '../theme';
import {hasard} from './hasard';
import {EtatDouble, VISAGES, Viseme, melangerPosesBras, melangerVisages, posesBras} from '../v2d/Double2D';

// Animation du double à partir de deux listes d'étapes (gestes, expressions)
// de la courbe d'énergie de la voix (mouvements de tête) et des formes de
// bouche de Rhubarb Lip Sync, une lettre par image (`visemes`). Tout est fonction du temps : une
// image se calcule seule, sans dépendre des précédentes (rendu parallèle).

export type EtapeGeste = {t: number; geste: Geste; doigts?: Pose['doigts']};
export type EtapeExpression = {t: number; expression: Expression};

const DUREE_GESTE = 0.38; // s : transition douce d'une pose de bras à l'autre
const DUREE_VISAGE = 0.25;
const adoucir = Easing.inOut(Easing.cubic);

// État à l'instant t d'une suite d'étapes : chaque transition part de l'état
// atteint au moment où elle commence (même si la précédente n'était pas finie).
const suivre = <E extends {t: number}, V>(etapes: E[], t: number, valeur: (e: E) => V, melanger: (a: V, b: V, p: number) => V, duree: number): V => {
  let base = valeur(etapes[0]);
  let cible = base;
  let depart = -Infinity;
  for (const e of etapes.slice(1)) {
    if (e.t > t) break;
    base = melanger(base, cible, adoucir(Math.min(1, Math.max(0, (e.t - depart) / duree))));
    cible = valeur(e);
    depart = e.t;
  }
  return melanger(base, cible, adoucir(Math.min(1, Math.max(0, (t - depart) / duree))));
};

const brasDe = (e: EtapeGeste) => posesBras({geste: e.geste, doigts: e.doigts, expression: 'neutre', bouche: 0});

// Clignements toutes les 3 à 5 s (tirage déterministe), fermeture de 0,16 s.
const clignement = (t: number) => {
  let instant = 0.8;
  for (let k = 0; instant < t + 1; k++) {
    const d = t - instant;
    if (d >= 0 && d < 0.16) return Math.sin((Math.PI * d) / 0.16);
    instant += 3 + hasard(k + 17) * 2;
  }
  return 0;
};

export const etatDouble = (
  t: number,
  gestes: EtapeGeste[],
  expressions: EtapeExpression[],
  bouche: number[],
  visemes: string,
  fps: number
): EtatDouble => {
  const i = Math.round(t * fps);
  const o = i >= 0 && i < bouche.length ? bouche[i] : 0;
  // activité de la voix (moyenne glissante sur ~0,5 s) : tête plus mobile quand il parle
  let actif = 0;
  for (let k = i - 8; k <= i + 8; k++) actif += k >= 0 && k < bouche.length ? bouche[k] : 0;
  actif = Math.min(1, actif / 17 / 0.35);
  const visage = suivre(expressions, t, (e) => VISAGES[e.expression], melangerVisages, DUREE_VISAGE);
  const bras = suivre(gestes, t, brasDe, melangerPosesBras, DUREE_GESTE);
  const c = clignement(t);
  return {
    ...visage,
    fermeG: Math.max(visage.fermeG, c),
    fermeD: Math.max(visage.fermeD, c),
    bouche: o,
    viseme: ((i >= 0 && i < visemes.length ? visemes[i] : 'X') as Viseme),
    tete: visage.tete + Math.sin(t * 0.7) * 0.8 + actif * (Math.sin(t * 2.3) * 1.8 + Math.sin(t * 3.7) * 0.8),
    teteX: Math.sin(t * 0.9) * 2 + actif * Math.sin(t * 1.7) * 3,
    teteY: -o * 2.5 + actif * Math.sin(t * 2.9) * 1.5,
    respiration: Math.sin((2 * Math.PI * t) / 4.2) * 3.5,
    bras,
  };
};

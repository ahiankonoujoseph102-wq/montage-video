import {EtapeExpression, EtapeGeste} from '../../commun/animationDouble';
import {MotVoix} from '../../commun/mots';
import {Couleur} from '../../commun/SousTitresVoix';
import motsJson from './mots.json';

// Épisode 1 — « La formule pour parler à l'IA » (format « Une astuce IA »).
// Tous les temps sont en secondes depuis le début de la voix découpée, et
// renvoient aux mots de mots.json (indice entre crochets dans les commentaires).

export const MOTS = motsJson as MotVoix[];
const d = (i: number) => MOTS[i].debut;
const f = (i: number) => MOTS[i].fin;
export const tranche = (a: number, b: number) => MOTS.slice(a, b + 1);

export const FIN_VOIX = f(MOTS.length - 1) + 0.3;

// Citations tapées à l'écran (indices des mots).
export const DEMANDE_BANALE = tranche(20, 22); // « Fais-moi une publicité. »
export const LETTRES = [
  {lettre: 'R', mot: 'Rôle', annonce: d(39), etiquette: d(41), citation: tranche(42, 47)},
  {lettre: 'T', mot: 'Tâche', annonce: d(48), etiquette: d(50), citation: tranche(51, 58)},
  {lettre: 'C', mot: 'Contexte', annonce: d(59), etiquette: d(61), citation: tranche(62, 73)},
  {lettre: 'F', mot: 'Format', annonce: d(74), etiquette: d(76), citation: tranche(77, 86)},
];
// « R, T, C, F » dit d'une traite [35-38] : les cases apparaissent une à une.
export const APPARITION_CASES = [d(35), d(36), d(37), d(38)];
// Rappel final [93-96] puis rassemblement au centre sur « ces quatre lettres » [98-100].
export const RAPPEL = [d(93), d(94), d(95), d(96)];
export const RASSEMBLEMENT = d(98);

export const PHASES = {
  formule: d(31) - 0.15, // « Maintenant »
  pub: d(87) - 0.1, // « Résultat : une publicité prête à publier »
  lettres: d(93) - 0.15, // « Rôle, Tâche, Contexte, Format »
  appel: d(107) - 0.25, // « Tu veux maîtriser l'IA… »
};

export const MOMENTS = {
  question: d(14), // « C'est ta question »
  envoi: f(22) + 0.12, // la demande part dans la conversation
  reponseBanale: d(23), // « Résultat »
  croix: d(26), // « banal »
  envoiComplet: 31.62, // la demande complète part (voir ecran.json)
  pubCoche: d(92), // « publier »
  maitriser: d(109), // « maîtriser l'IA pour ton activité ? »
  formule: d(31) + 0.35, // « Maintenant, utilise la formule »
  consultation: d(116),
  lien: d(123),
};

export const GESTES: EtapeGeste[] = [
  {t: -10, geste: 'repos'},
  {t: d(0) - 0.15, geste: 'explique'}, // « Tu utilises ChatGPT… nulles ? »
  {t: d(8), geste: 'repos'}, // « Le problème… »
  {t: d(14) - 0.2, geste: 'designe'}, // « C'est ta question »
  {t: d(17), geste: 'repos'}, // « Regarde »
  {t: d(20) - 0.3, geste: 'designe'}, // la demande s'écrit
  {t: f(22) + 0.3, geste: 'repos'}, // réponse banale : bras posés, grimace
  {t: d(31) - 0.1, geste: 'explique'}, // « Maintenant, utilise la formule »
  // « R, T, C, F » : il compte sur ses doigts
  {t: d(35) - 0.25, geste: 'compte', doigts: 1},
  {t: d(36), geste: 'compte', doigts: 2},
  {t: d(37), geste: 'compte', doigts: 3},
  {t: d(38), geste: 'compte', doigts: 4},
  // pour chaque lettre : il compte, puis désigne l'écran pendant que la ligne s'écrit
  ...LETTRES.flatMap((l, k) => [
    {t: l.annonce - 0.2, geste: 'compte' as const, doigts: (k + 1) as 1 | 2 | 3 | 4},
    {t: l.citation[0].debut - 0.3, geste: 'designe' as const},
  ]),
  {t: d(87) - 0.1, geste: 'explique'}, // « Résultat : une publicité prête à publier »
  ...RAPPEL.map((t, k) => ({t: k === 0 ? t - 0.25 : t, geste: 'compte' as const, doigts: (k + 1) as 1 | 2 | 3 | 4})),
  {t: d(97) - 0.2, geste: 'designe'}, // « Retiens ces quatre lettres »
  {t: d(101), geste: 'explique'}, // « et l'IA travaillera enfin pour toi »
  {t: f(106) + 0.1, geste: 'repos'},
  {t: d(107) - 0.2, geste: 'explique'}, // phrase finale : mains ouvertes
];

export const EXPRESSIONS: EtapeExpression[] = [
  {t: -10, expression: 'neutre'},
  {t: d(24), expression: 'grimace'}, // « un texte banal, que personne ne lira »
  {t: f(30) + 0.35, expression: 'neutre'},
  {t: d(89), expression: 'sourire'}, // « une publicité prête à publier »
  {t: f(92) + 0.3, expression: 'neutre'},
  {t: d(122), expression: 'sourire'}, // « Le lien est dans la bio. Merci. »
];

// Expressions à ne jamais couper entre deux sous-titres (indices des mots, inclus).
export const LIAISONS: [number, number][] = [
  [3, 7], // mais tes réponses sont nulles ?
  [10, 13], // ce n'est pas l'IA
  [20, 22], // Fais-moi une publicité
  [24, 26], // un texte banal
  [35, 38], // R, T, C, F
  [42, 47], // Tu es un expert en marketing
  [55, 58], // ma boutique de chaussures
  [69, 73], // entre 20 et 35 ans
  [88, 92], // une publicité prête à publier
  [97, 100], // Retiens ces quatre lettres
  [101, 106], // et l'IA travaillera enfin pour toi
  [109, 110], // maîtriser l'IA
  [116, 117], // consultation gratuite
  [119, 121], // Lomé IA School
  [122, 127], // Le lien est dans la bio
];

// Mots-clés colorés dans les sous-titres (indices des mots).
export const MOTS_CLES: Record<number, Couleur> = {
  7: 'rouge', // nulles
  16: 'or', // question
  26: 'rouge', // banal
  35: 'or', 36: 'or', 37: 'or', 38: 'or',
  41: 'or', 50: 'or', 61: 'or', 76: 'or',
  90: 'or', 91: 'or', 92: 'or', // prête à publier
  93: 'or', 94: 'or', 95: 'or', 96: 'or',
  99: 'violet', 100: 'violet', // quatre lettres
  109: 'or', // maîtriser
  116: 'or', 117: 'or', // consultation gratuite
  119: 'violet', 120: 'violet', 121: 'violet', // Lomé IA School
  127: 'or', // bio
};

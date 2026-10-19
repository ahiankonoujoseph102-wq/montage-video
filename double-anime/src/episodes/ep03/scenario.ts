import {MotVoix} from '../../commun/mots';
import {Couleur} from '../../commun/SousTitresVoix';
import motsJson from './mots.json';

// Épisode 3 — « Arrête de dire "améliore ça" » (7 astuces, sans capture).
// Temps en secondes de vidéo = temps de la voix resserrée (voix-dynamique.wav).

export const MOTS = motsJson as MotVoix[];
export const FIN_VOIX = MOTS[MOTS.length - 1].fin;

const norme = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}']/gu, '').replace(/’/g, "'");
export const trouver = (phrase: string, apres = 0): number => {
  const cherche = phrase.split(/\s+/).map(norme);
  for (let i = apres; i <= MOTS.length - cherche.length; i++) {
    if (cherche.every((m, k) => norme(MOTS[i + k].texte) === m)) return i;
  }
  throw new Error(`introuvable : ${phrase}`);
};
export const t = (phrase: string, apres = 0) => MOTS[trouver(phrase, apres)].debut;

// ------------------------------------------------------------------ les 7 cartes

// Morceau de la bonne phrase : texte affiché (fidèle au texte de la carte) et
// mots de la voix qui le déclenchent. Un morceau « crochet » est une partie à
// compléter : affichée avec ses crochets dans un cadre jaune, avec une étiquette
// et un exemple qui glisse dedans quand la voix la prononce.
export type Morceau = {texte: string; voix: string; crochet?: {etiquette: string; exemple: string}};
export type Carte = {
  n: number;
  titre: string;
  icone: 'plume' | 'calendrier' | 'cv' | 'livre' | 'megaphone' | 'enveloppe' | 'ampoule';
  numero: string; // « Numéro un », dit par la voix
  mauvaisPrefixe?: string;
  mauvais: string;
  mauvaisVoix: string;
  bonPrefixe?: string;
  bon: Morceau[];
  fin: string; // dernier mot de la bonne phrase dans la voix
  defile?: number; // px : remontée du contenu si la carte déborde
};

const COLLE = 'COLLE TON TEXTE ICI';

export const CARTES: Carte[] = [
  {
    n: 1, titre: 'Amélioration du style d’écriture', icone: 'plume', numero: 'Numéro un',
    mauvaisPrefixe: 'Ne dites pas :', mauvais: '« Améliore ce texte. »', mauvaisVoix: 'Améliore ce texte',
    bonPrefixe: 'Dites :',
    bon: [
      {texte: '« Réécris ce texte', voix: 'Réécris ce texte'},
      {texte: '[collez-le ici]', voix: 'que tu colles ici', crochet: {etiquette: COLLE, exemple: 'mon paragraphe'}},
      {texte: 'dans un style clair, humain, fluide et captivant du début à la fin. »', voix: 'dans un style clair'},
    ],
    fin: 'fin.',
  },
  {
    n: 2, defile: 222, titre: 'Plan quotidien personnalisé', icone: 'calendrier', numero: 'Numéro deux',
    mauvais: '« Comment être plus productif ? »', mauvaisVoix: 'Comment être plus productif',
    bon: [
      {texte: '« Crée-moi un plan journalier basé sur ces objectifs', voix: 'Crée-moi un plan'},
      {texte: '[liste]', voix: 'que tu listes', crochet: {etiquette: 'ÉCRIS TA LISTE', exemple: 'mes objectifs'}},
      {texte: ', cet emploi du temps', voix: 'cet emploi du temps'},
      {texte: '[heures]', voix: 'avec tes heures', crochet: {etiquette: 'TES HEURES', exemple: '8 h – 17 h'}},
      {texte: 'et mon style de travail', voix: 'et mon style de travail'},
      {texte: '[description]', voix: 'que tu décris', crochet: {etiquette: 'DÉCRIS TON STYLE', exemple: 'le matin'}},
      {texte: '. »', voix: 'que tu décris'},
    ],
    fin: 'décris.',
  },
  {
    n: 3, defile: 150, titre: 'Amélioration de CV', icone: 'cv', numero: 'Numéro trois',
    mauvais: '« Améliore mon CV. »', mauvaisVoix: 'Améliore mon CV',
    bon: [
      {texte: '« Réécris cette ligne de CV', voix: 'Réécris cette ligne'},
      {texte: '[collez-la]', voix: 'que tu colles ici', crochet: {etiquette: COLLE, exemple: 'ma ligne de CV'}},
      {texte: 'en la rendant mesurable, axée sur l’impact et adaptée à un poste de', voix: 'en la rendant'},
      {texte: '[nom du métier]', voix: 'le nom de ton métier', crochet: {etiquette: 'TON MÉTIER', exemple: 'Comptable'}},
      {texte: '. »', voix: 'le nom de ton métier'},
    ],
    fin: 'métier.',
  },
  {
    n: 4, titre: 'Apprendre rapidement un sujet', icone: 'livre', numero: 'Numéro quatre',
    mauvais: '« Aide-moi à apprendre ça. »', mauvaisVoix: 'Aide-moi à apprendre',
    bon: [
      {texte: '« Fais-moi un plan d’apprentissage de 7 jours sur', voix: 'Fais-moi un plan'},
      {texte: '[sujet]', voix: 'ce sujet', crochet: {etiquette: 'TON SUJET', exemple: 'l’anglais'}},
      {texte: ', avec des vidéos YouTube, des résumés, des exercices rapides et des quiz. »', voix: 'avec des vidéos'},
    ],
    fin: 'quiz.',
  },
  {
    n: 5, titre: 'Post percutant pour les réseaux sociaux', icone: 'megaphone', numero: 'Numéro cinq',
    mauvais: '« Fais un post. »', mauvaisVoix: 'Fais un post',
    bon: [
      {texte: '« Transforme cette idée', voix: 'Transforme cette idée'},
      {texte: '[collez-la]', voix: 'que tu colles ici', crochet: {etiquette: COLLE, exemple: 'mon idée'}},
      {texte: 'en une légende courte, personnelle et accrocheuse dès les trois premières secondes. »', voix: 'en une légende'},
    ],
    fin: 'secondes.',
  },
  {
    n: 6, titre: 'Assistant e-mail', icone: 'enveloppe', numero: 'Numéro six',
    mauvais: '« Rédige une réponse. »', mauvaisVoix: 'Rédige une réponse',
    bon: [
      {texte: '« Voici leur message', voix: 'Voici leur message'},
      {texte: '[collez-le]', voix: 'que tu colles ici', crochet: {etiquette: COLLE, exemple: 'leur e-mail'}},
      {texte: '. Rédige une réponse courte, claire, confiante, mais amicale. »', voix: 'Rédige une réponse courte'},
    ],
    fin: 'amicale.',
  },
  {
    n: 7, defile: 110, titre: 'Clarté mentale', icone: 'ampoule', numero: 'Numéro sept',
    mauvais: '« Qu’est-ce que je devrais faire ? »', mauvaisVoix: "Qu'est-ce que je devrais",
    bon: [
      {texte: '« Aide-moi à décortiquer cette situation', voix: 'Aide-moi à décortiquer'},
      {texte: '[expliquez-la]', voix: 'que tu expliques', crochet: {etiquette: 'EXPLIQUE TA SITUATION', exemple: 'mon problème'}},
      {texte: 'et propose 4 à 5 solutions intelligentes avec leurs avantages et leurs inconvénients. »', voix: 'et propose'},
    ],
    fin: 'inconvénients.',
  },
];

// Instants de chaque carte, calculés sur la voix.
export type TempsCarte = {
  numero: number; // « Numéro X »
  mauvais: number; // la mauvaise phrase commence
  mauvaisFin: number; // … et finit (la croix tombe)
  bon: number; // « Dis plutôt »
  morceaux: number[]; // début de chaque morceau de la bonne phrase
  dernierMot: number; // début du dernier mot
  fin: number; // fin de la bonne phrase
};

export const TEMPS_CARTES: TempsCarte[] = CARTES.map((c) => {
  const iNum = trouver(c.numero);
  const iMauvais = trouver(c.mauvaisVoix, iNum);
  const iBon = trouver('Dis plutôt', iMauvais);
  const morceaux = c.bon.map((m) => MOTS[trouver(m.voix, iBon)].debut);
  const iFin = trouver(c.fin, iBon);
  const finMauvais = MOTS[iBon - 1].fin;
  return {
    numero: MOTS[iNum].debut,
    mauvais: MOTS[iMauvais].debut,
    mauvaisFin: finMauvais,
    bon: MOTS[iBon].debut,
    morceaux,
    dernierMot: MOTS[iFin].debut,
    fin: MOTS[iFin].fin,
  };
});

// ------------------------------------------------------------------ sous-titres

const EXPRESSIONS_ENTIERES = [
  'améliore ça', 'un mauvais prompt', 'un mauvais résultat', 'ces formulations', 'la magie opérer', 'Ne dis pas', 'Dis plutôt',
  'que tu colles ici', 'du style d’écriture', 'Améliore ce texte', 'du début à la fin', 'un plan quotidien personnalisé',
  'plus productif', 'un plan journalier', 'ces objectifs', 'que tu listes', 'cet emploi du temps', 'avec tes heures',
  'mon style de travail', 'que tu décris', 'de ton CV', 'mon CV', 'cette ligne de CV', 'axée sur l’impact', 'un poste de,',
  'le nom de ton métier', 'un sujet', 'à apprendre ça', 'plan d’apprentissage', 'de sept jours', 'ce sujet', 'des vidéos YouTube',
  'des exercices rapides', 'des quiz', 'un post percutant', 'les réseaux sociaux', 'un post', 'cette idée', 'une légende courte',
  'les trois premières secondes', 'un assistant e-mail', 'une réponse', 'leur message', 'une réponse courte',
  'la clarté mentale', 'je devrais faire', 'cette situation', 'que tu expliques', 'quatre à cinq', 'solutions intelligentes',
  'leurs avantages', 'leurs inconvénients', 'Tu as remarqué', 'Chaque bonne demande', 'le contexte', 'le résultat voulu',
  'le style', 'ne devine pas', 'ce que tu lui demandes', 'Et toi', 'le meilleur prompt', 'avec ChatGPT', 'un résultat surprenant',
  'en commentaire', 'comme un professionnel', 'ta consultation gratuite', 'Lomé IA School', 'Le lien est dans la bio',
  'Numéro un', 'Numéro deux', 'Numéro trois', 'Numéro quatre', 'Numéro cinq', 'Numéro six', 'Numéro sept',
];
const occurrences = (phrase: string): [number, number][] => {
  const res: [number, number][] = [];
  let apres = 0;
  for (;;) {
    try {
      const i = trouver(phrase.replace(/’/g, "'"), apres);
      res.push([i, i + phrase.split(/\s+/).length - 1]);
      apres = i + 1;
    } catch {
      return res;
    }
  }
};
export const LIAISONS: [number, number][] = EXPRESSIONS_ENTIERES.flatMap(occurrences);

const CLES: [string, Couleur][] = [
  ['ChatGPT', 'or'], ['améliore ça', 'or'], ['mauvais résultat', 'or'], ['magie', 'or'],
  ['Numéro un', 'or'], ['Numéro deux', 'or'], ['Numéro trois', 'or'], ['Numéro quatre', 'or'], ['Numéro cinq', 'or'],
  ['Numéro six', 'or'], ['Numéro sept', 'or'], ['Dis plutôt', 'or'], ['que tu colles ici', 'or'], ['que tu listes', 'or'],
  ['avec tes heures', 'or'], ['que tu décris', 'or'], ['le nom de ton métier', 'or'], ['que tu expliques', 'or'],
  ['contexte', 'or'], ['résultat voulu', 'or'], ['commentaire', 'or'], ['consultation gratuite', 'or'],
  ['Lomé IA School', 'violet'], ['bio.', 'or'],
];
export const MOTS_CLES: Record<number, Couleur> = Object.fromEntries(
  CLES.flatMap(([phrase, couleur]) => occurrences(phrase).flatMap(([a, b]) => Array.from({length: b - a + 1}, (_, k) => [a + k, couleur] as const)))
);

// Zooms brusques sur les mots forts.
export const MOTS_FORTS = ['Arrête', 'mauvais résultat', 'magie', 'remarqué', 'exécute', 'meilleur prompt', 'surprenant', 'professionnel'].map((p) => t(p));

// Instants nommés pour les illustrations.
export const TEMPS: Record<string, number> = {
  ameliore: t('améliore ça'),
  ameliorePas: t('améliore ça') + 0.9,
  croixAccroche: MOTS[trouver('améliore ça') + 1].debut + 0.08,
  froisse: t('résultat.') + 0.2,
  contexte: t('le contexte'),
  resultat: t('le résultat voulu'),
  style: t('et le style') + 0.15,
  commentaire: t('Écris-le en commentaire'),
  remarque: t('Tu as remarqué'),
};

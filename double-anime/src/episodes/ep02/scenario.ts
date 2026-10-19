import {MotVoix} from '../../commun/mots';
import {Couleur} from '../../commun/SousTitresVoix';
import motsJson from './mots.json';

// Épisode 2 — « J'ai créé ce site depuis mon téléphone » (montage dynamique).
// Temps en secondes de vidéo = temps de la voix resserrée (voix-dynamique.wav).

export const MOTS = motsJson as MotVoix[];
export const FIN_VOIX = MOTS[MOTS.length - 1].fin;

// Retrouver une suite de mots du texte (sans ponctuation ni accents) : indice du premier mot.
const norme = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}']/gu, '').replace(/’/g, "'");
export const trouver = (phrase: string, apres = 0): number => {
  const cherche = phrase.split(/\s+/).map(norme);
  for (let i = apres; i <= MOTS.length - cherche.length; i++) {
    if (cherche.every((m, k) => norme(MOTS[i + k].texte) === m)) return i;
  }
  throw new Error(`introuvable : ${phrase}`);
};
const t = (phrase: string, apres = 0) => MOTS[trouver(phrase, apres)].debut;
const plage = (phrase: string, apres = 0): [number, number] => {
  const i = trouver(phrase, apres);
  return [i, i + phrase.split(/\s+/).length - 1];
};

// Sous-titres : expressions à ne jamais couper, mots-clés en couleur.
const EXPRESSIONS_ENTIERES = [
  'Lomé IA School', 'sur Google', 'sans être développeur', 'la page d’accueil', "l'intelligence artificielle", 'en francs CFA',
  'il a accès à sa formation', 'Mon espace', 'son propre compte', 'la consultation gratuite', 'un échange avec moi',
  'pour les entreprises', 'un programme d’affiliation', 'une commission', 'notre assistante IA', "à l'écrit comme à l'oral",
  'à toute heure', 'étape par étape', 'le cahier des charges', 'mon bloc-notes', 'un brouillon', 'même en désordre',
  'mon premier prompt', 'dans la tête', 'un dépôt sur GitHub', 'tout le code du site', 'deux minutes', 'Claude Code',
  'une intelligence artificielle', 'du code', 'pas développeur', 'depuis mon téléphone', 'tout simplement', 'le site vitrine',
  "l'espace élève", "l'assistante Ama", 'un aperçu', 'la correction', "l'étape suivante", 'la mise en ligne',
  'directement sur Google', 'ta vision', 'cahier des charges', 'ton propre site web', 'consultation gratuite', 'dans ma bio',
  "qui l'ai créé", 'tout de suite', 'parce que', 'où sera rangé', 'et même que', 'je ne suis pas développeur',
  'quoi que ce soit', "comment fonctionne l'affiliation", "qu'une personne l'achète", 'Le visiteur choisit, il paie,',
  'sans ordinateur', 'à qui s’adresse le site', 'vont payer', 'Le lien est dans ma bio', 'mes futurs élèves',
  'ce que je veux construire',
];
const occurrences = (phrase: string): [number, number][] => {
  const res: [number, number][] = [];
  let apres = 0;
  for (;;) {
    try {
      const p = plage(phrase.replace(/’/g, "'"), apres);
      res.push(p);
      apres = p[0] + 1;
    } catch {
      return res;
    }
  }
};
export const LIAISONS: [number, number][] = EXPRESSIONS_ENTIERES.flatMap(occurrences);

const CLES: [string, Couleur][] = [
  ['Lomé IA School', 'violet'], ['Google', 'or'], ['francs CFA', 'or'], ['Mon espace', 'or'], ['consultation gratuite', 'or'],
  ['affiliation', 'or'], ['commission', 'or'], ['Ama', 'violet'], ['Étape 1', 'or'], ['Étape 2', 'or'], ['Étape 3', 'or'],
  ['Étape 4', 'or'], ['Étape 5', 'or'], ['cahier des charges', 'or'], ['premier prompt', 'or'], ['GitHub', 'or'],
  ['Claude Code', 'or'], ['aperçu', 'or'], ['mise en ligne', 'or'], ['vision', 'or'], ['bio', 'or'],
];
export const MOTS_CLES: Record<number, Couleur> = Object.fromEntries(
  CLES.flatMap(([phrase, couleur]) => occurrences(phrase).flatMap(([a, b]) => Array.from({length: b - a + 1}, (_, k) => [a + k, couleur] as const)))
);

// Instants nommés utilisés par les illustrations et les bruitages.
export const TEMPS: Record<string, number> = {
  ecole: t('ce que fait mon école'),
  cible: t("à qui s'adresse"),
  formations: t('quelles formations'),
  payer: t('comment les élèves vont payer'),
  recevoir: t("ce qu'ils doivent recevoir"),
  affiliation: t("comment fonctionne l'affiliation"),
  vitrine: t('le site vitrine'),
  formationsChemin: t('puis les formations'),
  inscription: t("puis l'inscription"),
  ama: t("puis l'assistante Ama"),
  etape1: t('Étape 1'),
  etape2: t('Étape 2'),
  etape3: t('Étape 3'),
  etape4: t('Étape 4'),
  etape5: t('Étape 5'),
  retiens: t('Retiens bien ceci'),
  vision1: MOTS[trouver('ta vision') + 1].debut,
  vision2: MOTS[trouver('ta vision', trouver('ta vision') + 2) + 1].debut,
  commission: t('une commission'),
};

// Zooms brusques sur les mots forts (instants de début de mot).
export const MOTS_FORTS = [
  'téléphone', 'intelligence artificielle', 'construit', 'importante', 'tête', 'Retiens', 'exécute', 'professionnel', 'propre site',
].map((p) => t(p));

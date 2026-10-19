import {MotVoix} from '../../commun/mots';
import {Couleur} from '../../commun/SousTitresVoix';
import motsJson from './mots.json';

// Épisode 4 — « Une affiche pro en quelques minutes » (Patricia, ChatGPT et Pinterest).
// Temps en secondes de vidéo = temps de la voix resserrée (voix-dynamique.wav).

export const MOTS = motsJson as MotVoix[];
export const FIN_VOIX = MOTS[MOTS.length - 1].fin;

const norme = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}']/gu, '').replace(/’/g, "'");
export const trouver = (phrase: string, apres = 0): number => {
  // la ponctuation isolée (« : », « ? », « » ») est collée au mot dans les sous-titres : on l'ignore
  const cherche = phrase.split(/\s+/).map(norme).filter(Boolean);
  for (let i = apres; i <= MOTS.length - cherche.length; i++) {
    if (cherche.every((m, k) => norme(MOTS[i + k].texte) === m)) return i;
  }
  throw new Error(`introuvable : ${phrase}`);
};
export const t = (phrase: string, apres = 0) => MOTS[trouver(phrase, apres)].debut;

const occurrences = (phrase: string): [number, number][] => {
  const res: [number, number][] = [];
  let apres = 0;
  for (;;) {
    try {
      const i = trouver(phrase.replace(/’/g, "'"), apres);
      res.push([i, i + phrase.split(/\s+/).map(norme).filter(Boolean).length - 1]);
      apres = i + 1;
    } catch {
      return res;
    }
  }
};

// Sous-titres : expressions à ne jamais couper.
const EXPRESSIONS_ENTIERES = [
  'Cette affiche', 'en quelques minutes', 'mon téléphone', 'ChatGPT et Pinterest', "c'est gratuit", 'je suis Patricia',
  "l'assistante de Lomé IA School", 'Lomé IA School', 'comment je fais', 'Avant de commencer', 'trois choses', 'ton téléphone',
  'bien sûr', 'les informations de ton affiche', "une offre d'emploi", "qu'un client", 'nous a confiée', 'Étape un',
  "les informations de l'offre", 'une nouvelle conversation', 'dans ChatGPT', 'les informations', 'mon premier prompt',
  "le texte de l'affiche", 'prêt à être copié', 'les mots-clés', 'sur Pinterest', "de l'inspiration", 'Étape deux',
  'un mot-clé', 'dans Pinterest', 'Des dizaines', "de modèles d'affiches", 'celui qui me plaît', 'je le télécharge',
  'Étape trois', 'Je reviens', 'le plus', 'puis Photos', 'le modèle', 'mon deuxième prompt', 'ce modèle',
  'une affiche professionnelle', 'un graphiste', 'plus de dix ans', "d'expérience", 'à partir des informations',
  'que je lui ai données', 'Et maintenant', "crée l'affiche", 'Le titre', 'les informations', 'la photo', 'le contact WhatsApp',
  'tout y est', 'Elle ne te plaît pas', 'les trois points', "d'en générer une autre", 'celle que tu préfères', 'sur TikTok',
  'sur WhatsApp', 'partout où tu veux', 'Tu vois', 'une nouvelle compétence', 'cette compétence', 'la vendre',
  'les commerçants', 'les églises', 'les écoles', 'les entreprises', "besoin d'affiches", 'les deux prompts',
  "que j'ai utilisés", 'Écris AFFICHE', 'en commentaire', 'pour apprendre', "gagner de l'argent", "avec l'IA",
  'ta consultation gratuite', 'Le lien est dans la bio',
];
export const LIAISONS: [number, number][] = EXPRESSIONS_ENTIERES.flatMap(occurrences);

// Mots-clés en jaune (or) ; « Lomé IA School » en violet.
const CLES: [string, Couleur][] = [
  ['affiche,', 'or'], ['quelques minutes.', 'or'], ['ChatGPT', 'or'], ['Pinterest.', 'or'], ['gratuit.', 'or'], ['Patricia,', 'or'],
  ['Lomé IA School.', 'violet'], ['trois choses', 'or'], ['téléphone,', 'or'], ["offre d'emploi", 'or'], ['Étape un.', 'or'],
  ['ChatGPT,', 'or'], ['premier prompt.', 'or'], ['mots-clés', 'or'], ['Pinterest', 'or'], ['Étape deux.', 'or'], ['mot-clé,', 'or'],
  ['télécharge.', 'or'], ['Étape trois.', 'or'], ['ChatGPT.', 'or'], ['le plus', 'or'], ['puis Photos', 'or'], ['deuxième prompt.', 'or'],
  ['professionnelle,', 'or'], ['graphiste', 'or'], ["crée l'affiche.", 'or'], ['trois points,', 'or'], ['générer', 'or'],
  ['compétence.', 'or'], ['la vendre', 'or'], ['prompts', 'or'], ['AFFICHE', 'or'], ['commentaire.', 'or'], ['consultation gratuite', 'or'],
  ['bio.', 'or'],
];
export const MOTS_CLES: Record<number, Couleur> = Object.fromEntries(
  CLES.flatMap(([phrase, couleur]) => occurrences(phrase).flatMap(([a, b]) => Array.from({length: b - a + 1}, (_, k) => [a + k, couleur] as const)))
);

// Zooms brusques sur les mots forts (plans du personnage).
export const MOTS_FORTS = ['gratuit.', 'Patricia,', 'exactement', 'trois choses', 'professionnelle,', 'regarde.', 'compétence,', 'la vendre'].map((p) => t(p)).concat([t('AFFICHE en commentaire')]);

// Instants nommés.
export const TEMPS: Record<string, number> = {
  telephone: t('ton téléphone'),
  chatgpt: t('ChatGPT et Pinterest.', trouver('ton téléphone')),
  pinterest: t('Pinterest.', trouver('ton téléphone')),
  infos: t('les informations de ton affiche'),
  gratuit: t('gratuit.'),
  patricia: t('Patricia,'),
  etape1: t('Étape un.'),
  etape2: t('Étape deux.'),
  etape3: t('Étape trois.'),
  remarque: t('Tu vois ?'),
  tiktok: t('sur TikTok'),
  whatsapp: t('sur WhatsApp ou'),
  partout: t('partout où'),
  commercants: t('les commerçants'),
  eglises: t('les églises'),
  ecoles: t('les écoles'),
  entreprises: t('les entreprises'),
};

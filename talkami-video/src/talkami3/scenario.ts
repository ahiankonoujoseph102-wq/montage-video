import {MotVoix} from '../commun/mots';
import {Couleur} from '../commun/SousTitresVoix';
import motsJson from './mots.json';

// Vidéo Talkami — « J'ai créé mon propre professeur d'anglais avec l'IA ».
// Temps en secondes de vidéo = temps de la voix nettoyée (public/talkami/voix-st.wav).

export const MOTS = motsJson as MotVoix[];
export const FIN_VOIX = MOTS[MOTS.length - 1].fin;

const norme = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}']/gu, '').replace(/’/g, "'");
export const trouver = (phrase: string, apres = 0): number => {
  const cherche = phrase.split(/\s+/).map(norme).filter(Boolean);
  for (let i = apres; i <= MOTS.length - cherche.length; i++) {
    if (cherche.every((m, k) => norme(MOTS[i + k].texte) === m)) return i;
  }
  throw new Error(`introuvable : ${phrase}`);
};
// n-ième occurrence (à partir de 1)
const indice = (phrase: string, n = 1) => {
  let i = -1;
  for (let k = 0; k < n; k++) i = trouver(phrase, i + 1);
  return i;
};
const t = (phrase: string, n = 1) => MOTS[indice(phrase, n)].debut;
const plage = (phrase: string, apres = 0): [number, number] => {
  const i = trouver(phrase, apres);
  return [i, i + phrase.split(/\s+/).map(norme).filter(Boolean).length - 1];
};
const occurrences = (phrase: string): [number, number][] => {
  const res: [number, number][] = [];
  let apres = 0;
  for (;;) {
    try {
      const p = plage(phrase, apres);
      res.push(p);
      apres = p[0] + 1;
    } catch {
      return res;
    }
  }
};

// Sous-titres : expressions à ne jamais couper, mots-clés en couleur.
const EXPRESSIONS_ENTIERES = [
  '350 000 francs CFA', 'apprendre l’anglais', 'mon propre professeur d’anglais', 'Joseph Ahiankonou', 'Teacher Joe',
  'à voix haute', 'évaluation orale gratuite', '5 minutes', 'ton niveau', 'ta séance', 'au tableau', 'en français',
  'après lui', 'de ta vie', 'au marché', 'au travail', 'en voyage', 'le bilan', 'en francs CFA', 'Mobile Money',
  'capture d’écran', 'mon niveau progresse', 'moi-même', 'presque rien', 'le plus beau', 'avec moi', 'premiers paiements',
  'leur abonnement', 'au Togo', 'Afrique de l’Ouest', '3 vidéos', 'cours d’anglais', 'un seul problème', 'trois choses',
  'une solution', 'pour moi', 'un service', 'une compétence', 'le vrai avantage', 'de barrière', 'un site web',
  'une application', 'un agent IA', 'une automatisation', 'tout devient possible', 'le seul vrai malheur', 'un texte',
  'une image', 'le début', 'une entreprise', 'tâches répétitives', 'des agents', 'des automatisations', 'temps perdu',
  'de résultats', 'va visiter Talkami', 'de la qualité', 'Lomé IA School', 'tes propres solutions', 'pour toi', 'sites web',
  'agents IA', 'consultation gratuite', 'sur WhatsApp', '72 24 02 31', 'jusqu’au bout', 'intelligence artificielle', '3 mois',
  '200 000 francs CFA', 'attestation de participation', 'Adidogomé,', 'Lycée Moderne 2', 'en opportunités',
];
export const LIAISONS: [number, number][] = EXPRESSIONS_ENTIERES.flatMap((e) => occurrences(e.replace(/’/g, "'")));

const CLES: [string, Couleur][] = [
  ['350 000 francs CFA', 'or'], ['Talkami', 'violet'], ['Teacher Joe', 'violet'], ['téléphone', 'or'], ['ordinateur', 'rouge'],
  ['coder', 'rouge'], ['évaluation orale gratuite', 'or'], ['niveau', 'or'], ['séance', 'or'], ['leçon', 'or'], ['pratique', 'or'],
  ['conversation', 'or'], ['bilan', 'or'], ['Mobile Money', 'or'], ['presque rien', 'or'], ['paient', 'or'],
  ['premiers paiements', 'or'], ['3 vidéos', 'or'], ['trois choses', 'or'], ['maîtriser l’IA', 'or'], ['tout devient possible', 'or'],
  ['malheur', 'rouge'], ['le début', 'or'], ['agents', 'or'], ['automatisations', 'or'], ['qualité', 'or'], ['Lomé IA School', 'violet'],
  ['consultation gratuite', 'or'], ['WhatsApp', 'or'], ['200 000 francs CFA', 'or'], ['attestation', 'or'], ['opportunités', 'or'],
  ['l’IA', 'or'], ['problème', 'rouge'],
];
export const MOTS_CLES: Record<number, Couleur> = Object.fromEntries(
  CLES.flatMap(([phrase, couleur]) =>
    occurrences(phrase.replace(/’/g, "'")).flatMap(([a, b]) => Array.from({length: b - a + 1}, (_, k) => [a + k, couleur] as const)),
  ),
);

// Instants nommés utilisés par les illustrations, la barre des étapes et les bruitages.
export const TEMPS: Record<string, number> = {
  demande: t('demandé'),
  prix1: t('350'),
  apprendre1: t("pour apprendre l'anglais"),
  adidogome1: t('Adidogomé'),
  formateur: t('un formateur'),
  sixMois: t('6 mois'),
  prix2: t('350', 2),
  maitrise: t('je la maîtrise'),
  talkami: t("Il s'appelle Talkami") + 0.5,
  etape1: t('Tout commence par'),
  etape2: t('La leçon au tableau'),
  etape3: t('La pratique'),
  etape4: t('La conversation'),
  etape5: t('Puis le bilan'),
  formules: t('Ici, les formules'),
  marche: t('au marché'),
  travail: t('au travail'),
  voyage: t('en voyage'),
  prix3: t('350', 3),
  construit: t("je l'ai construit"),
  presqueRien: t('pour presque rien'),
  regardePaiements: t('voici mes premiers paiements'),
  clients: t('Des clients'),
  abonnement: t('leur abonnement'),
  togo: t('au Togo'),
  ouest: t("de l'Ouest"),
  dors: t('je dors'),
  unProbleme: t('un seul problème'),
  leMien: t('le mien'),
  troisChoses: t('trois choses'),
  solution: t('Une solution pour moi'),
  service: t('Un service que'),
  competence: t('une compétence'),
  creer: t('pour créer'),
  innover: t('pour innover'),
  site: t('Un site web'),
  application: t('une application'),
  agent: t('un agent IA'),
  automatisation: t('une automatisation'),
  possible: t('tout devient possible'),
  texte: t('un texte'),
  image: t('une image'),
  debut: t("tu n'as vu que le début"),
  repetitives: t('tâches répétitives'),
  agents: t('à des agents'),
  automatisations: t('à des automatisations'),
  moins: t('Moins de temps perdu'),
  plus: t('Plus de résultats'),
  forme: t('On te forme'),
  creePourToi: t('on les crée pour toi'),
  sites: t('sites web'),
  agentsIA: t('agents IA'),
  automatisations2: t('automatisations', 2),
  consultation: t('consultation gratuite'),
  url: t('lomeiaschool .laravel .cloud'),
  whatsapp: t('WhatsApp'),
  numero: t('72 24 02 31'),
  troisMois: t('3 mois'),
  deuxCent: t('200 000'),
  attestation: t('attestation'),
  lycee: t('Lycée Moderne 2'),
  resultat: t('Voici le résultat'),
};

// Zooms brusques sur les mots forts (instants de début de mot), plans du personnage.
export const MOTS_FORTS = ['cette somme', 'question', 'Tu vois', 'vrai avantage', 'malheur', 'que le début', 'doutes', 'bout', 'opportunités'].map((p) => t(p));

// Réactions (émojis 3D Fluent, licence MIT) : un autocollant qui surgit sur un mot, 1,4 s.
// [instant, émoji, x, y] (coin haut gauche de l'autocollant de 220 px).
export const REACTIONS: [number, string, number, number][] = [
  [t('350') + 0.25, 'face_screaming_in_fear', 720, 820],
  [t('question'), 'thinking_face', 730, 620],
  [t("Il s'appelle Talkami") + 0.6, 'party_popper', 700, 300],
  [t('il te corrige') + 0.1, 'hundred_points', 740, 560],
  [t('presque rien'), 'smiling_face_with_sunglasses', 720, 900],
  [t('premiers paiements'), 'money_bag', 700, 1000],
  [t('je dors'), 'sleeping_face', 120, 330],
  [t('3 vidéos'), 'rocket', 700, 300],
  [t('Tu vois'), 'eyes', 700, 640],
  [t('tout devient possible') + 0.2, 'exploding_head', 720, 960],
  [t('que le début') + 0.2, 'fire', 700, 640],
  [t('de la qualité'), 'star-struck', 700, 300],
  [t('Formation complète'), 'graduation_cap', 700, 860],
];

import {MotVoix} from '../commun/mots';
import {Couleur} from '../commun/SousTitresVoix';
import motsJson from './mots.json';

// Publicité « Créer et monter des vidéos avec l'IA, sans montrer son visage, et en vivre »
// (Facebook et TikTok, 1080 × 1920, 30 i/s, moins de 60 s).
// La voix (voix resserrée : pauses ≤ 0,2 s, tempo × 1,10) commence à DEBUT_VOIX :
// les trois premiers plans IA tiennent chacun environ 1 s avant le tampon.

export const DEBUT_VOIX = 0.8;
const BRUTS = motsJson as MotVoix[];
// temps des mots en secondes de vidéo
export const MOTS: MotVoix[] = BRUTS.map((m) => ({...m, debut: m.debut + DEBUT_VOIX, fin: m.fin + DEBUT_VOIX}));
export const FIN_VOIX = MOTS[MOTS.length - 1].fin;

const norme = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}']/gu, '').replace(/’/g, "'");
export const trouver = (phrase: string, apres = 0): number => {
  const cherche = phrase.split(/\s+/).map(norme).filter(Boolean);
  for (let i = apres; i <= MOTS.length - cherche.length; i++) {
    if (cherche.every((m, k) => norme(MOTS[i + k].texte) === m)) return i;
  }
  throw new Error(`introuvable : ${phrase}`);
};
// début du mot (ou du premier mot de la phrase), en secondes de vidéo
export const w = (phrase: string, apres = 0) => MOTS[trouver(phrase, apres)].debut;

const occurrences = (phrase: string): [number, number][] => {
  const res: [number, number][] = [];
  let apres = 0;
  for (;;) {
    try {
      const i = trouver(phrase, apres);
      res.push([i, i + phrase.split(/\s+/).map(norme).filter(Boolean).length - 1]);
      apres = i + 1;
    } catch {
      return res;
    }
  }
};

// Sous-titres : expressions jamais coupées.
const EXPRESSIONS_ENTIERES = [
  'Aucune de ces vidéos', "n'a été filmée", 'Pas de caméra', "Pas d'acteur", "l'intelligence artificielle", 'Pendant que tu regardes',
  "d'autres créent", 'ces vidéos', 'leur téléphone', 'se font payer', 'pour ça', 'Les boutiques', 'les salons', 'les églises',
  'les entreprises', 'tout le monde', "quelqu'un", 'ses vidéos', "c'est Coach Joseph", 'Coach Joseph', 'Depuis 2023',
  '1 000 personnes', "à l'IA", 'ces publicités', 'mes clients', 'ma formation', 'étape par étape', 'de zéro', 'ton visage',
  'la vidéo', 'la monter', 'des clients', 'qui paient', '25 000 francs', 'seulement', '3 600 francs', '10 personnes',
  "L'offre", 'à 23 h 59', '23 h 59', 'sur WhatsApp', 'au 72 24 02 31', '72 24 02 31', 'Coach Joseph je suis prêt',
  'je suis prêt', 'les 10 places', 'sont prises', "c'est fini",
];
export const LIAISONS: [number, number][] = EXPRESSIONS_ENTIERES.flatMap(occurrences);

// Mots-clés en jaune.
const CLES: string[] = [
  'filmée.', 'caméra.', "d'acteur.", "l'intelligence", 'artificielle.', 'téléphone…', 'payer', 'boutiques,', 'salons,', 'églises,',
  'entreprises :', 'Coach', 'Joseph.', '2023,', '1', '000', 'publicités,', 'clients.', 'formation,', 'zéro.', 'visage.', 'Créer',
  'monter,', 'clients', 'paient.', '25', '000', "Aujourd'hui", 'seulement,', '3', '600', '10', 'seulement.', '23', 'h', '59.',
  'WhatsApp,', '72', '24', '02', '31.', 'Coach', 'Joseph,', 'prêt.', '72', '24', '02', '31.', '10', 'places', 'fini.',
];
export const MOTS_CLES: Record<number, Couleur> = (() => {
  const res: Record<number, Couleur> = {};
  let i = 0;
  for (const c of CLES) {
    while (i < MOTS.length && MOTS[i].texte !== c) i++;
    if (i >= MOTS.length) throw new Error(`mot-clé introuvable : ${c}`);
    res[i++] = 'or';
  }
  return res;
})();

// Instants forts (secondes de vidéo).
export const T = {
  filmee: w('filmée.'),
  camera: w('caméra.'),
  acteur: w("d'acteur."),
  juste: w('Juste'),
  intelligence: w("l'intelligence"),
  pendant: w('Pendant'),
  autres: w("d'autres"),
  depuis: w('depuis leur'),
  payer: w('payer'),
  boutiques: w('Les boutiques'),
  salons: w('salons,'),
  eglises: w('églises,'),
  entreprises: w('entreprises'),
  tout: w('tout le monde'),
  quelquun: w("quelqu'un"),
  moi: w('Moi,'),
  coach: w('Coach'),
  an2023: w('2023,'),
  mille: w('1 000'),
  et: w('Et ces'),
  publicites: w('publicités,'),
  cree: w('crée'),
  dans: w('Dans ma'),
  tout2: w('tout,', trouver('montre')),
  etape: w('étape par'),
  meme: w('Même si'),
  zero: w('zéro.'),
  sans: w('sans montrer'),
  visage: w('visage.'),
  creer: w('Créer'),
  monter: w('monter,'),
  trouver: w('trouver'),
  clients: w('clients qui'),
  elle: w('Elle vaut'),
  p25000: w('25'),
  aujourdhui: w("Aujourd'hui"),
  p3600: w('3 600'),
  pour10: w('Pour 10'),
  offre: w("L'offre"),
  h2359: w('23'),
  ecris: w('Écris-moi'),
  whatsapp: w('WhatsApp,'),
  n1: [w('72'), w('24'), w('02'), w('31.')],
  dis: w('Dis'),
  coach2: w('Coach Joseph,', trouver('simplement')),
  pret: w('prêt.'),
  repete: w('Je répète'),
  n2: [w('72', trouver('répète')), w('24', trouver('répète')), w('02', trouver('répète')), w('31.', trouver('répète'))],
  quand: w('Quand'),
  places: w('places'),
  fini: w("c'est fini."),
};

export const DEBUT_CARTE = FIN_VOIX + 0.35;
export const DUREE = DEBUT_CARTE + 4.3;

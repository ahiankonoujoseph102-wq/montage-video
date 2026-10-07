export type Mot = {mot: string; debut: number; fin: number; cle: boolean};

export type Fond = 'nuit' | 'orange' | 'bleu' | 'violet';

export type Element = {
  debut: number;
  icone?: string;
  texte?: string;
  marque?: 'croix' | 'coche';
  grand?: boolean;
};

export type Scene = {
  id: string;
  debut: number;
  fin: number;
  fond: Fond;
  disposition: 'focus' | 'liste' | 'panneau';
  titre?: string;
  icone?: string;
  compteur?: boolean;
  elements: Element[];
};

export type Carton = {debut: number; fin: number; fond: Fond; titre: string; lignes: string[]};

export type MotTitre = {texte: string; ligne: number; image: number};

// Titre d'accroche : géant pendant `geant` s, puis rangé dans le bandeau du haut jusqu'à `duree` s.
// `banniere: false` : le titre disparaît à `duree` au lieu de monter dans le bandeau du haut.
export type Titre = {lignes: string[]; motsCles: string[]; geant: number; duree: number; mots: MotTitre[]; banniere?: boolean};

// Extrait d'une autre vidéo inséré en plein écran (preuve), avec une étiquette.
export type Preuve = {debut: number; fin: number; etiquette: string};

// Centre du visage (origine des zooms) à partir d'une image donnée.
export type Cadre = {debut: number; x: number; y: number};

export type MontageProps = {
  video: string;
  dureeImages: number;
  titre?: Titre;
  mots: Mot[];
  groupes: number[][];
  plans: number[]; // images où le cadrage alterne (normal / zoom)
  masques: number[]; // groupes de sous-titres masqués (doublons d'un texte affiché en grand)
  dureeVideo: number; // images de la vidéo coupée ; le carton de fin vient après
  carton?: Carton;
  preuve?: Preuve | null;
  cadres?: Cadre[];
  scenes: Scene[];
  onde: number[][];
};

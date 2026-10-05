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

export type Titre = {lignes: string[]; motsCles: string[]; duree: number};

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
  scenes: Scene[];
  onde: number[][];
};

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

export type Titre = {lignes: string[]; motsCles: string[]; duree: number};

export type MontageProps = {
  video: string;
  dureeImages: number;
  titre?: Titre;
  mots: Mot[];
  groupes: number[][];
  scenes: Scene[];
  onde: number[][];
};

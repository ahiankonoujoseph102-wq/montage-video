// Palette tirée du logo Lomé IA School (pixels relevés sur logo.jpg).
export const COULEURS = {
  nuit: '#020629', // fond du logo
  nuitClaire: '#0b1440',
  nuitMur: '#0d1638',
  or: '#feca26', // « IA »
  orClair: '#fde152',
  orFonce: '#e69d03',
  orOmbre: '#b56202',
  violet: '#a177fd', // étoile
  violetFonce: '#5b3fc4',
  blanc: '#ffffff',
  grisTexte: '#9aa3c0',
  whatsapp: '#25d366',
} as const;

// Le double : relevé sur la photo, réchauffé (la photo a un fond mauve qui teinte la peau).
export const DOUBLE = {
  peau: '#5e3a2d',
  peauClaire: '#7a4c3b',
  peauOmbre: '#3e241c',
  levres: '#6e3a33',
  cheveux: '#0b0a0d',
  barbe: '#170d0b',
  veste: '#1b2142',
  vesteOmbre: '#11152c',
  chemise: '#f1f2f7',
  chemiseOmbre: '#c9ccd8',
  yeux: '#f4efe8',
  iris: '#2a1710',
} as const;

export const POLICE = 'Poppins, sans-serif';

export const FORMAT = {largeur: 1080, hauteur: 1920, fps: 30} as const;

// Mise en page commune aux versions 3D et 2D (pixels, image 1080x1920).
// Zone sûre TikTok : rien d'important sous 78 % de la hauteur (interface du
// téléphone), ni dans la colonne de boutons à droite, ni tout en haut.
export const MISE_EN_PAGE = {
  ecran: {x: 110, y: 240, l: 860, h: 600},
  logo: {x: 48, y: 120, taille: 104},
  sousTitres: {basMax: 1500, taillePolice: 78},
} as const;

export type Expression = 'neutre' | 'parle' | 'grimace' | 'sourire' | 'surpris';
export type Geste = 'repos' | 'designe' | 'explique' | 'compte' | 'bras-croises' | 'pouce';

export type Pose = {
  expression: Expression;
  geste: Geste;
  bouche: number; // 0 fermée … 1 grande ouverte
  clignement?: number; // 0 ouvert … 1 fermé
  tete?: number; // inclinaison de la tête (-1 … 1)
  doigts?: 1 | 2 | 3 | 4; // geste « compte » : nombre de doigts levés (R, T, C, F)
};

// Règles de son reprises de la chaîne de montage (branche claude/video-editing-script-jyjkt0,
// scripts/monter_video.py) : même niveau que les autres vidéos du compte.
export const SON = {
  lufsCible: -14, // loudness intégré du mixage final
  picVraiMax: -1.5, // dBTP
  lraCible: 11,
  tolerance: 0.3, // LU : au-delà, on mesure le rendu et on corrige par un gain constant
  aac: {debit: '192k', frequence: 48000, canaux: 2},
} as const;

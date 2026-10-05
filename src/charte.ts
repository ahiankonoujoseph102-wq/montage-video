// Charte graphique et placement des éléments (image 1080 × 1920).
import type {Fond} from './types';

export const POLICE = 'Montserrat';
export const BLANC = '#FFFFFF';
export const JAUNE = '#FFD400';
export const ROUGE = '#FF3B3B';
export const VERT = '#22C55E';

// Le tiers inférieur commence à 1280 px. L'onde est juste au-dessus des sous-titres.
// En dessous de ~1650 px, l'interface de TikTok / Instagram recouvre l'image.
export const ONDE = {centre: 1320, hauteurMax: 80};
export const SOUS_TITRES = {haut: 1390, largeur: 940};
export const TITRE = {haut: 130};
// Panneau sombre du tiers supérieur, posé sur le visage (s'arrête au-dessus de la tête).
export const PANNEAU = {haut: 70, hauteur: 450, marge: 36};
// Visage dans l'image recadrée : centre du léger zoom avant.
export const VISAGE = {x: 540, y: 760};
export const ZOOM_SERRE = 1.11;

export const FONDS: Record<Fond, [string, string, string]> = {
  nuit: ['#070B1F', '#1B2A6B', '#3B1F6E'],
  orange: ['#FF8A00', '#E8430C', '#8F1D4A'],
  bleu: ['#0047FF', '#00A3FF', '#1B1F8F'],
  violet: ['#5B0FD6', '#A21CAF', '#24085E'],
};

export const contour = {
  WebkitTextStroke: '3px #000',
  paintOrder: 'stroke fill',
  textShadow: '0 5px 0 rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.6)',
} as const;

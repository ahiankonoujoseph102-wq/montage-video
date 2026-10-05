// Charte graphique et placement des éléments (image 1080 × 1920).
import type {Fond} from './types';

export const POLICE = 'Montserrat';
export const BLANC = '#FFFFFF';
export const JAUNE = '#FFD400';
export const ROUGE = '#FF3B3B';
export const VERT = '#22C55E';

// Zone sûre TikTok : rien d'important dans les 10 % du haut (192 px), les 20 % du bas
// (au-delà de 1536 px) ni dans la bande de 12 % à droite (au-delà de 950 px) où sont les boutons.
export const ZONE_SURE = {haut: 200, bas: 1530, gauche: 50, droite: 950};
export const CENTRE_X = (ZONE_SURE.gauche + ZONE_SURE.droite) / 2;

// Sous-titres dans le tiers inférieur (dès 1280 px), deux lignes au plus, au-dessus de la limite basse.
// Largeur ≤ 80 % de l'image (864 px), centrée dans la zone sûre.
export const SOUS_TITRES = {haut: 1296, gauche: 70, largeur: 860, tailleMax: 94};
// Onde sonore (plein écran seulement) juste au-dessus des sous-titres.
export const ONDE = {centre: 1236, hauteurMax: 70};
export const TITRE = {haut: ZONE_SURE.haut + 10};
// Panneau sombre du tiers supérieur. Le haut de la tête est à ~553 px (541 px avec le zoom de 6 %) :
// le panneau s'arrête à 520 px. Texte de tous les panneaux : 76 px (textes courts, 2 lignes au plus).
export const PANNEAU = {haut: ZONE_SURE.haut, hauteur: 320, tailleTexte: 76};
// Visage dans l'image recadrée : centre du léger zoom avant.
export const VISAGE = {x: 540, y: 760};
export const ZOOM_SERRE = 1.11;
export const ZOOM_SERRE_PANNEAU = 1.06; // zoom limité quand un panneau est affiché

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

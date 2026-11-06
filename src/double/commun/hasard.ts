// Copié du dépôt montage-videos (serie-animee, branche claude/pub-formation-v2) pour la vidéo de test automatique.
// Pseudo-aléatoire déterministe : chaque rendu donne exactement la même image.
export const hasard = (graine: number) => {
  const x = Math.sin(graine * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

import {Img, staticFile} from 'remotion';
import {COULEURS, MISE_EN_PAGE} from '../theme';

// Logo discret, présent pendant toute la vidéo.
// Position réglable : l'épisode 2 le place sous les 10 % du haut (zone sûre TikTok).
export const LogoCoin: React.FC<{opacite?: number; position?: {x: number; y: number; taille: number}}> = ({
  opacite = 0.9,
  position = MISE_EN_PAGE.logo,
}) => {
  const {x, y, taille} = position;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: taille,
        height: taille,
        borderRadius: taille * 0.21,
        overflow: 'hidden',
        opacity: opacite,
        boxShadow: `0 0 0 2px ${COULEURS.or}55, 0 8px 24px #0008`,
      }}
    >
      <Img src={staticFile('marque/logo.jpg')} style={{width: '100%', height: '100%'}} />
    </div>
  );
};

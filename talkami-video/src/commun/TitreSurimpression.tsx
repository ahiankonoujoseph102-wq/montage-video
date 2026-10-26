import {COULEURS, MISE_EN_PAGE, POLICE} from '../theme';
import {prog} from './temps';

// Titre de l'épisode en surimpression sur l'écran pendant les 2 premières
// secondes : la vidéo commence directement sur le personnage qui parle.
// L'image 0 sert de miniature TikTok : le titre y est déjà entièrement lisible.
export const DUREE_TITRE = 2;

export const TitreSurimpression: React.FC<{t: number; format: string; numero: number; titre: React.ReactNode}> = ({t, format, numero, titre}) => {
  const sortie = prog(t, DUREE_TITRE - 0.35, DUREE_TITRE);
  if (sortie >= 1) return null;
  const {x, y, l, h} = MISE_EN_PAGE.ecran;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 18,
        top: y - 18,
        width: l + 36,
        height: h + 36,
        borderRadius: 22,
        background: `linear-gradient(160deg, #1b1f63 0%, ${COULEURS.nuit} 75%)`,
        boxShadow: `0 0 0 4px ${COULEURS.or}, 0 20px 60px #000a`,
        opacity: 1 - sortie,
        transform: `scale(${1 - sortie * 0.06})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        fontFamily: POLICE,
        textAlign: 'center',
      }}
    >
      <div style={{padding: '10px 30px', borderRadius: 999, background: COULEURS.violet, color: COULEURS.nuit, fontWeight: 800, fontSize: 42}}>
        {format} · Épisode {numero}
      </div>
      <div style={{color: COULEURS.blanc, fontWeight: 800, fontSize: 96, lineHeight: 1.04, padding: '0 40px', letterSpacing: -1}}>{titre}</div>
    </div>
  );
};

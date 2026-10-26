import {COULEURS, MISE_EN_PAGE, POLICE} from '../theme';

export type Mot = {texte: string; cle?: 'or' | 'violet'};

// Sous-titre : gros caractères, contour épais, mots-clés en couleur.
export const SousTitre: React.FC<{mots: Mot[]}> = ({mots}) => {
  const {basMax, taillePolice} = MISE_EN_PAGE.sousTitres;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        bottom: 1920 - basMax,
        textAlign: 'center',
        fontFamily: POLICE,
        fontWeight: 800,
        fontSize: taillePolice,
        lineHeight: 1.12,
        color: COULEURS.blanc,
        WebkitTextStroke: `14px ${COULEURS.nuit}`,
        paintOrder: 'stroke fill',
        textShadow: '0 6px 18px #000a',
        letterSpacing: -0.5,
      }}
    >
      {mots.map((m, i) => (
        <span key={i} style={{color: m.cle ? COULEURS[m.cle] : undefined}}>
          {m.texte}
          {i < mots.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
};

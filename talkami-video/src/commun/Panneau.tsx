import {interpolate} from 'remotion';
import {COULEURS, POLICE} from '../theme';
import {CadreEcran} from './Ecran';
import {pop} from './temps';

// Panneau dessiné sur l'écran du décor (parties sans capture) :
//   etape  : « Étape N » + intitulé ;   titre/texte : une idée forte ;
//   liste  : les étapes de la méthode, qui apparaissent une à une.
// Texte ≥ 36 px, rien d'imitant une application existante.
export type ContenuPanneau = {etape?: number; titre?: string; texte?: string; liste?: string[]};

export const Panneau: React.FC<{contenu: ContenuPanneau; t: number}> = ({contenu, t}) => {
  // t : secondes depuis le début du plan
  if (contenu.liste) {
    return (
      <CadreEcran titre="Ma méthode" droite="5 étapes">
        <div style={{padding: '18px 34px', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: POLICE}}>
          {contenu.liste.map((ligne, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: interpolate(t, [0.25 * i, 0.25 * i + 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
              <div style={{width: 74, height: 74, borderRadius: 16, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: COULEURS.nuit, fontWeight: 800, fontSize: 44, display: 'grid', placeItems: 'center'}}>
                {i + 1}
              </div>
              <div style={{color: COULEURS.blanc, fontWeight: 700, fontSize: 40}}>{ligne}</div>
            </div>
          ))}
        </div>
      </CadreEcran>
    );
  }
  return (
    <CadreEcran titre="Lomé IA School" droite={contenu.etape ? 'Ma méthode' : ''}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, fontFamily: POLICE, textAlign: 'center', padding: '0 50px'}}>
        {contenu.etape ? (
          <div style={{transform: `scale(${pop(t, 0.05, 0.35)})`, padding: '14px 44px', borderRadius: 22, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: COULEURS.nuit, fontWeight: 800, fontSize: 92}}>
            Étape {contenu.etape}
          </div>
        ) : null}
        {contenu.titre ? <div style={{color: COULEURS.or, fontWeight: 800, fontSize: 60, lineHeight: 1.1, transform: `scale(${pop(t, 0.05, 0.35)})`}}>{contenu.titre}</div> : null}
        {contenu.texte ? (
          <div style={{color: COULEURS.blanc, fontWeight: 700, fontSize: contenu.etape ? 54 : 44, lineHeight: 1.15, opacity: interpolate(t, [0.25, 0.45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            {contenu.texte}
          </div>
        ) : null}
      </div>
    </CadreEcran>
  );
};

import {COULEURS, MISE_EN_PAGE, POLICE} from '../theme';

// Briques du grand écran : interface d'assistant IA générique (aucune marque).
// Tailles de texte pensées pour un téléphone (≥ 36 px sur une image 1080 px de large).

export const LIGNES_RTCF = [
  {lettre: 'R', mot: 'Rôle', texte: 'Tu es un expert en marketing.'},
  {lettre: 'T', mot: 'Tâche', texte: 'Écris une publicité pour ma boutique de chaussures.'},
  {lettre: 'C', mot: 'Contexte', texte: 'Mes clients sont des jeunes de Lomé, entre 20 et 35 ans.'},
  {lettre: 'F', mot: 'Format', texte: 'Trois phrases courtes, avec une invitation à m’écrire sur WhatsApp.'},
];

export const TAILLES = {texte: 36, etiquette: 29, tuile: 84, lettreTuile: 53, titre: 31, barre: 66} as const;

// Cadre de l'écran : barre de titre + zone de contenu (position absolue dans l'image).
export const CadreEcran: React.FC<{titre?: string; droite?: React.ReactNode; lueur?: boolean; children?: React.ReactNode}> = ({
  titre = 'Assistant IA',
  droite,
  lueur = true,
  children,
}) => {
  const {x, y, l, h} = MISE_EN_PAGE.ecran;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: l,
        height: h,
        borderRadius: 14,
        overflow: 'hidden',
        fontFamily: POLICE,
        background: `linear-gradient(160deg, #101a4d 0%, ${COULEURS.nuit} 70%)`,
        boxShadow: lueur ? `0 0 90px ${COULEURS.violet}40` : undefined,
      }}
    >
      <div
        style={{
          height: TAILLES.barre,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 26px',
          background: '#ffffff0d',
          borderBottom: '1px solid #ffffff14',
          color: COULEURS.blanc,
          fontWeight: 700,
          fontSize: TAILLES.titre,
        }}
      >
        <Etoile taille={34} />
        {titre}
        <span style={{marginLeft: 'auto', color: COULEURS.grisTexte, fontWeight: 500, fontSize: 26}}>{droite}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: TAILLES.barre, bottom: 0}}>{children}</div>
    </div>
  );
};

export type EtatTuile = 'cachee' | 'vide' | 'passee' | 'active';

export const Tuile: React.FC<{lettre: string; etat: EtatTuile; taille?: number; style?: React.CSSProperties}> = ({
  lettre,
  etat,
  taille = TAILLES.tuile,
  style,
}) => (
  <div
    style={{
      flex: '0 0 auto',
      width: taille,
      height: taille,
      borderRadius: taille * 0.21,
      display: 'grid',
      placeItems: 'center',
      fontSize: taille * 0.63,
      fontWeight: 800,
      boxSizing: 'border-box',
      color: etat === 'vide' ? COULEURS.violet : COULEURS.nuit,
      border: etat === 'vide' ? `3px dashed ${COULEURS.violet}` : undefined,
      background:
        etat === 'active'
          ? `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`
          : etat === 'passee'
            ? COULEURS.violet
            : 'transparent',
      opacity: etat === 'cachee' ? 0 : 1,
      ...style,
    }}
  >
    {lettre}
  </div>
);

// Image fixe de référence (aperçus) : les quatre lignes écrites, F en cours.
export const Ecran: React.FC<{etape?: number}> = ({etape = 3}) => (
  <CadreEcran droite="Formule R · T · C · F">
    <div style={{padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14}}>
      {LIGNES_RTCF.slice(0, etape + 1).map((li, i) => (
        <LigneFormule key={li.lettre} lettre={li.lettre} mot={li.mot} texte={li.texte} etat={i === etape ? 'active' : 'passee'} curseur={i === etape} />
      ))}
    </div>
  </CadreEcran>
);

export const LigneFormule: React.FC<{
  lettre: string;
  mot: string;
  texte: React.ReactNode;
  etat: EtatTuile;
  curseur?: boolean;
  opaciteMot?: number;
}> = ({lettre, mot, texte, etat, curseur, opaciteMot = 1}) => (
  <div style={{display: 'flex', gap: 20, alignItems: 'flex-start', opacity: etat === 'passee' ? 0.72 : 1}}>
    <Tuile lettre={lettre} etat={etat} />
    <div style={{color: COULEURS.blanc, fontSize: TAILLES.texte, lineHeight: 1.22, minHeight: TAILLES.tuile}}>
      <div style={{color: etat === 'active' ? COULEURS.or : COULEURS.violet, fontWeight: 700, fontSize: TAILLES.etiquette, lineHeight: 1.15, opacity: opaciteMot}}>
        {mot}
      </div>
      <span style={{fontWeight: 500}}>
        {texte}
        {curseur ? <span style={{color: COULEURS.or}}>▍</span> : null}
      </span>
    </div>
  </div>
);

// Étoile à quatre branches, reprise du logo.
export const Etoile: React.FC<{taille: number; couleur?: string}> = ({taille, couleur = COULEURS.violet}) => (
  <svg width={taille} height={taille} viewBox="-10 -10 20 20">
    <path d="M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10Z" fill={couleur} />
  </svg>
);

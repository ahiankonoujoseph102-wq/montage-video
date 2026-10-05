import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, POLICE, SOUS_TITRES} from '../charte';
import type {Mot} from '../types';

const ESPACE_MOTS = 0.42; // en fraction de la taille du texte
const INTERLIGNE = 1.2;
const MAINTIEN_APRES = 20; // le groupe reste affiché 20 images après son dernier mot

// Nombre de lignes une fois les mots placés dans la largeur des sous-titres (police chargée, voir Montage.tsx).
const nbLignes = (mots: string[], taille: number) => {
  const largeurs = mots.map((m) => measureText({text: m.toUpperCase(), fontFamily: POLICE, fontSize: taille,
    fontWeight: '900'}).width + 6); // + contour
  const espace = taille * ESPACE_MOTS;
  let lignes = 1;
  let courant = 0;
  for (const l of largeurs) {
    if (l > SOUS_TITRES.largeur) return Infinity;
    if (courant > 0 && courant + espace + l > SOUS_TITRES.largeur) {
      lignes++;
      courant = l;
    } else {
      courant = courant > 0 ? courant + espace + l : l;
    }
  }
  return lignes;
};

// Plus grande taille (par pas de 2 px) qui tient en deux lignes.
const tailleGroupe = (mots: string[]) => {
  for (let t = SOUS_TITRES.tailleMax; t > 40; t -= 2) if (nbLignes(mots, t) <= 2) return t;
  return 40;
};

export const SousTitres: React.FC<{mots: Mot[]; groupes: number[][]; masques: number[]; masquerAvant?: number}> = ({
  mots, groupes, masques, masquerAvant = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < masquerAvant) return null; // titre géant affiché : pas de sous-titres

  let g = -1;
  for (let i = 0; i < groupes.length; i++) if (mots[groupes[i][0]].debut <= frame) g = i;
  // Groupe masqué : il répète mot pour mot le texte affiché en grand (plein écran).
  if (g < 0 || masques.includes(g)) return null;
  const groupe = groupes[g];
  if (frame > mots[groupe[groupe.length - 1]].fin + MAINTIEN_APRES) return null;

  const taille = tailleGroupe(groupe.map((i) => mots[i].mot));
  // Mot par mot, mais jamais un mot seul à l'écran : le 2e mot du groupe apparaît avec le 1er.
  const apparition = (k: number) => (k === 1 ? mots[groupe[0]].debut : mots[groupe[k]].debut);

  return (
    <div
      style={{
        position: 'absolute',
        top: SOUS_TITRES.haut,
        left: SOUS_TITRES.gauche,
        width: SOUS_TITRES.largeur,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        // Espace proportionnel à la taille du texte : un écart fixe paraît collé avec des
        // capitales très grasses à contour, surtout quand le mot finit son apparition.
        columnGap: Math.round(taille * ESPACE_MOTS),
        rowGap: 0,
      }}
    >
      {groupe.map((i, k) => {
        const debut = apparition(k);
        if (debut > frame) return null;
        const m = mots[i];
        const pop = spring({frame: frame - debut, fps, config: {damping: 14, stiffness: 220, overshootClamping: true}});
        return (
          <span
            key={i}
            style={{
              fontFamily: POLICE,
              fontWeight: 900,
              fontSize: taille,
              lineHeight: INTERLIGNE,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              color: m.cle ? JAUNE : BLANC,
              textDecoration: m.cle ? 'underline' : 'none',
              textDecorationColor: JAUNE,
              textDecorationThickness: Math.round(taille / 11),
              textUnderlineOffset: Math.round(taille / 7),
              textDecorationSkipInk: 'none',
              display: 'inline-block',
              transform: `scale(${0.85 + 0.15 * pop}) translateY(${(1 - pop) * 14}px)`,
              opacity: Math.min(1, pop * 1.5),
              ...contour,
            }}
          >
            {m.mot}
          </span>
        );
      })}
    </div>
  );
};

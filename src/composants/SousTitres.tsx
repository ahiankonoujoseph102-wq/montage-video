import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, POLICE, SOUS_TITRES} from '../charte';
import type {Mot} from '../types';

const TAILLE_MAX = 82;
const ESPACE_MOTS = 0.42; // en fraction de la taille du texte
const MAINTIEN_APRES = 20; // le groupe reste affiché 20 images après son dernier mot

export const SousTitres: React.FC<{mots: Mot[]; groupes: number[][]}> = ({mots, groupes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  let g = -1;
  for (let i = 0; i < groupes.length; i++) if (mots[groupes[i][0]].debut <= frame) g = i;
  if (g < 0) return null;
  const groupe = groupes[g];
  if (frame > mots[groupe[groupe.length - 1]].fin + MAINTIEN_APRES) return null;

  // Taille réduite si un mot est trop long pour la largeur (ex. un numéro de téléphone).
  // Et réduite si le groupe entier tiendrait sur plus de deux lignes.
  const plusLong = Math.max(...groupe.map((i) => mots[i].mot.length));
  const total = groupe.reduce((n, i) => n + mots[i].mot.length + 1, 0);
  const taille = Math.min(TAILLE_MAX, SOUS_TITRES.largeur / (plusLong * 0.8), (2 * SOUS_TITRES.largeur) / (total * 0.84));

  return (
    <div
      style={{
        position: 'absolute',
        top: SOUS_TITRES.haut,
        left: (1080 - SOUS_TITRES.largeur) / 2,
        width: SOUS_TITRES.largeur,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        // Espace proportionnel à la taille du texte : un écart fixe paraît collé avec des
        // capitales très grasses à contour, surtout quand le mot finit son apparition.
        columnGap: Math.round(taille * ESPACE_MOTS),
        rowGap: 6,
      }}
    >
      {groupe
        .filter((i) => mots[i].debut <= frame)
        .map((i) => {
          const m = mots[i];
          const pop = spring({frame: frame - m.debut, fps, config: {damping: 14, stiffness: 220, overshootClamping: true}});
          return (
            <span
              key={i}
              style={{
                fontFamily: POLICE,
                fontWeight: 900,
                fontSize: taille,
                lineHeight: 1.2,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: m.cle ? JAUNE : BLANC,
                textDecoration: m.cle ? 'underline' : 'none',
                textDecorationColor: JAUNE,
                textDecorationThickness: 8,
                textUnderlineOffset: 12,
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

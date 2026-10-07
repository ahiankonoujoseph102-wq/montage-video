import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CENTRE_X, POLICE, ZONE_SURE} from '../charte';
import type {Mot} from '../types';

// Style dynamique : un seul mot à la fois, en gros, bleu vif à contour blanc épais, sur le bas du buste,
// avec un petit rebond à l'apparition.
const BLEU = '#1E5BFF';
const HAUT = 1330;
const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 60;
const TAILLE_MAX = 130;
const MAINTIEN = 12; // images : le dernier mot d'une phrase reste un peu affiché

export const SousTitresMot: React.FC<{mots: Mot[]; masques: [number, number][]}> = ({mots, masques}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (masques.some(([a, b]) => f >= a && f < b)) return null;
  let i = -1;
  for (let k = 0; k < mots.length; k++) if (mots[k].debut <= f) i = k;
  if (i < 0) return null;
  const m = mots[i];
  const suivant = mots[i + 1];
  if (f > m.fin + MAINTIEN && (!suivant || suivant.debut > f)) return null;
  const texte = m.mot.toUpperCase();
  const taille = Math.min(TAILLE_MAX, fitText({text: texte, withinWidth: LARGEUR, fontFamily: POLICE, fontWeight: 900,
    validateFontIsLoaded: true}).fontSize);
  const rebond = spring({frame: f - m.debut, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  const echelle = interpolate(rebond, [0, 1], [0.55, 1]);
  return (
    <div style={{position: 'absolute', top: HAUT, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, display: 'flex',
      justifyContent: 'center'}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1, color: BLEU,
        whiteSpace: 'nowrap', WebkitTextStroke: `${Math.round(taille * 0.2)}px #fff`, paintOrder: 'stroke fill',
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))', transform: `scale(${echelle})`, display: 'inline-block'}}>
        {texte}
      </span>
    </div>
  );
};

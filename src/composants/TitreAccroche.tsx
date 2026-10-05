import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, POLICE, TITRE, ZONE_SURE} from '../charte';
import type {Titre} from '../types';

const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 60; // largeur du texte, dans la zone sûre
const TAILLE_MAX = 150;
const ESPACE_MOTS = 0.3; // en fraction de la taille du texte, proche d'une espace normale

const normaliser = (m: string) => m.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// Titre d'accroche : une ligne par entrée de `lignes`, chacune ajustée à presque toute la largeur.
// Les mots arrivent un par un, puis le bloc s'efface.
export const TitreAccroche: React.FC<{titre: Titre}> = ({titre}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const duree = Math.round(titre.duree * fps);
  if (frame >= duree) return null;
  const cles = new Set(titre.motsCles.map(normaliser));
  const sortie = interpolate(frame, [duree - 8, duree], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const entree = spring({frame, fps, config: {damping: 16, overshootClamping: true}});

  let rang = 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: TITRE.haut,
        left: ZONE_SURE.gauche,
        width: ZONE_SURE.droite - ZONE_SURE.gauche,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: sortie,
        transform: `translateY(${(1 - entree) * -60 - (1 - sortie) * 30}px)`,
      }}
    >
      <div style={{background: 'rgba(8,10,30,0.72)', borderRadius: 36, borderBottom: `10px solid ${JAUNE}`,
        padding: '22px 30px 26px', width: LARGEUR + 60, boxSizing: 'border-box'}}>
        {titre.lignes.map((ligne, l) => {
          const texte = ligne.toUpperCase();
          const {fontSize} = fitText({text: texte, withinWidth: LARGEUR * 0.97, fontFamily: POLICE, fontWeight: 900, validateFontIsLoaded: true});
          const taille = Math.min(TAILLE_MAX, fontSize);
          return (
            <div key={l} style={{display: 'flex', justifyContent: 'center', columnGap: taille * ESPACE_MOTS}}>
              {texte.split(' ').map((mot, i) => {
                const pop = spring({frame: frame - 3 - rang++ * 3, fps, config: {damping: 12, stiffness: 200, overshootClamping: true}});
                const cle = cles.has(normaliser(mot));
                return (
                  <span key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.12,
                    color: cle ? JAUNE : BLANC, textDecoration: cle ? 'underline' : 'none',
                    textDecorationThickness: Math.round(taille / 11), textUnderlineOffset: Math.round(taille / 8),
                    display: 'inline-block', whiteSpace: 'nowrap', opacity: pop,
                    transform: `scale(${0.85 + 0.15 * pop})`, ...contour, WebkitTextStroke: '0px'}}>
                    {mot}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

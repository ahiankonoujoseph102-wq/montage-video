import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, POLICE, ZONE_SURE} from '../charte';
import type {Carton} from '../types';
import {FondAnime} from './FondAnime';

const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 40;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Carton de fin plein écran : grand titre, puis les lignes d'information une à une.
export const CartonFin: React.FC<{carton: Carton}> = ({carton}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ouverture = interpolate(f, [0, 10], [0, 1], clamp);
  // Titre ligne par ligne (« \n » dans montage.json), chaque ligne ajustée à la largeur.
  const lignesTitre = carton.titre.toUpperCase().split('\n');
  const taillesTitre = lignesTitre.map((l) => Math.min(170, fitText({text: l, withinWidth: LARGEUR, fontFamily: POLICE,
    fontWeight: 900, validateFontIsLoaded: true}).fontSize));
  const popTitre = spring({frame: f - 4, fps, config: {damping: 14, overshootClamping: true}});

  return (
    <AbsoluteFill style={{clipPath: `circle(${ouverture * 120}% at 50% 40%)`}}>
      <FondAnime fond={carton.fond} />
      <div style={{position: 'absolute', top: ZONE_SURE.haut, bottom: 1920 - ZONE_SURE.bas, left: ZONE_SURE.gauche,
        width: ZONE_SURE.droite - ZONE_SURE.gauche, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 34}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: popTitre,
          transform: `scale(${0.8 + 0.2 * popTitre})`, borderBottom: `10px solid ${BLANC}`, paddingBottom: 14,
          marginBottom: 20}}>
          {lignesTitre.map((l, i) => (
            <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taillesTitre[i], lineHeight: 1.0,
              color: JAUNE, whiteSpace: 'nowrap', ...contour, WebkitTextStroke: '0px'}}>
              {l}
            </div>
          ))}
        </div>
        {carton.lignes.map((ligne, i) => {
          const s = spring({frame: f - 12 - i * 6, fps, config: {damping: 15, overshootClamping: true}});
          const derniere = i === carton.lignes.length - 1;
          const taille = Math.min(80, fitText({text: ligne, withinWidth: LARGEUR - (derniere ? 100 : 0),
            fontFamily: POLICE, fontWeight: 900, validateFontIsLoaded: true}).fontSize);
          return (
            <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.1,
              whiteSpace: 'nowrap', opacity: s, transform: `translateY(${(1 - s) * 30}px)`,
              ...(derniere
                ? {color: '#0B1026', background: JAUNE, borderRadius: 999, padding: '14px 50px', marginTop: 16}
                : {color: BLANC, textShadow: '0 4px 14px rgba(0,0,0,0.5)'})}}>
              {ligne}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

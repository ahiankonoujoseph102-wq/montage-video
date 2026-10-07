import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CENTRE_X, JAUNE, POLICE, ZONE_SURE} from '../charte';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HAUT = 1110; // sur le buste de l'extrait, entre le visage et ses sous-titres
const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 80;

// Extrait de preuve (une autre vidéo montée, insérée en plein écran) : flash très bref à l'entrée et
// étiquette qui claque (trop grosse puis se pose), légèrement inclinée.
export const Preuve: React.FC<{etiquette: string}> = ({etiquette}) => {
  const f = useCurrentFrame();
  const taille = Math.min(84, fitText({text: etiquette, withinWidth: LARGEUR - 60, fontFamily: POLICE, fontWeight: 900,
    validateFontIsLoaded: true}).fontSize);
  const claque = interpolate(f, [1, 5], [1.45, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <>
      {f < 2 ? <AbsoluteFill style={{background: 'white', opacity: f === 0 ? 0.45 : 0.2}} /> : null}
      <div style={{position: 'absolute', top: HAUT, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, display: 'flex',
        justifyContent: 'center', visibility: f < 1 ? 'hidden' : 'visible',
        transform: `rotate(-3deg) scale(${claque})`}}>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.1, color: '#000',
          background: JAUNE, padding: '14px 30px', borderRadius: 18, whiteSpace: 'nowrap',
          border: '6px solid #000', boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
          {etiquette}
        </div>
      </div>
    </>
  );
};

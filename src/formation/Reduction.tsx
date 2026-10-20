import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FondNuit} from './commun';

// Tout le contenu (plans, studio, double) est réduit à 87,5 % autour du haut de la zone sûre (y 200) : il s'arrête à
// y 1364 et laisse la bande 1376–1530 aux sous-titres, au-dessus des 20 % du bas que la description TikTok recouvre.
// Le fond bleu nuit remplit le pourtour ; les bords du contenu réduit s'y fondent.
export const REDUCTION = 0.875;
export const BAS_CONTENU = 200 + 1330 * REDUCTION;
const FONDU = 'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)';
const FONDU_V = 'linear-gradient(to bottom, #000 0, #000 95%, transparent 100%)';

export const Reduction: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <FondNuit />
    <AbsoluteFill style={{transform: `scale(${REDUCTION})`, transformOrigin: '540px 200px'}}>
      <AbsoluteFill style={{WebkitMaskImage: FONDU, maskImage: FONDU}}>
        <AbsoluteFill style={{WebkitMaskImage: FONDU_V, maskImage: FONDU_V}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  </AbsoluteFill>
);

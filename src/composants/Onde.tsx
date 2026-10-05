import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CENTRE_X, ONDE} from '../charte';

const LARGEUR_BARRE = 10;
const ECART = 8;

// Petite onde sonore : les bandes de fréquence de la voix, en miroir autour du centre.
export const Onde: React.FC<{onde: number[][]}> = ({onde}) => {
  const frame = useCurrentFrame();
  const bandes = onde[Math.min(frame, onde.length - 1)] ?? [];
  const barres = [...[...bandes].reverse(), ...bandes];
  const largeur = barres.length * (LARGEUR_BARRE + ECART) - ECART;
  return (
    <div
      style={{
        position: 'absolute',
        top: ONDE.centre - ONDE.hauteurMax / 2,
        left: CENTRE_X - largeur / 2,
        width: largeur,
        height: ONDE.hauteurMax,
        display: 'flex',
        alignItems: 'center',
        gap: ECART,
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.55))',
      }}
    >
      {barres.map((v, i) => (
        <div
          key={i}
          style={{
            width: LARGEUR_BARRE,
            height: LARGEUR_BARRE + (v / 100) * (ONDE.hauteurMax - LARGEUR_BARRE),
            borderRadius: LARGEUR_BARRE / 2,
            background: 'rgba(255,255,255,0.92)',
          }}
        />
      ))}
    </div>
  );
};

import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, POLICE, TITRE} from '../charte';
import type {Titre} from '../types';

const normaliser = (m: string) => m.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// Titre d'accroche : les mots arrivent un par un, puis le bloc s'efface.
export const TitreAccroche: React.FC<{titre: Titre}> = ({titre}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const duree = Math.round(titre.duree * fps);
  if (frame >= duree) return null;
  const cles = new Set(titre.motsCles.map(normaliser));
  const sortie = interpolate(frame, [duree - 8, duree], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const entree = spring({frame, fps, config: {damping: 16}});

  return (
    <div
      style={{
        position: 'absolute',
        top: TITRE.haut,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'center',
        opacity: sortie,
        transform: `translateY(${(1 - entree) * -60 - (1 - sortie) * 30}px)`,
      }}
    >
      <div
        style={{
          background: 'rgba(8,10,30,0.72)',
          borderRadius: 32,
          borderBottom: `8px solid ${JAUNE}`,
          padding: '26px 36px 30px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 18,
          rowGap: 4,
        }}
      >
        {titre.texte.split(' ').map((mot, i) => {
          const pop = spring({frame: frame - 4 - i * 3, fps, config: {damping: 12, stiffness: 200}, overshootClamping: true});
          const cle = cles.has(normaliser(mot));
          return (
            <span
              key={i}
              style={{
                fontFamily: POLICE,
                fontWeight: 900,
                fontSize: 74,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                color: cle ? JAUNE : BLANC,
                textDecoration: cle ? 'underline' : 'none',
                textDecorationThickness: 8,
                textUnderlineOffset: 10,
                display: 'inline-block',
                opacity: pop,
                transform: `scale(${0.5 + 0.5 * pop})`,
                ...contour,
                WebkitTextStroke: '0px',
              }}
            >
              {mot}
            </span>
          );
        })}
      </div>
    </div>
  );
};

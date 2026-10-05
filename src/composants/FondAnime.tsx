import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONDS} from '../charte';
import type {Fond} from '../types';

// Dégradé animé : l'angle tourne lentement et deux halos lumineux dérivent.
export const FondAnime: React.FC<{fond: Fond}> = ({fond}) => {
  const f = useCurrentFrame();
  const [a, b, c] = FONDS[fond];
  const angle = 160 + f * 0.8;
  const x1 = 30 + Math.sin(f / 40) * 25;
  const y1 = 25 + Math.cos(f / 50) * 15;
  const x2 = 70 + Math.cos(f / 45) * 25;
  const y2 = 75 + Math.sin(f / 35) * 15;
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(circle at ${x1}% ${y1}%, ${b}cc 0%, transparent 45%)`,
          `radial-gradient(circle at ${x2}% ${y2}%, ${c}cc 0%, transparent 50%)`,
          `linear-gradient(${angle}deg, ${a} 0%, ${b} 55%, ${c} 100%)`,
        ].join(','),
      }}
    />
  );
};

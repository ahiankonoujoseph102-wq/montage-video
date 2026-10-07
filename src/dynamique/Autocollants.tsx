import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ZONE_SURE} from '../charte';
import type {Dynamique, TypeAutocollant} from '../types';

// Autocollants dessinés (style « sticker » : formes pleines, contour blanc épais, ombre), posés près de la tête.
const TAILLE = 320;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const dessin = (type: TypeAutocollant) => {
  const contour = {stroke: '#fff', strokeWidth: 9, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const};
  switch (type) {
    case 'interrogation':
      return (
        <g {...contour}>
          <path d="M55 42 C55 18 78 8 100 8 C126 8 146 24 146 48 C146 76 112 82 112 108 L112 120 L84 120 L84 104 C84 72 118 66 118 48 C118 36 110 30 100 30 C88 30 82 38 82 48 Z" fill="#111" transform="translate(-8 14) rotate(-12 100 70)" />
          <circle cx="92" cy="160" r="15" fill="#111" transform="rotate(-12 100 70)" />
          <path d="M150 70 C150 58 160 52 170 52 C182 52 190 60 190 70 C190 84 174 86 174 98 L174 104 L162 104 L162 96 C162 82 178 80 178 70 C178 64 174 62 170 62 C164 62 160 66 160 70 Z" fill="#FFD400" />
          <circle cx="168" cy="120" r="8" fill="#FFD400" />
        </g>
      );
    case 'flamme':
      return (
        <g {...contour}>
          <path d="M100 196 C52 196 30 160 38 124 C44 96 64 84 66 56 C86 72 92 92 90 108 C104 92 108 60 96 18 C140 44 168 92 164 136 C160 174 136 196 100 196 Z" fill="#FF4D00" />
          <path d="M100 190 C78 190 64 172 68 152 C72 136 84 128 86 112 C98 124 102 136 100 148 C110 140 116 124 112 104 C134 120 142 148 136 166 C130 182 118 190 100 190 Z" fill="#FFC400" />
        </g>
      );
    case 'eclair':
      return <path d="M118 6 L44 116 L96 116 L76 196 L158 78 L104 78 L128 6 Z" fill="#FFD400" {...contour} />;
    case 'ampoule':
      return (
        <g {...contour}>
          <path d="M100 14 C140 14 166 44 166 80 C166 108 148 124 138 138 C132 148 130 156 130 164 L70 164 C70 156 68 148 62 138 C52 124 34 108 34 80 C34 44 60 14 100 14 Z" fill="#FFE14D" />
          <rect x="70" y="164" width="60" height="30" rx="8" fill="#9AA3B5" />
          <path d="M100 40 L100 20 M50 52 L36 42 M150 52 L164 42" stroke="#fff" fill="none" />
        </g>
      );
    case 'billets':
    case 'billetsBarres':
      return (
        <g {...contour}>
          <rect x="18" y="60" width="150" height="86" rx="10" fill="#2FAF5A" transform="rotate(-14 93 103)" />
          <rect x="34" y="70" width="150" height="86" rx="10" fill="#3CCB6C" transform="rotate(6 109 113)" />
          <circle cx="109" cy="113" r="24" fill="#1F8A45" transform="rotate(6 109 113)" />
          <text x="109" y="125" textAnchor="middle" fontSize="34" fontWeight="900" fill="#fff" stroke="none"
            fontFamily="Montserrat" transform="rotate(6 109 113)">F</text>
          {type === 'billetsBarres' ? (
            <path d="M24 30 L178 186 M178 30 L24 186" stroke="#FF2D2D" strokeWidth={22} strokeLinecap="round" fill="none" />
          ) : null}
        </g>
      );
    case 'coche':
      return (
        <g {...contour}>
          <circle cx="100" cy="100" r="84" fill="#22C55E" />
          <path d="M58 102 L88 132 L144 70" stroke="#fff" strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
      );
    case 'croix':
      return (
        <g {...contour}>
          <circle cx="100" cy="100" r="84" fill="#FF2D2D" />
          <path d="M66 66 L134 134 M134 66 L66 134" stroke="#fff" strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
      );
  }
};

const Autocollant: React.FC<{a: Dynamique['autocollants'][number]; tete: Dynamique['tete']}> = ({a, tete}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = f - a.debut;
  const pop = spring({frame: local, fps, config: {damping: 8, stiffness: 240, mass: 0.6}});
  const sortie = interpolate(f, [a.fin - 5, a.fin], [1, 0], clamp);
  const balance = Math.sin(local / 5) * 6;
  const flotte = Math.sin(local / 9) * 8;
  // À côté de la tête, à hauteur du front, toujours dans la zone sûre.
  const decal = 270;
  const cx = Math.min(ZONE_SURE.droite - TAILLE / 2 - 10, Math.max(ZONE_SURE.gauche + TAILLE / 2 + 10,
    tete.x + (a.cote === 'droite' ? decal : -decal)));
  const cy = Math.max(ZONE_SURE.haut + TAILLE / 2, tete.y - 150);
  return (
    <div style={{position: 'absolute', left: cx - TAILLE / 2, top: cy - TAILLE / 2 + flotte, width: TAILLE, height: TAILLE,
      transform: `scale(${pop * sortie}) rotate(${(a.cote === 'droite' ? 8 : -8) + balance}deg)`,
      filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.45))'}}>
      <svg viewBox="0 0 200 200" width={TAILLE} height={TAILLE} style={{overflow: 'visible'}}>{dessin(a.type)}</svg>
    </div>
  );
};

export const Autocollants: React.FC<{dyn: Dynamique}> = ({dyn}) => {
  const f = useCurrentFrame();
  return (
    <>
      {dyn.autocollants.filter((a) => f >= a.debut && f < a.fin).map((a, i) => (
        <Autocollant key={`${a.debut}-${i}`} a={a} tete={dyn.tete} />
      ))}
    </>
  );
};

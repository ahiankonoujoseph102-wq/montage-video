import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import type {Dynamique} from '../types';

// Transitions du style dynamique, appliquées à l'image de la prise autour d'une coupe (image `image`).
// Elles renvoient le style à appliquer à la couche vidéo, et un éventuel fond (image dans l'image).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const DUREE = {flou: [4, 6], bascule: [5, 5], zoom: [3, 8], image: [0, 22]} as const;

export const transitionEnCours = (dyn: Dynamique | null | undefined, f: number) =>
  dyn?.transitions.find((t) => f >= t.image - DUREE[t.type][0] && f < t.image + DUREE[t.type][1]);

export const styleTransition = (t: Dynamique['transitions'][number], f: number): React.CSSProperties => {
  const d = f - t.image;
  switch (t.type) {
    case 'flou': {
      const p = d < 0 ? interpolate(d, [-4, 0], [0, 1], clamp) : interpolate(d, [0, 6], [1, 0], clamp);
      return {filter: `blur(${p * 28}px)`, transform: `scale(${1 + 0.08 * p}) translateX(${(d < 0 ? -1 : 1) * p * 60}px)`};
    }
    case 'bascule': {
      const angle = d < 0 ? interpolate(d, [-5, 0], [0, 88], {...clamp, easing: Easing.in(Easing.cubic)})
        : interpolate(d, [0, 5], [-88, 0], {...clamp, easing: Easing.out(Easing.cubic)});
      return {transform: `perspective(1400px) rotateY(${angle}deg)`};
    }
    case 'zoom': {
      const p = d < 0 ? interpolate(d, [-3, 0], [0, 1], clamp) : interpolate(d, [0, 8], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
      return {transform: `scale(${1 + 0.32 * p})`, filter: `blur(${p * 6}px)`};
    }
    case 'image': {
      // Image dans l'image : la prise rétrécit dans un cadre blanc incliné, puis revient plein cadre.
      const p = d < 11 ? interpolate(d, [0, 4], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))})
        : interpolate(d, [16, 22], [1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
      return {transform: `scale(${1 - 0.36 * p}) rotate(${-4 * p}deg)`, outline: `${Math.round(18 * p)}px solid #fff`,
        boxShadow: `0 30px 60px rgba(0,0,0,${0.5 * p})`};
    }
  }
};

// Fond flou derrière l'image dans l'image (copie floutée de la prise).
export const FondImage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{filter: 'blur(30px) brightness(0.7)', transform: 'scale(1.1)'}}>{children}</AbsoluteFill>
);

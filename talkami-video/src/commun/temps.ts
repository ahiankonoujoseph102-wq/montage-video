import {Easing, interpolate} from 'remotion';

// Progression 0 → 1 entre a et b (secondes), adoucie.
export const prog = (t: number, a: number, b: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

// Apparition « pop » : légère surélongation, puis stabilisation.
export const pop = (t: number, a: number, duree = 0.35) =>
  interpolate(t, [a, a + duree * 0.6, a + duree], [0, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const entre = (t: number, a: number, b: number) => t >= a && t < b;
